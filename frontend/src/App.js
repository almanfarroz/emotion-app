// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Scan from './components/Scan';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
        </Routes>
    </Router>
  );
};

export default App;
