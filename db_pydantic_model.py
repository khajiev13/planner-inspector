# This file contains the Pydantic models for the database tables.
# These models are used to validate the data that is sent to the client.


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
    parameter_id: str
    name: str
    description: str
    value_type: int
    value_enum: Optional[str] = None
    is_required: int
    item_type: Optional[int] = None
