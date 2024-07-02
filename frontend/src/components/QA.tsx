import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QA: React.FC = () => {
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<{ [key: string]: string }>({});

  const handleScanClick = () => {
    window.location.href = '/scan';
  };

  const handleQAClick = () => {
    window.location.href = '/qa';
  };

  const handleHomeClick = () => {
    window.location.href = '/home';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/contexts');
        setEmotions(response.data.emotions);
      } catch (error) {
        console.error('Error fetching contexts:', error);
      }
    };

    fetchContexts();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/predict-qa', { context, question });
      const { answers } = response.data;

      setAnswers([answers]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
      }}>
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-center items-center px-8 w-full text-white py-4 absolute top-0">
        <div className="flex space-x-4">
          <div className="text-lg cursor-pointer" onClick={handleHomeClick}>
            Home
          </div>
          <div className="text-lg cursor-pointer" onClick={handleScanClick}>
            Scan
          </div>
          <div className="text-lg cursor-pointer" onClick={handleQAClick}>
            QA
          </div>
          <div className="text-lg cursor-pointer" onClick={handleLogout}>
                Logout
            </div>
        </div>
      </nav>
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mt-8 mb-8"> {/* Tambahkan margin bawah di sini */}
        <h1 className="text-3xl font-bold mb-8 text-center">Question Answering</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Emotion:</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          >
            <option value="">Select Emotion</option>
            {Object.entries(emotions).map(([emotion, text]) => (
              <option key={emotion} value={text}>{emotion}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Question:</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <button
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3C3956] hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <div className="border-t border-gray-300 my-4"></div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Answers:</h2>
          <ul className="list-disc pl-5">
            {answers.map((answer, index) => (
              <li key={index} className="text-gray-800">{answer}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QA;
