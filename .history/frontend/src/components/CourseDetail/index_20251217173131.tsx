import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; 
import Sidebar from '../Sidebar/sidebar'; // Предполагаем, что Sidebar находится в папке Sidebar
import './StyleCourseDetail.css'; 

// --- Интерфейсы (должны совпадать с models.py в FastAPI) ---
interface Task {
    id: number;
    task_type: string;
    description: string;
    is_completed: boolean;
}

interface Lesson {
    id: number;
    title: string;
    content: string; // Контент урока
    tasks: Task[];
    is_completed: boolean;
}

interface Course {
    id: number;
    title: string;
    description: string;
    total_lessons: number;
    lessons: Lesson[]; // Список уроков
    progress_percentage: number;
}


const CourseDetail: React.FC = () => {
    // Получаем ID курса из адресной строки
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id || '0');
    
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Логика загрузки данных
    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                setError("Неверный ID курса.");
                setLoading(false);
                return;
            }
            try {
                // Запрос к эндпоинту одного курса
                const response = await axios.get<Course>(`http://localhost:8000/api/v1/course/${courseId}`);
                setCourse(response.data);
            } catch (err) {
                console.error("Ошибка загрузки курса:", err);
                setError("Курс не найден или произошла ошибка сервера. Проверьте, работает ли FastAPI.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]); 

    if (loading) return (
        <div className="app-layout">
            <Sidebar />
            <div className="course-content-area loading-state">Загрузка курса...</div>
        </div>
    );
    if (error) return (
        <div className="app-layout">
            <Sidebar />
            <div className="course-content-area error-state">Ошибка: {error}</div>
        </div>
    );
    if (!course) return (
        <div className="app-layout">
            <Sidebar />
            <div className="course-content-area not-found-state">Курс не найден.</div>
        </div>
    );

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="course-content-area">
                
                <Link to="/" className="back-link">← Вернуться к моим курсам</Link>

                <h1 className="course-title">{course.title}</h1>
                <p className="course-description">{course.description}</p>

                {/* Общий прогресс */}
                <div className="course-progress-bar-wrapper">
                    <div style={{ width: `${course.progress_percentage}%` }} className="course-progress-bar"></div>
                </div>
                <div className="progress-text">
                    {course.progress_percentage.toFixed(0)}% пройдено ({course.lessons.filter(l => l.is_completed).length} из {course.lessons.length} уроков)
                </div>

                {/* Список Уроков */}
                <div className="lessons-list">
                    <h2>Программа курса</h2>
                    {course.lessons.map((lesson, index) => (
                        // В будущем здесь будет ссылка на /course/:id/lesson/:lessonId
                        <div key={lesson.id} className="lesson-item">
                            <span className="lesson-number">{index + 1}.</span>
                            <span className="lesson-title">{lesson.title}</span>
                            
                            <div className="lesson-meta">
                                <span className="lesson-task-count">
                                    {lesson.tasks.length} заданий
                                </span>
                                {/* Отображение статуса завершения */}
                                <span className={`lesson-status ${lesson.is_completed ? 'completed' : 'pending'}`}>
                                    {lesson.is_completed ? '✅ Завершено' : 'Начать'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;