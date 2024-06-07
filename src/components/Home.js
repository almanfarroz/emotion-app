// src/components/Home.js
import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome to the Home Page</h2>
        <p className="text-gray-700">You have successfully logged in!</p>
      </div>
    </div>
  );
};

export default Home;
