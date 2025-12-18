import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection
from pydantic import BaseModel
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

app = FastAPI()
logger = logging.getLogger("uvicorn.error")


def init_db() -> None:
    """
    Простая инициализация БД: создаём таблицу users, если её ещё нет.
    Это защищает от ошибки 'relation \"users\" does not exist'.
    """
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            """
        )
        conn.commit()
        logger.info("DB init: ensured users table exists")
    except Exception:
        logger.exception("Failed to init DB")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # При старте приложения убеждаемся, что таблица users существует
    init_db()

class User(BaseModel):
    id: int
    username: str
    email: str


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    login: str
    password: str


@app.get("/users")
def get_users():
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email FROM users")
        users = cur.fetchall()
        return [{"id": u[0], "username": u[1], "email": u[2]} for u in users]
    except Exception:
        logger.exception("Failed to fetch users")
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to fetch users"},
        )
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/v1/courses")
def list_courses():
    # Заглушка до подключения реальной БД/сервиса
    return [
        {
            "id": 1,
            "title": "Базовый курс",
            "description": "Описание курса",
            "rating": 4.7,
            "students_count": 1200,
            "price_status": "Free",
            "total_lessons": 20,
            "completed_lessons": 5,
            "progress_percentage": 25,
        }
    ]


@app.post("/auth/register", response_model=User)
def register_user(payload: UserCreate):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Проверяем, нет ли пользователя с таким email или username
        cur.execute(
            "SELECT id FROM users WHERE email = %s OR username = %s",
            (payload.email, payload.username),
        )
        existing = cur.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Пользователь уже существует")

        # В демо-режиме пароль храним как есть (в реале нужно хэширование!)
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id",
            (payload.username, payload.email, payload.password),
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        return {"id": user_id, "username": payload.username, "email": payload.email}

    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to register user")
        raise HTTPException(status_code=500, detail="Ошибка при регистрации")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/auth/login", response_model=User)
def login(payload: LoginRequest):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Логин может быть email или username
        cur.execute(
            "SELECT id, username, email, password FROM users WHERE email = %s OR username = %s",
            (payload.login, payload.login),
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=400, detail="Неверный логин или пароль")

        user_id, username, email, stored_password = row

        if stored_password != payload.password:
            raise HTTPException(status_code=400, detail="Неверный логин или пароль")

        return {"id": user_id, "username": username, "email": email}

    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to login user")
        raise HTTPException(status_code=500, detail="Ошибка при входе")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()