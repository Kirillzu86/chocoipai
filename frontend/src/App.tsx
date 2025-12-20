import { useEffect, useState } from "react";
import { API_URL } from "./api/api";
import { Routes, Route } from "react-router-dom";

import HomePage from "./components/HomePage/Homepage";
import LogPage from "./components/LogPage/LogPage";
import RegPage from "./components/RegPage/RegPage";
import Catalog from "./components/Catalog/Catalog";
import CourseDetail from './components/CourseDetail/courseDetail';
import CreateCourse from './components/CreateCourse/CreateCourse';



function App() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  useEffect(() => {
    const base = API_URL.replace(/\/$/, '');
    fetch(`${base}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    // <div>
    //   <h1>Users:</h1>
    //   {users.map(u => (
    //     <div key={u.id}>{u.name}</div>
    //   ))}
    // </div>

    <Routes>
      <Route path="/" element={<HomePage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/login" element={<LogPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/register" element={<RegPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/catalog" element={<Catalog theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/create-course" element={<CreateCourse theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/course/:id" element={<CourseDetail theme={theme} toggleTheme={toggleTheme} />} />
    </Routes>
  );
}

export default App;