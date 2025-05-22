import React from 'react';
import { useNavigate } from 'react-router-dom';

function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-700 mb-2">PrepSphere</h1>
          <h2 className="text-2xl text-gray-600">Master Your Technical Interviews</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-1/2">
              <p className="text-lg text-gray-700 mb-6">
                Prepare for your next technical interview with our AI-powered practice platform.
                Get instant feedback, personalized recommendations, and improve your interview skills.
              </p>
              
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Practice with realistic technical questions
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Receive detailed feedback on your answers
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Learn from expert model answers
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Track your progress across different topics
                </li>
              </ul>
              
              <button 
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/topics')}
              >
                Select a Topic
              </button>
            </div>
            
            <div className="bg-indigo-100 md:w-1/2 flex items-center justify-center p-8">
              <div className="relative w-full h-64">
                <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                  {/* Simple interview illustration */}
                  <rect x="50" y="50" width="300" height="200" rx="20" fill="#e0e7ff" />
                  <rect x="80" y="90" width="240" height="30" rx="5" fill="#818cf8" />
                  <rect x="80" y="140" width="240" height="30" rx="5" fill="#818cf8" />
                  <rect x="80" y="190" width="240" height="30" rx="5" fill="#818cf8" />
                  <circle cx="350" cy="50" r="30" fill="#4f46e5" />
                  <path d="M20,250 Q200,150 380,250" stroke="#4f46e5" strokeWidth="3" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          © Vansh's Built | AI-Powered Interview Preparation App
        </div>
      </div>
    </div>
  );
}

export default IntroPage;