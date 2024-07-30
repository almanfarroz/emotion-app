import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/token', {
        username,
        password,
      }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      localStorage.setItem('token', response.data.access_token);
      navigate('/home');
    } catch (error) {
      setError('Invalid username or password');
      toast.error('Login failed', {
        position: "top-right",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="brown-theme min-h-screen flex items-center justify-center relative">
      <ToastContainer />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-blur"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg-pixel.jpg)`,
        }}
      ></div>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 flex flex-col relative z-10 md:flex-row-reverse">
        <div className="relative w-full md:w-1/2">
          <img 
            src={`${process.env.PUBLIC_URL}/images/vector.jpg`} 
            alt="vector" 
            className="object-cover w-full h-full rounded-lg md:rounded-none"
          />
          <img 
            src={`${process.env.PUBLIC_URL}/images/logo2.png`} 
            alt="logo" 
            className="logo absolute w-1/3 h-auto" 
            style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(7)'}}
          />
        </div>
        <div className="w-full md:w-1/2 p-6 mt-6 md:mt-0">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="relative">
              <label className="block">Password:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#674318] text-white hover:bg-[#c02942] transition duration-300"
            >
              Login
            </button>
          </form>
          <p className="mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="hover:underline font-bold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
