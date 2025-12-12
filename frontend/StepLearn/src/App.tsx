import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./components/HomePage/Homepage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/about" element={<About />} />
      <Route path="/course/:id" element={<Course />} /> */}
    </Routes>
  );
}

export default App;