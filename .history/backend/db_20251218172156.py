import os
import psycopg2
from contextlib import contextmanager

# Получаем данные для подключения к БД из переменных окружения
DB_NAME = os.getenv("POSTGRES_DB", "mydatabase")
DB_USER = os.getenv("POSTGRES_USER", "myuser")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "mypassword")
DB_HOST = os.getenv("POSTGRES_HOST", "db") # 'db' - это имя сервиса PostgreSQL в Docker Compose
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

def get_connection():
    """Устанавливает и возвращает соединение с базой данных PostgreSQL."""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

@contextmanager
def get_cursor():
    """Контекстный менеджер для получения курсора базы данных."""
    conn = get_connection()
    try:
        yield conn.cursor()
    finally:
        conn.close()