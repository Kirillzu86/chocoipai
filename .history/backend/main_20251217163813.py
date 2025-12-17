import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

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

@app.get("/users")
def get_users():
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM users")
        users = cur.fetchall()
        return [{"id": u[0], "name": u[1]} for u in users]
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