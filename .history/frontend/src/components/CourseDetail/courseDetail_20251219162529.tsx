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

    // Состояния для прохождения теста
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
    const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);

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

    // Обработчики теста
    const startLearning = async () => {
        if (course && course.questions.length > 0) {
            // Если пользователь авторизован, сохраняем информацию, что он начал этот курс
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    await axios.post("http://localhost:8000/api/v1/enroll", {
                        user_id: user.id,
                        course_id: course.id
                    });
                } catch (e) {
                    console.error("Не удалось записаться на курс:", e);
                }
            }

            setActiveQuestionIndex(0);
            setIsAnswerChecked(false);
            setSelectedAnswerId(null);
        } else {
            alert("В этом курсе пока нет вопросов.");
        }
    };

    const checkAnswer = () => {
        if (selectedAnswerId !== null) {
            setIsAnswerChecked(true);
        }
    };

    const nextQuestion = () => {
        if (course && activeQuestionIndex !== null) {
            if (activeQuestionIndex < course.questions.length - 1) {
                setActiveQuestionIndex(activeQuestionIndex + 1);
                setIsAnswerChecked(false);
                setSelectedAnswerId(null);
            } else {
                alert("Курс завершен! Поздравляем!");
                setActiveQuestionIndex(null); // Возврат к описанию
            }
        }
    };

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
                            {activeQuestionIndex === null ? (
                                // --- РЕЖИМ ОПИСАНИЯ КУРСА ---
                                <>
                                    <div className="course-header-block">
                                        <h1 className="course-title-large">{course.title}</h1>
                                        <p className="course-description-large">{course.description}</p>
                                        <button className="start-course-btn" onClick={startLearning}>Начать обучение</button>
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
                                </>
                            ) : (
                                // --- РЕЖИМ ПРОХОЖДЕНИЯ ТЕСТА ---
                                <div className="course-header-block">
                                    <div style={{ marginBottom: '20px', color: '#666' }}>
                                        Вопрос {activeQuestionIndex + 1} из {course.questions.length}
                                    </div>
                                    <h2 className="course-title-large" style={{ fontSize: '1.8rem' }}>
                                        {course.questions[activeQuestionIndex].text}
                                    </h2>
                                    
                                    <div className="lessons-list" style={{ marginTop: '20px' }}>
                                        {course.questions[activeQuestionIndex].answers.map((answer) => {
                                            // Логика подсветки ответов
                                            let itemStyle = {};
                                            if (isAnswerChecked) {
                                                if (answer.is_correct) itemStyle = { border: '2px solid #22c55e', background: '#f0fdf4' }; // Зеленый
                                                else if (selectedAnswerId === answer.id) itemStyle = { border: '2px solid #ef4444', background: '#fef2f2' }; // Красный
                                            } else if (selectedAnswerId === answer.id) {
                                                itemStyle = { border: '2px solid #3b82f6', background: '#eff6ff' }; // Синий (выбран)
                                            }

                                            return (
                                                <div 
                                                    key={answer.id} 
                                                    className="lesson-item" 
                                                    style={{ cursor: 'pointer', ...itemStyle }}
                                                    onClick={() => !isAnswerChecked && setSelectedAnswerId(answer.id)}
                                                >
                                                    <span className="lesson-text">{answer.text}</span>
                                                    {isAnswerChecked && answer.is_correct && <span>✅</span>}
                                                    {isAnswerChecked && !answer.is_correct && selectedAnswerId === answer.id && <span>❌</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginTop: '30px' }}>
                                        {!isAnswerChecked ? (
                                            <button className="start-course-btn" onClick={checkAnswer} disabled={selectedAnswerId === null}>Проверить</button>
                                        ) : (
                                            <button className="start-course-btn" onClick={nextQuestion}>Следующий вопрос →</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;