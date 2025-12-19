import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "..//Header/Header"; // <-- ИМПОРТ HEADER
import "./StyleHomePage.css"; 
import '../Sidebar/StyleSidebar.css'; 

// --- Данные для навигации (из Sidebar.tsx) ---
const navItems = [
    { title: 'Мой кабинет', icon: '👤', path: '/', special: true },
    { title: 'Курсы', icon: '📚', path: '/catalog' }
];
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
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; email: string } | null>(null);
  const isDarkTheme = theme === "dark";

  // Логика загрузки данных
  useEffect(() => {
    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Проверяем, есть ли пользователь в localStorage
            const userStr = localStorage.getItem("currentUser");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    setCurrentUser(user);
                    // 2. Если пользователь есть, загружаем его курсы
                    const response = await axios.get<Course[]>(`http://localhost:8000/api/v1/users/${user.id}/courses`);
                    setMyCourses(response.data);
                } else {
                    localStorage.removeItem("currentUser");
                    setCurrentUser(null);
                }
            }
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
            setError("Не удалось загрузить данные. Попробуйте перезагрузить страницу.");
        } finally {
            setLoading(false);
        }
    };
    fetchUserData();
  }, []);

  // Фон страницы в той же стилистике, что и RegPage/LogPage
  const backgroundStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: isDarkTheme ? "#030712" : "#f8fafc",
    backgroundImage: isDarkTheme
      ? "radial-gradient(circle at 50% 0%, #3b82f640, #030712 35%)"
      : "radial-gradient(circle at 50% 0%, #e2e8f040, #f8fafc 35%)",
    animation: "pulse-spotlight 15s infinite ease-in-out",
  };

  if (loading) {
    return (
      <div style={backgroundStyle}>
        <div className="app-main-view">
          <Header />
          <div className="loading-state">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={backgroundStyle}>
        <div className="app-main-view">
          <Header />
          <div className="error-state">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={backgroundStyle}>
      <div className="app-main-view">
        <Header /> {/* <-- ВСТАВЛЕННЫЙ HEADER */}

        <div className="app-layout">
          {/* --- Код из Sidebar.tsx --- */}
          <nav className="sidebar-container">
              {navItems.map((item, index) => (
                  <Link to={item.path} key={index} className={`nav-item ${item.special ? 'nav-item-special' : ''}`}>
                      <span className="nav-icon">{item.icon}</span>
                      {item.title}
                  </Link>
              ))}
              
              <div className="nav-separator"></div>
              
              <div className="sidebar-footer">
                  <span className="nav-icon">💡</span>
                  Помощь
              </div>
              
              <div className="sidebar-auth-links">
                  <Link to="/login" className="auth-link">Вход</Link>
                  <Link to="/register" className="auth-link">Регистрация</Link>
              </div>
          </nav>

          <div className="content-area">
            <div className="content-header">
              <h1 className="main-title">Моё обучение</h1>
              <button
                className="theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                aria-label="Переключить тему"
              >
              </button>
            </div>

            {loading && <div className="loading-state">Загрузка...</div>}
            {error && <div className="error-state">{error}</div>}

            {!loading && !error && (
            <section className="dashboard-section">
              {/* Лента курсов */}
              <div className="course-list">
                {currentUser ? (
                  <>
                    <div className="welcome-banner">
                      Привет, <span className="welcome-name">{currentUser.username}</span>! 🎓
                    </div>
                    {myCourses.length > 0 ? (
                      myCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))
                    ) : (
                      <div className="welcome-banner">Вы пока не записаны ни на один курс. <Link to="/catalog" className="auth-link">Перейти в каталог</Link></div>
                    )}
                  </>
                ) : (
                  <div className="welcome-banner">Чтобы увидеть свои курсы, <Link to="/login" className="auth-link">войдите в аккаунт</Link>.</div>
                )}
              </div>

              {/* Блок серии/цели */}
              <StreakAndDailyBox />
            </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;