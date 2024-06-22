import React, { useState } from 'react';
import axios from 'axios';

const QA: React.FC = () => {
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [probabilities, setProbabilities] = useState<number[]>([]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/predict-qa', { context, question });
      const { answers, probabilities } = response.data;

      setAnswers([answers]);
      setProbabilities([probabilities]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col bg-cover bg-center bg-no-repeat py-4 justify-center items-center h-screen"
    style={{
      backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
      height: "100vh",
    }}>
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Question Answering Page</h1>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700">Context:</label>
          <textarea
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700">Question:</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <button
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3C3956] hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-8"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <div className="border-t border-gray-300 my-8"></div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Answers:</h2>
          <ul className="list-disc pl-5">
            {answers.map((answer, index) => (
              <li key={index} className="text-gray-800">{answer}</li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Probabilities:</h2>
          <ul className="list-disc pl-5">
            {probabilities.map((probability, index) => (
              <li key={index} className="text-gray-800">{probability}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QA;
