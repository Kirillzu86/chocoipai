// frontend/src/components/Header/Header.tsx

import React from 'react';
import './StyleHeader.css';

const Header: React.FC = () => {
    return (
        <header className="main-header-area">
            
            {/* Навигация (имитация верхнего меню Stepik) */}
            <nav className="header-nav">
                <span className="nav-logo">StepLearn</span> 
                <a href="/catalog" className="nav-link">Каталог</a>
                <a href="/my-courses" className="nav-link nav-link-active">Моё обучение</a>
                <a href="/teach" className="nav-link">Преподавание</a>
            </nav>

            {/* Поисковая строка и Аватар */}
            <div className="header-controls">
                
                {/* 1. Поисковая строка */}
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Поиск..." 
                        className="search-input"
                    />
                    <button className="search-button">
                        🔍
                    </button>
                </div>
                
                {/* 2. Кнопка уведомлений */}
                <div className="notification-icon">
                    🔔
                    <span className="notification-badge">3</span>
                </div>

                {/* 3. Аватарка пользователя */}
                <div className="user-avatar-container">
                    <span className="user-avatar">H</span>
                    {/* H - Первая буква имени (например, Helen) */}
                </div>
            </div>
        </header>
    );
};

export default Header;