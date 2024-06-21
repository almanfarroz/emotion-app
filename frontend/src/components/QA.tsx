import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface QAForm {
  question: string;
  context: string;
}

const QA: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<QAForm>();
  const [answer, setAnswer] = useState<string>('');

  const onSubmit: SubmitHandler<QAForm> = async (data: QAForm) => {
    try {
      const response = await fetch('http://localhost:8000/predict-qa/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setAnswer(result.answer);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-gray-200 rounded-full flex flex-shrink-0 justify-center items-center text-gray-500 text-2xl font-mono">Q</div>
              <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                <h2 className="leading-relaxed">Question & Answer</h2>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">Ask a question and get an answer</p>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              <form className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7" onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <input type="text" id="question" {...register('question', { required: true })} className="w-full border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-base px-4 py-2 rounded-lg" placeholder="Enter your question" />
                  {errors.question && <span className="text-red-500">This field is required</span>}
                </div>
                <div className="relative">
                  <textarea id="context" {...register('context', { required: true })} className="w-full border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-base px-4 py-2 rounded-lg" placeholder="Enter the context"></textarea>
                  {errors.context && <span className="text-red-500">This field is required</span>}
                </div>
                <button type="submit" className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded-lg text-lg">Submit</button>
              </form>
              {answer && (
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h2 className="font-semibold">Answer:</h2>
                  <p>{answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QA;
