// frontend/src/components/Header/Header.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './StyleHeader.css';

const Header: React.FC = () => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Вешаем клавиатурное сокращение Shift+S для прокрутки вниз
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Обновляем `currentUser` при смене маршрута (вход/выход делает navigate)
    useEffect(() => {
        const raw = localStorage.getItem('currentUser');
        try {
            setCurrentUser(raw ? JSON.parse(raw) : null);
        } catch (e) {
            setCurrentUser(null);
        }
    }, [location]);

    // Слушаем события storage для обновления в других вкладках
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'currentUser') {
                try {
                    setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch {
                    setCurrentUser(null);
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return (
        <header className="main-header-area">
            
            {/* Навигация (имитация верхнего меню Stepik) */}
            <nav className="header-nav">
                <span className="nav-logo">StepLearn</span> 
                <a href="/catalog" className="nav-link">Каталог</a>
                <a href="/" className="nav-link nav-link-active">Моё обучение</a>
                <a href="/create-course" className="nav-link">Преподавание</a>
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

                {/* 3. Кнопка "Прокрутить вниз" */}
                <button
                    aria-label="Scroll to bottom"
                    title="Прокрутить вниз (Shift+S)"
                    className="scroll-down-button"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                    ⬇️
                </button>

                {/* 4. Аватарка пользователя */}
                <div className="user-avatar-container">
                    <span className="user-avatar">
                        {(() => {
                            if (!currentUser) return 'H';
                            const name = (currentUser.username || currentUser.name || currentUser.email || '') + '';
                            return name.trim() ? name.trim()[0].toUpperCase() : 'H';
                        })()}
                    </span>
                </div>
            </div>
        </header>
    );

};

export default Header;