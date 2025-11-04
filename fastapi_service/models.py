from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class FormDefinition(BaseModel):
    schema: Dict[str, Any]
    uiSchema: Optional[Dict[str, Any]] = None
    initialData: Optional[Dict[str, Any]] = None


class SystemDefinition(BaseModel):
    id: str
    label: str
    category: str
    description: Optional[str] = None
    forms: Dict[str, FormDefinition]


class CategoryDefinition(BaseModel):
    id: str
    label: str
    systemIds: List[str]


class FlowDefinition(BaseModel):
    id: str
    label: str
    steps: List[str]
    description: Optional[str] = None


class StepDefinition(BaseModel):
    label: str
    description: Optional[str] = None


class EntityConfig(BaseModel):
    steps: Dict[str, StepDefinition]
    flows: Dict[str, FlowDefinition]
    categories: List[CategoryDefinition]
    systems: Dict[str, SystemDefinition]
