import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <Link to="/">Мои курсы</Link>
        <Link to="/login">Вход</Link>
        <Link to="/register">Регистрация</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

