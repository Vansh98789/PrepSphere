import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scores, topic, totalScore } = location.state || { scores: [], topic: '', totalScore: 0 };
  
  // Format topic name for display
  const formatTopicName = (topicId) => {
    return topicId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get color class based on score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get overall performance message
  const getPerformanceMessage = () => {
    const percentage = (totalScore / 50) * 100;
    
    if (percentage >= 80) {
      return "Excellent work! You're well-prepared for technical interviews on this topic.";
    } else if (percentage >= 60) {
      return "Good job! With a bit more practice, you'll be ready for your interviews.";
    } else {
      return "Keep practicing! Review the model answers to strengthen your understanding.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-700 mb-2">Your Results</h1>
            <p className="text-lg text-gray-600">
              {formatTopicName(topic)} Interview Practice Session
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-indigo-700">{totalScore}</div>
                <div className="text-xl text-gray-500">/50</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#e0e7ff" 
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * totalScore / 50)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg mb-8">
            <p className="text-lg text-center font-medium">
              {getPerformanceMessage()}
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Breakdown</h2>
            
            <div className="space-y-4">
              {scores.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">Question {index + 1}</div>
                    <div className={`font-bold ${getScoreColor(item.score)}`}>
                      Score: {item.score}/10
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-sm text-gray-500 mb-1">Question:</div>
                    <div className="text-gray-700">{item.question}</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-sm text-gray-500 mb-1">Your Answer:</div>
                    <div className="text-gray-700">{item.answer}</div>
                  </div>
                  
                  <div>
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                      onClick={() => document.getElementById(`feedback-${index}`).classList.toggle('hidden')}
                    >
                      View Feedback &amp; Ideal Answer
                    </button>
                    
                    <div id={`feedback-${index}`} className="hidden mt-2 p-3 bg-gray-50 rounded">
                      <div className="mb-2">
                        <div className="text-sm font-semibold">Feedback:</div>
                        <div className="text-gray-700 text-sm">{item.feedback}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold">Ideal Answer:</div>
                        <div className="text-gray-700 text-sm">{item.idealAnswer}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <button 
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              onClick={() => navigate(`/interview/${topic}`)}
            >
              Try Again
            </button>
            
            <button 
              className="py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
              onClick={() => navigate('/topics')}
            >
              Choose Different Topic
            </button>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} PrepSphere | AI-Powered Interview Preparation
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;