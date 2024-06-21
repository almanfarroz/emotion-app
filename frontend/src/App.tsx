// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Scan from './components/Scan';
import QA from './components/QA';

const App: React.FC = () => (
	<Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/qa" element={<QA />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
        </Routes>
    </Router>
);

export default App;
