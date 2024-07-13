import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import ikon mata

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk mengatur tipe input password
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
    }
  };

  // Fungsi untuk mengubah tipe input password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
  className="bg-cover bg-center bg-no-repeat py-4 min-h-screen flex items-center justify-center"
  style={{
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
    height: "100vh",
  }}
>
  <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12">
    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-gray-700">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="relative">
        <label className="block text-gray-700">Password:</label>
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
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-[#3C3956] text-white rounded-lg hover:bg-gray-600 transition duration-300"
      >
        Login
      </button>
    </form>
    <p className="mt-4 text-gray-600">
      Don't have an account?{' '}
      <Link to="/register" className="text-blue-500 hover:underline">
        Register
      </Link>
    </p>
  </div>
</div>

  );
};

export default Login;
