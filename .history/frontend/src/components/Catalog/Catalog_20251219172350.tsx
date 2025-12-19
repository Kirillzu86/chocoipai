import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import "../HomePage/StyleHomePage.css"; // Используем стили главной страницы
import '../Sidebar/StyleSidebar.css';

// Навигация
const navItems = [
    { title: 'Мой кабинет', icon: '👤', path: '/' },
    { title: 'Курсы', icon: '📚', path: '/catalog', special: true } // Выделим "Курсы"
];

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

// Карточка курса (такая же, как на главной)
function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/course/${course.id}`} className="course-card">
      <h3 className="card-title">{course.title}</h3>
      <p className="card-description">{course.description}</p>

      <div className="card-meta">
        <span>⭐ {course.rating.toFixed(1)}</span>
        <span>👤 {course.students_count.toLocaleString()}</span>
        <span className={`price-status ${course.price_status.toLowerCase()}`}>{course.price_status}</span>
      </div>
    </Link>
  );
}

interface CatalogProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

function Catalog({ theme, toggleTheme }: CatalogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesPromise = axios.get<Course[]>("http://localhost:8000/api/v1/courses");
        
        // Проверяем пользователя, чтобы узнать, на какие курсы он записан
        const userStr = localStorage.getItem("currentUser");
        const user = userStr ? JSON.parse(userStr) : null;
        
        let myCoursesPromise = Promise.resolve({ data: [] as Course[] });
        if (user && user.id) {
             myCoursesPromise = axios.get<Course[]>(`http://localhost:8000/api/v1/users/${user.id}/courses`);
        }

        const [coursesResponse, myCoursesResponse] = await Promise.all([coursesPromise, myCoursesPromise]);
        
        const myCourseIds = new Set(myCoursesResponse.data.map(c => c.id));

        // Обновляем статус курсов на "Enrolled", если они есть у пользователя
        const updatedCourses = coursesResponse.data.map(course => ({
            ...course,
            price_status: myCourseIds.has(course.id) ? "Enrolled" : course.price_status
        }));

        setCourses(updatedCourses);
      } catch (err) {
        console.error("Ошибка загрузки курсов:", err);
        setError("Не удалось загрузить каталог.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const backgroundStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: isDarkTheme ? "#030712" : "#f8fafc",
    backgroundImage: isDarkTheme
      ? "radial-gradient(circle at 50% 0%, #3b82f640, #030712 35%)"
      : "radial-gradient(circle at 50% 0%, #e2e8f040, #f8fafc 35%)",
  };

  return (
    <div style={backgroundStyle}>
      <div className="app-main-view">
        <Header />

        <div className="app-layout">
          {/* Сайдбар */}
          <nav className="sidebar-container">
              {navItems.map((item, index) => (
                  <Link to={item.path} key={index} className={`nav-item ${item.special ? 'nav-item-special' : ''}`}>
                      <span className="nav-icon">{item.icon}</span>
                      {item.title}
                  </Link>
              ))}
              <div className="nav-separator"></div>
              <div className="sidebar-auth-links">
                  <Link to="/login" className="auth-link">Вход</Link>
              </div>
          </nav>

          <div className="content-area" style={{ overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}>
            <div className="content-header">
              <h1 className="main-title">Каталог курсов</h1>
              <button className="theme-toggle-btn" onClick={toggleTheme} />
            </div>

            {loading && <div className="loading-state">Загрузка каталога...</div>}
            {error && <div className="error-state">{error}</div>}

            {!loading && !error && (
              <div className="course-list">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;