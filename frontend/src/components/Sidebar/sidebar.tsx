import React from 'react';
import { Link } from 'react-router-dom';
import './StyleSidebar.css'; 

// Данные для навигации
const navItems = [
    { title: 'Мой кабинет', icon: '👤', path: '/', special: true },
    { title: 'Курсы', icon: '📚', path: '/catalog' },
    { title: 'Прохожу', icon: '🏃', path: '/in-progress' },
    { title: 'Избранное', icon: '⭐️', path: '/favorites' },
    { title: 'Хочу пройти', icon: '📅', path: '/wishlist' },
    { title: 'Архив', icon: '🗄️', path: '/archive' },
    { title: 'Классы', icon: '🎓', path: '/classes' },
    { title: 'Уведомления', icon: '🔔', path: '/notifications' }
];

const Sidebar: React.FC = () => {
    return (
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
    );
};

export default Sidebar;