from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from database import get_connection

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
@app.get("/")
def home():
    return {"message": "Pet Management Backend is Running!"}

@app.get("/api/pets")
def get_pets():
    try:
        connection = get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM Pets")
                pets = cursor.fetchall()
                return pets
        finally:
            connection.close()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve pets from database"
        )
    
from pydantic import BaseModel, Field
from typing import Annotated


class PetCreate(BaseModel):
    Name: Annotated[str, Field(min_length=1, max_length=100)]
    Age: Annotated[int, Field(ge=0, le=100)]
    Street: Annotated[str, Field(max_length=150)]
    City: Annotated[str, Field(max_length=100)]
    ZipCode: Annotated[str, Field(max_length=10)]
    State: Annotated[str, Field(max_length=50)]
    TypeOfPet: Annotated[str, Field(min_length=1, max_length=50)]


@app.post("/api/pets", status_code=201)
def add_pet(pet: PetCreate):
    if not pet.Name.strip() or not pet.TypeOfPet.strip():
        raise HTTPException(
            status_code=422,
            detail="Pet name and type cannot be empty"
        )

    try:
        connection = get_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO Pets
                    (Name, Age, Street, City, ZipCode, State, TypeOfPet)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    pet.Name.strip(),
                    pet.Age,
                    pet.Street,
                    pet.City,
                    pet.ZipCode,
                    pet.State,
                    pet.TypeOfPet.strip()
                ))
                pet_id = cursor.lastrowid
            connection.commit()
            return {"message": "Pet added successfully", "PetID": pet_id}
        finally:
            connection.close()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to save pet"
        )

