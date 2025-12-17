import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '..//Header/Header'; // <-- ИМПОРТ HEADER
import Sidebar from '../Sidebar/index'; // Предполагаем, что Sidebar находится в папке Sidebar
import './StyleHomePage.css'; 

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

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
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
};

// 2. Блок "Серия и ежедневная цель"
const StreakAndDailyBox: React.FC = () => {
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
};


// --- Главный Компонент Страницы ---
const HomePage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Логика загрузки данных
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Запрос к эндпоинту списка курсов
                const response = await axios.get<Course[]>('http://localhost:8000/api/v1/courses');
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

    if (loading) return (
        <div className="app-main-view">
            <Header />
            <div className="loading-state">Загрузка...</div>
        </div>
    );
    if (error) return (
        <div className="app-main-view">
            <Header />
            <div className="error-state">Ошибка: {error}</div>
        </div>
    );

    return (
        <div className="app-main-view"> 
            
            <Header /> {/* <-- ВСТАВЛЕННЫЙ HEADER */}

            <div className="app-layout">
                
                <Sidebar /> {/* <-- Боковая панель */}

                <div className="content-area">
                    <h1 className="main-title">Моё обучение</h1>
                    
                    <section className="dashboard-section">
                        {/* Лента курсов */}
                        <div className="course-list">
                            {courses.map(course => (
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
};

export default HomePage;