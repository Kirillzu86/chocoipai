import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection, get_cursor
from pydantic import BaseModel
import uvicorn

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
        # --- Новые таблицы для курсов ---
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                text TEXT NOT NULL
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS answers (
                id SERIAL PRIMARY KEY,
                question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL DEFAULT FALSE
            );
            """
        )
        
        # --- Добавляем демо-курс, если его еще нет ---
        cur.execute("SELECT id FROM courses WHERE title = %s", ("Основы Python (с тестом)",))
        if cur.fetchone() is None:
            cur.execute(
                "INSERT INTO courses (title, description) VALUES (%s, %s) RETURNING id",
                ("Основы Python (с тестом)", "Изучите основы языка Python с нуля. Переменные, циклы, функции.")
            )
            course_id = cur.fetchone()[0]

            # Список вопросов и ответов для демо-курса
            demo_questions = [
                ("Какая функция используется для вывода текста на экран?", [
                    ("print()", True), ("input()", False), ("scan()", False)
                ]),
                ("Какой символ используется для комментариев в Python?", [
                    ("#", True), ("//", False), ("--", False)
                ]),
                ("Что вернет выражение 3 * 'A'?", [
                    ("'AAA'", True), ("'3A'", False), ("Ошибка", False)
                ])
            ]

            for q_text, answers in demo_questions:
                cur.execute(
                    "INSERT INTO questions (course_id, text) VALUES (%s, %s) RETURNING id",
                    (course_id, q_text)
                )
                question_id = cur.fetchone()[0]
                
                for a_text, is_correct in answers:
                    cur.execute(
                        "INSERT INTO answers (question_id, text, is_correct) VALUES (%s, %s, %s)",
                        (question_id, a_text, is_correct)
                    )
            
            logger.info("Added demo course with questions")

        conn.commit()
        logger.info("DB init: ensured users table exists")
    except Exception as e:
        logger.exception("Failed to init DB")
        print(f"ОШИБКА ПРИ СОЗДАНИИ ТАБЛИЦ: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

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


# --- Модели для курсов ---
class AnswerBase(BaseModel):
    text: str
    is_correct: bool

class Answer(AnswerBase):
    id: int

class QuestionBase(BaseModel):
    text: str
    answers: list[AnswerBase]

class Question(QuestionBase):
    id: int
    answers: list[Answer]

class CourseBase(BaseModel):
    title: str
    description: str | None = None

class CourseCreate(CourseBase):
    questions: list[QuestionBase]

class Course(CourseBase):
    id: int
    # Для краткого списка курсов вопросы не нужны

class CourseWithQuestions(Course):
    questions: list[Question]


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
    """Возвращает список всех курсов из БД."""
    courses = []
    with get_cursor() as cur:
        cur.execute("SELECT id, title, description FROM courses")
        for row in cur.fetchall():
            # Временные заглушки для полей, которых пока нет в БД
            courses.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "rating": 4.5,
                "students_count": 0,
                "price_status": "Free",
                "total_lessons": 0,
                "completed_lessons": 0,
                "progress_percentage": 0,
            })
    return courses


@app.post("/api/v1/courses", response_model=Course)
def create_course(course_data: CourseCreate):
    """Создает новый курс, его вопросы и ответы в БД."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # 1. Создаем курс
            cur.execute(
                "INSERT INTO courses (title, description) VALUES (%s, %s) RETURNING id",
                (course_data.title, course_data.description)
            )
            course_id = cur.fetchone()[0]

            # 2. Создаем вопросы и ответы
            for question_data in course_data.questions:
                cur.execute(
                    "INSERT INTO questions (course_id, text) VALUES (%s, %s) RETURNING id",
                    (course_id, question_data.text)
                )
                question_id = cur.fetchone()[0]

                for answer_data in question_data.answers:
                    cur.execute(
                        "INSERT INTO answers (question_id, text, is_correct) VALUES (%s, %s, %s)",
                        (question_id, answer_data.text, answer_data.is_correct)
                    )
        
        conn.commit()
        return Course(id=course_id, title=course_data.title, description=course_data.description)

    except Exception:
        conn.rollback()
        logger.exception("Failed to create course")
        raise HTTPException(status_code=500, detail="Ошибка при создании курса")
    finally:
        conn.close()


@app.get("/api/v1/course/{course_id}", response_model=CourseWithQuestions)
def get_course(course_id: int):
    """Возвращает полную информацию о курсе с вопросами и ответами."""
    try:
        with get_cursor() as cur:
            # Получаем основную информацию о курсе
            cur.execute("SELECT id, title, description FROM courses WHERE id = %s", (course_id,))
            course_row = cur.fetchone()
            if not course_row:
                raise HTTPException(status_code=404, detail="Курс не найден")

            course_result = {"id": course_row[0], "title": course_row[1], "description": course_row[2], "questions": []}

            # Получаем все вопросы для этого курса
            cur.execute("SELECT id, text FROM questions WHERE course_id = %s ORDER BY id", (course_id,))
            questions = cur.fetchall()

            for q_id, q_text in questions:
                question_data = {"id": q_id, "text": q_text, "answers": []}
                
                # Получаем все ответы для текущего вопроса
                cur.execute("SELECT id, text, is_correct FROM answers WHERE question_id = %s ORDER BY id", (q_id,))
                answers = cur.fetchall()
                
                for a_id, a_text, a_is_correct in answers:
                    question_data["answers"].append({"id": a_id, "text": a_text, "is_correct": a_is_correct})
                
                course_result["questions"].append(question_data)

            return course_result

    except HTTPException:
        raise
    except Exception:
        logger.exception(f"Failed to fetch course {course_id}")
        raise HTTPException(status_code=500, detail="Ошибка при получении курса")
        

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
    except Exception as e:
        logger.exception("Failed to register user")
        print(f"ОШИБКА ПРИ РЕГИСТРАЦИИ: {e}")
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