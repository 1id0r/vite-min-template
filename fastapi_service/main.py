from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import CATEGORIES, FLOWS, STEPS, SYSTEMS
from .models import (
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

    form = system.forms.get(step_key)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found for step")

    return form


@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Entity configuration service"}
