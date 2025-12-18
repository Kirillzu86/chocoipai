import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "..//Header/Header"; // <-- ИМПОРТ HEADER
import Sidebar from "../Sidebar/sidebar"; // Предполагаем, что Sidebar находится в папке Sidebar
import "./StyleHomePage.css"; 

// --- Интерфейсы (должны совпадать с models.py в FastAPI) ---
interface Course {
    id: number;
    title: string;
    description: string;
    rating: number;
    students_count: number;
    price_status: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
}

// --- Вспомогательные Компоненты ---

// 1. Карточка Курса
interface CourseCardProps {
    course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    // Используем Link для перехода на страницу CourseDetail
    <Link to={`/course/${course.id}`} className="course-card">
      <h3 className="card-title">{course.title}</h3>
      <p className="card-description">{course.description}</p>

      <div className="card-meta">
        <span>⭐ {course.rating.toFixed(1)}</span>
        <span>👤 {course.students_count.toLocaleString()}</span>
        <span className={`price-status ${course.price_status.toLowerCase()}`}>{course.price_status}</span>
      </div>

      {/* Прогресс-бар */}
      <div className="card-progress">
        <div style={{ width: `${course.progress_percentage}%` }} className="progress-bar"></div>
      </div>
      <div className="progress-text">
        {course.progress_percentage.toFixed(0)}% пройдено
      </div>
    </Link>
  );
}

// 2. Блок "Серия и ежедневная цель"
function StreakAndDailyBox() {
  return (
    <div className="streak-box">
      <div className="streak-header">
        <span className="streak-icon">🔥</span>
        <span className="streak-title">0 дней без перерыва</span>
      </div>
      <p className="streak-days">Рекорд: 3 дня</p>

      <div className="daily-goal-footer">
        <span className="goal-status">63 задания сегодня</span>
        <button className="start-button">Начать</button>
      </div>
    </div>
  );
}


// --- Главный Компонент Страницы ---
interface HomePageProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

function HomePage({ theme, toggleTheme }: HomePageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDarkTheme = theme === "dark";

  // Логика загрузки данных
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Запрос к эндпоинту списка курсов
        const response = await axios.get<Course[]>("http://localhost:8000/api/v1/courses");
        setCourses(response.data);
      } catch (err) {
        console.error("Ошибка загрузки курсов:", err);
        setError("Не удалось загрузить курсы. Проверьте, работает ли FastAPI.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const pageStyle = {
    backgroundColor: isDarkTheme ? "#0b1021" : "#f8fafc",
    color: isDarkTheme ? "#e5e7eb" : "#0f172a",
    minHeight: "100vh",
  };

  const themeButton = (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: isDarkTheme ? "#e5e7eb" : "#0f172a",
        color: isDarkTheme ? "#0f172a" : "#e5e7eb",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
      aria-label="Переключить тему"
    >
      {isDarkTheme ? "☀️" : "🌙"}
    </button>
  );

  if (loading) {
    return (
      <div className="app-main-view" style={pageStyle}>
        {themeButton}
        <Header />
        <div className="loading-state">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-main-view" style={pageStyle}>
        {themeButton}
        <Header />
        <div className="error-state">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="app-main-view" style={pageStyle}>
      {themeButton}
      <Header /> {/* <-- ВСТАВЛЕННЫЙ HEADER */}

      <div className="app-layout">
        <Sidebar /> {/* <-- Боковая панель */}

        <div className="content-area">
          <h1 className="main-title">Моё обучение</h1>

          <section className="dashboard-section">
            {/* Лента курсов */}
            <div className="course-list">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Блок серии/цели */}
            <StreakAndDailyBox />
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;