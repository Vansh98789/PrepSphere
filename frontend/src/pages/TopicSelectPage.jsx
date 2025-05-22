import React from 'react';
import { useNavigate } from 'react-router-dom';

function TopicSelectPage() {
  const navigate = useNavigate();
  
  // List of available topics - you can expand this as needed
  const topics = [
    { id: 'javascript', name: 'JavaScript', icon: '📜', color: 'bg-yellow-100 border-yellow-400' },
    { id: 'react', name: 'React', icon: '⚛️', color: 'bg-blue-100 border-blue-400' },
    { id: 'node', name: 'Node.js', icon: '🟩', color: 'bg-green-100 border-green-400' },
    { id: 'python', name: 'Python', icon: '🐍', color: 'bg-indigo-100 border-indigo-400' },
    { id: 'java', name: 'Java', icon: '☕', color: 'bg-orange-100 border-orange-400' },
    { id: 'data-structures', name: 'Data Structures', icon: '🔢', color: 'bg-purple-100 border-purple-400' },
    { id: 'algorithms', name: 'Algorithms', icon: '🧮', color: 'bg-red-100 border-red-400' },
    { id: 'system-design', name: 'System Design', icon: '🏗️', color: 'bg-teal-100 border-teal-400' },
    { id: 'databases', name: 'Databases', icon: '💾', color: 'bg-cyan-100 border-cyan-400' }
  ];

  const handleTopicSelect = (topicId) => {
    navigate(`/interview/${topicId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">Select a Topic</h1>
          <p className="text-lg text-gray-600 mb-8">Choose a topic to begin your interview practice session</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {topics.map(topic => (
            <div 
              key={topic.id} 
              className={`${topic.color} border-2 rounded-xl p-6 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer`}
              onClick={() => handleTopicSelect(topic.id)}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-3">{topic.icon}</div>
                <div className="text-xl font-semibold text-gray-800">{topic.name}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopicSelectPage;