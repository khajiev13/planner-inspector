import uuid
import datetime
from fastapi import FastAPI, Depends
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import text
from fastapi.middleware.cors import CORSMiddleware
import database
from db_pydantic_model import Skills, SkillParameter
from typing import List
from fastapi import Response
from fastapi.exceptions import HTTPException

app = FastAPI()

# Define your CORS origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
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
    return Response(content="Prompt updated successfully", status_code=204)


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
    return Response(content="Description updated successfully", status_code=204)


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
    return Response(content="Item type updated successfully", status_code=204)


@app.put("/edit_parameter_description/{parameter_id}/{description}")
def edit_parameter_description(parameter_id: str, description: str, db: Session = Depends(get_db)):
    if not parameter_id or not description:
        raise HTTPException(
            status_code=400, detail="Parameter ID and description must be provided")

    try:
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

        return Response(content="Description updated successfully", status_code=204)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/create_parameter")
def create_parameter(parameter: SkillParameter, db: Session = Depends(get_db)):
    try:
        # Generate a unique ID
        parameter.parameter_id = str(uuid.uuid4())
        # Generate current timestamp
        current_time = int(datetime.datetime.now().timestamp() * 1000)
        parameter.create_time = current_time
        parameter.update_time = current_time

        parameter.update_by = parameter.create_by
        print(parameter)

        query = text("""
        INSERT INTO z_skill_version_parameter
        (parameter_id, skill_version_id, name, description, value_type, value_enum, item_type, is_required, status, create_time, create_by, update_time, update_by)
        VALUES
        (:parameter_id, :skill_version_id, :name, :description, :value_type, :value_enum, :item_type, :is_required, :status, :create_time, :create_by, :update_time, :update_by)
        """)
        db.execute(query, parameter.model_dump())
        db.commit()
        return Response(content="Parameter created successfully", status_code=201)
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")
