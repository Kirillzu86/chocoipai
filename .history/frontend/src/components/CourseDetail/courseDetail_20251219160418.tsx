import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Header from "../Header/Header";
import "../HomePage/StyleHomePage.css"; // Используем общие стили макета
import "../Sidebar/StyleSidebar.css";
import "./StyleCourseDetail.css"; // Специфичные стили для этой страницы

// Интерфейсы данных (соответствуют ответу бэкенда)
interface Answer {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    answers: Answer[];
}

interface CourseDetailData {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

// Навигация (как в каталоге)
const navItems = [
    { title: 'Мой кабинет', icon: '👤', path: '/' },
    { title: 'Курсы', icon: '📚', path: '/catalog', special: true }
];

interface CourseDetailProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

function CourseDetail({ theme, toggleTheme }: CourseDetailProps) {
    const { id } = useParams<{ id: string }>(); // Получаем ID из URL
    const [course, setCourse] = useState<CourseDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDarkTheme = theme === "dark";

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get<CourseDetailData>(`http://localhost:8000/api/v1/course/${id}`);
                setCourse(response.data);
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить курс. Возможно, он не существует.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCourse();
    }, [id]);

    const backgroundStyle: React.CSSProperties = {
        minHeight: "100vh",
        backgroundColor: isDarkTheme ? "#030712" : "#f8fafc",
        backgroundImage: isDarkTheme
          ? "radial-gradient(circle at 50% 0%, #3b82f640, #030712 35%)"
          : "radial-gradient(circle at 50% 0%, #e2e8f040, #f8fafc 35%)",
    };

    if (loading) return <div style={backgroundStyle}><div className="loading-state">Загрузка курса...</div></div>;
    if (error || !course) return <div style={backgroundStyle}><div className="error-state">{error || "Курс не найден"}</div></div>;

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

                    {/* Основной контент */}
                    <div className="content-area" style={{ overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}>
                        <div className="content-header">
                            <Link to="/catalog" className="back-link">← Назад в каталог</Link>
                            <button className="theme-toggle-btn" onClick={toggleTheme} />
                        </div>

                        <div className="course-detail-container">
                            <div className="course-header-block">
                                <h1 className="course-title-large">{course.title}</h1>
                                <p className="course-description-large">{course.description}</p>
                                <button className="start-course-btn">Начать обучение</button>
                            </div>

                            <div className="lessons-list-section">
                                <h2>Программа курса ({course.questions.length} уроков)</h2>
                                <div className="lessons-list">
                                    {course.questions.length === 0 ? (
                                        <p className="empty-lessons">В этом курсе пока нет уроков.</p>
                                    ) : (
                                        course.questions.map((q, index) => (
                                            <div key={q.id} className="lesson-item">
                                                <span className="lesson-number">{index + 1}</span>
                                                <span className="lesson-text">{q.text}</span>
                                                <span className="lesson-status">🔒</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;