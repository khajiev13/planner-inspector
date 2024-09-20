"""
这个模块使用 FastAPI 框架构建了一个简单的 Web 应用程序，并与 SQLAlchemy 数据库进行交互。主要功能包括：

1. 配置 CORS 中间件以允许特定的来源访问 API。
2. 创建一个数据库会话依赖项，以便在请求期间管理数据库连接。
3. 定义了几个 API 端点：
    - 根端点 ("/")：返回一个简单的欢迎消息。
    - 获取所有最近技能 ("/get_all_recent_skills")：执行 SQL 查询以获取所有最近的技能，并返回技能列表。
    - 获取技能参数 ("/get_parameters_for_skills/{skill_id:int}")：根据技能 ID 获取技能参数，并返回参数列表。
    - 编辑技能提示 ("/edit_skill_prompt/{skill_id:int}/{prompt:str}")：根据技能 ID 更新技能提示。
    - 编辑参数描述 ("/edit_parameter_description/{parameter_id:str}/{description:str}")：根据参数 ID 更新参数描述。
    - 改item_type ("/edit_parameter_item_type/{parameter_id:str}/{item_type:int}")：根据参数 ID 更新参数item_type。

模块依赖于以下外部库：
- FastAPI：用于构建 Web API。
- SQLAlchemy：用于与数据库进行交互。
- Pydantic：用于数据验证和序列化。
"""

from fastapi import FastAPI, Depends
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import text
from fastapi.middleware.cors import CORSMiddleware
import database
from db_pydantic_model import Skills, SkillParameter
from typing import List
from fastapi.responses import JSONResponse

app = FastAPI()

# Define your CORS origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a session local class
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=database.database)

# Dependency to get the database session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "Hello World"}


@app.get("/get_all_recent_skills", response_model=List[Skills])
def get_all_recent_skills(db: Session = Depends(get_db)) -> List[Skills]:
    # Perform left join for z_skill and z_skill_version tables and pick the skills that have attribute of 1 for input_use_schema
    query = text("""
        SELECT
            z_skill.skill_id,
            z_skill.name,
            z_skill_version.enabled_by_default,
            z_skill_version.input_use_schema,
            z_skill_version.endpoint,
            z_skill_version.prompt,
            z_skill_version.version_id
        FROM
            z_skill
        LEFT JOIN
            z_skill_version ON z_skill.skill_id = z_skill_version.skill_id
        WHERE
            z_skill_version.input_use_schema = 1 and z_skill.status = 1
    """)
    # Execute the query and fetch the data
    result = db.execute(query)
    # Validate the data using the Pydantic model
    skills = [Skills(**row._mapping) for row in result]
    return skills


@app.get("/get_parameters_for_skills/{skill_id:int}", response_model=List[SkillParameter])
def get_parameters_for_skills(skill_id: int, db: Session = Depends(get_db)) -> List[SkillParameter]:
    # Get the parameters for the skills provided in the skill_ids list
    query = text("""
    SELECT
        z_skill_version_parameter.parameter_id,
        z_skill_version_parameter.name,
        z_skill_version_parameter.description,
        z_skill_version_parameter.value_type,
        z_skill_version_parameter.value_enum,
        z_skill_version_parameter.is_required,
        z_skill_version_parameter.item_type
    FROM
        z_skill_version_parameter
    WHERE
        z_skill_version_parameter.skill_version_id = :skill_id
    """)
    # Execute the query and fetch the data
    result = db.execute(query, {"skill_id": skill_id})
    # Validate the data using the Pydantic model
    parameters = [SkillParameter(**row._mapping) for row in result]
    return parameters


@app.put("/edit_skill_prompt/{skill_id:int}/{prompt:str}")
def edit_skill_prompt(skill_id: int, prompt: str, db: Session = Depends(get_db)):
    # Update the prompt for the skill_id provided
    query = text("""
    UPDATE
        z_skill_version
    SET
        prompt = :prompt
    WHERE
        skill_id = :skill_id
    """)
    # Execute the query
    db.execute(query, {"skill_id": skill_id, "prompt": prompt})
    # Commit the changes
    db.commit()
    return JSONResponse(content={"message": "Prompt updated successfully"}, status_code=204)


@app.put("/edit_parameter_description/{parameter_id:str}/{description:str}")
def edit_parameter_description(parameter_id: str, description: str, db: Session = Depends(get_db)):
    query = text("""
    UPDATE
        z_skill_version_parameter
    SET
        description = :description
    WHERE
        parameter_id = :parameter_id
    """)
    db.execute(query, {"parameter_id": parameter_id,
               "description": description})
    db.commit()
    return JSONResponse(content={"message": "Description updated successfully"}, status_code=204)


@app.put("/edit_parameter_item_type/{parameter_id:str}/{item_type:int}")
def edit_parameter_item_type(parameter_id: str, item_type: int, db: Session = Depends(get_db)):
    # Raise an exception error if parameters dont exist

    query = text("""
    UPDATE
        z_skill_version_parameter
    SET
        item_type = :item_type
    WHERE
        parameter_id = :parameter_id
    """)
    db.execute(query, {"parameter_id": parameter_id, "item_type": item_type})
    db.commit()
    return JSONResponse(content={"message": "Item type updated successfully"}, status_code=204)
