import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import Timetable from "./timetable";
import Home from "./home";
import Post from "./post";
import Write from "./write";
import Wrlte from "./wrlte";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Timetable />} />
          <Route path="/home" element={<Home />} />
          <Route path="/post" element={<Post />} />
          <Route path="/write" element={<Write />} />
          <Route path="/wrlte" element={<Wrlte />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
