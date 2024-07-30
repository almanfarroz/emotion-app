import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './register.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/register', {
        username,
        password
      });
      alert('Registration Successful');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed', {
        position: "top-right",
      });
    }
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
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
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
            <div>
              <label className="block">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#674318] text-white hover:bg-[#c02942] transition duration-300"
            >
              Register
            </button>
          </form>
          <p className="mt-4">
            Already have an account?{' '}
            <Link to="/login" className="hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
