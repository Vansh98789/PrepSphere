import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import TopicSelectPage from './pages/TopicSelectPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/topics" element={<TopicSelectPage />} />
          <Route path="/interview/:topic" element={<InterviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;