

from pydantic import BaseModel
from typing import Optional, Sequence


class zUserSkillMapping(BaseModel):
    user_skill_mapping_id: int
    user_id: int
    user_source: int
    skill_id: int
    is_dev: int
    create_time: int
    create_by: str
    update_time: int
    update_by: str


class Skills(BaseModel):
    skill_id: int
    version_id: int
    name: str
    enabled_by_default: int
    input_use_schema: Optional[int] = None
    endpoint: Optional[str] = None
    prompt: Optional[str] = None


class SkillParameter(BaseModel):
    # Parameters are optional none when using get request but we need them for creating a new parameter
    skill_version_id: Optional[int] = None
    parameter_id: Optional[str] = None
    name: str
    description: str
    value_type: int
    value_enum: Optional[str] = None
    is_required: int
    item_type: Optional[int] = None
    status: Optional[int] = None
    create_time: Optional[int] = None
    create_by: Optional[str] = None
    update_time: Optional[int] = None
    update_by: Optional[str] = None
