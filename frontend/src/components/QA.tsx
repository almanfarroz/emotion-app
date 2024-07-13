// qa.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QA: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // State untuk loading
  const [username, setUsername] = useState('');
  const [showExamples, setShowExamples] = useState(false); // State untuk modal contoh pertanyaan
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUsername(response.data.username);
        } catch (error) {
          console.error("Error fetching user details", error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    fetchUserDetails();
  }, [navigate]);

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

  const handleSubmit = async () => {
    if (!question) return; // Handle empty question validation

    setLoading(true); // Menetapkan loading saat memulai permintaan
    setAnswers([]); // Menghapus jawaban yang ada saat proses loading dimulai

    try {
      const response = await axios.get('http://localhost:8000/predict-qa', {
        params: { question }
      });
      const { answers } = response.data;

      setAnswers([answers]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Hentikan loading setelah permintaan selesai
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-4 md:px-8"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-center items-center w-full text-white py-4 absolute top-0 px-4 md:px-8">
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
          <div className="text-lg cursor-pointer">
            {username}
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow mt-16 md:mt-24 w-full">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mt-8 mb-8">
          {/* Tambahkan margin bawah di sini */}
          <h1 className="text-3xl font-bold mb-8 text-center">Question Answering</h1>
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
            onClick={() => setShowExamples(true)} // Menampilkan modal saat tombol diklik
          >
            Example Questions
          </button>
          <button
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3C3956] hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
            onClick={handleSubmit}
            disabled={!question || loading} // Menonaktifkan tombol saat loading
          >
            {loading ? 'Loading...' : 'Submit'} {/* Teks berubah sesuai status loading */}
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

      {showExamples && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Example Questions</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>What is the definition of mental health?</li>
              <li>How can you maintain mental health?</li>
              <li>What are the signs that someone is experiencing a mental health disorder?</li>
              <li>How can you detect depression in yourself?</li>
              <li>What is the difference between normal anxiety and an anxiety disorder?</li>
            </ul>
            <button
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3C3956] hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowExamples(false)} // Menutup modal saat tombol diklik
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QA;
