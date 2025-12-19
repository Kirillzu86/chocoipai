import os
import psycopg2
from contextlib import contextmanager

# Получаем данные для подключения к БД из переменных окружения
DB_NAME = os.getenv("POSTGRES_DB", "postgres")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost") # 'db' - это имя сервиса PostgreSQL в Docker Compose
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