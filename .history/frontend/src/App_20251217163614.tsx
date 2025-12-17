import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/Homepage";
import LogPage from "./components/LogPage/LogPage";
import RegPage from "./components/RegPage/RegPage";

function App() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    // <div>
    //   <h1>Users:</h1>
    //   {users.map(u => (
    //     <div key={u.id}>{u.name}</div>
    //   ))}
    // </div>

  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LogPage />} />
    <Route path="/register" element={<RegPage />} />
  </Routes>
  );
}

export default App;