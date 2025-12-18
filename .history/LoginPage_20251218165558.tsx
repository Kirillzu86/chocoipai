import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            // Замените этот URL на ваш реальный эндпоинт для входа
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Предполагаем, что API возвращает объект с токеном
                const data: { token: string } = await response.json();
                // Сохраняем токен или другую информацию о сессии
                localStorage.setItem('authToken', data.token);
                
                // Перенаправляем пользователя на главную страницу
                navigate('/'); 
            } else {
                // Обработка ошибок входа, например, неверный пароль
                const errorData: { message?: string } = await response.json();
                setError(errorData.message || 'Ошибка входа. Проверьте логин и пароль.');
            }
        } catch (err) {
            // Обработка сетевых ошибок или ошибок парсинга JSON
            setError('Не удалось подключиться к серверу. Попробуйте позже.');
            console.error('Login error:', err);
        }
    };

    return (
        <div>
            <h2>Вход в аккаунт</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Имя пользователя:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default LoginPage;