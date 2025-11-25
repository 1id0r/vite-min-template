from typing import Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data import (
    CATEGORIES,
    FLOWS,
    GENERAL_FORM_DEFINITION,
    OWNING_TEAMS,
    STEPS,
    SYSTEMS,
    build_general_form_definition,
)
from models import (
    CategoryDefinition,
    EntityConfig,
    FlowDefinition,
    FormDefinition,
    StepDefinition,
    SystemDefinition,
)

app = FastAPI(title="Entity Config API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _form_from_raw(raw: Dict) -> FormDefinition:
    return FormDefinition(**raw)


def _system_from_raw(raw: Dict) -> SystemDefinition:
    forms = {step: _form_from_raw(form) for step, form in raw.get("forms", {}).items()}
    payload = {**raw, "forms": forms}
    return SystemDefinition(**payload)


def _build_config() -> EntityConfig:
    systems = {system_id: _system_from_raw(definition) for system_id, definition in SYSTEMS.items()}
    categories = [CategoryDefinition(**category) for category in CATEGORIES]
    flows = {flow_id: FlowDefinition(**definition) for flow_id, definition in FLOWS.items()}
    steps = {step_id: StepDefinition(**definition) for step_id, definition in STEPS.items()}

    return EntityConfig(steps=steps, flows=flows, categories=categories, systems=systems)


CONFIG = _build_config()

EXISTING_DISPLAY_NAMES = {
    "Elastic Search Operations",
    "ECK Production",
    "Search Control Plane",
}
EXISTING_DISPLAY_NAMES_NORMALIZED = {name.lower() for name in EXISTING_DISPLAY_NAMES}


class ValidationRequest(BaseModel):
    value: str


class ValidationResponse(BaseModel):
    exists: bool
    valid: bool
    message: str | None = None


class TreeNode(BaseModel):
    DisplayName: str
    VID: str
    children: List["TreeNode"] = []


TreeNode.model_rebuild()


def make_id(prefix: str, parts: List[Union[str, int]]) -> str:
    return f"{prefix}-{'-'.join(str(part) for part in parts)}"


def generate_subtree(
    root_vid: Optional[str], depth: int = 3, branching: int = 3, current_depth: int = 1
) -> List[TreeNode]:
    base = root_vid or "root"
    nodes: List[TreeNode] = []

    for i in range(branching):
        vid = make_id(base, [current_depth, i])
        children: List[TreeNode] = []

        if current_depth < depth:
            children = generate_subtree(vid, depth, branching, current_depth + 1)

        nodes.append(TreeNode(DisplayName=f"Node {vid}", VID=vid, children=children))

    return nodes


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/config", response_model=EntityConfig)
async def get_config() -> EntityConfig:
    return CONFIG


@app.get("/systems", response_model=List[SystemDefinition])
async def list_systems() -> List[SystemDefinition]:
    return list(CONFIG.systems.values())


@app.get("/systems/{system_id}", response_model=SystemDefinition)
async def get_system(system_id: str) -> SystemDefinition:
    system = CONFIG.systems.get(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system


@app.get("/systems/{system_id}/forms/{step_key}", response_model=FormDefinition)
async def get_form(system_id: str, step_key: str) -> FormDefinition:
    system = CONFIG.systems.get(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    if step_key == "general":
        general_definition = build_general_form_definition(system_id)
        general_form = FormDefinition(**general_definition)
        general_form.initialData = {
            "entityType": system.label,
            "links": [{"label": "", "url": ""}],
        }
        return general_form

    form = system.forms.get(step_key)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found for step")

    return form


@app.get("/owning-teams", response_model=List[str])
async def get_owning_teams() -> List[str]:
    return OWNING_TEAMS


@app.get("/tree", response_model=List[TreeNode])
async def get_tree(
    root_id: str = Query("root", alias="rootId"), tree_depth: int = Query(3, alias="TreeDepth")
) -> List[TreeNode]:
    return generate_subtree(None if root_id == "root" else root_id, depth=tree_depth, branching=3, current_depth=1)


@app.get("/nodeApi/node", response_model=List[TreeNode])
async def get_tree_compatible(
    root_id: str = Query("root", alias="rootId"), tree_depth: int = Query(3, alias="TreeDepth")
) -> List[TreeNode]:
    return generate_subtree(None if root_id == "root" else root_id, depth=tree_depth, branching=3, current_depth=1)


@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Entity configuration service"}


@app.post("/validate/display-name", response_model=ValidationResponse)
async def validate_display_name(payload: ValidationRequest) -> ValidationResponse:
    normalized = payload.value.strip().lower()
    exists = normalized in EXISTING_DISPLAY_NAMES_NORMALIZED
    message = "Display name already exists" if exists else None
    return ValidationResponse(exists=exists, valid=not exists, message=message)


def _make_vid(prefix: str, parts: List[str | int]) -> str:
    suffix = "-".join(str(part) for part in parts)
    return f"{prefix}-{suffix}"


def _generate_subtree(
    root_vid: str | None,
    depth: int = 3,
    branching: int = 3,
    current_depth: int = 1,
) -> List[Dict]:
    base = root_vid or "root"
    nodes: List[Dict] = []

    for index in range(branching):
        vid = _make_vid(base, [current_depth, index])
        node: Dict = {
            "DisplayName": f"Node {vid}",
            "VID": vid,
            "children": [],
        }

        if current_depth < depth:
            node["children"] = _generate_subtree(vid, depth, branching, current_depth + 1)

        nodes.append(node)

    return nodes


@app.get("/tree")
async def get_tree(
    root_id: str = Query("root", alias="rootId"),
    tree_depth: int = Query(3, alias="TreeDepth"),
):
    """
    Mock tree endpoint used during development.

    The real implementation can be swapped later without impacting the client.
    """
    data = _generate_subtree(None if root_id == "root" else root_id, tree_depth, 3, 1)
    return data
