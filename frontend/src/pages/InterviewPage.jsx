import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function InterviewPage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsHistory, setQuestionsHistory] = useState([]);
  
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcript;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        
        setTranscript(finalTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('Error with speech recognition. Please try again.');
        setIsRecording(false);
      };
    } else {
      setError('Speech recognition not supported in this browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [transcript]);
  
  // Fetch question on component mount and when question index changes
  useEffect(() => {
    const fetchQuestion = async () => {
      // Don't do anything if interview is completed
      if (isCompleted) return;
      
      // Don't fetch question if we're showing feedback
      if (feedback) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        console.log("Fetching question for index:", currentQuestionIndex);
        
        // Check if we already have this question in history
        if (questionsHistory[currentQuestionIndex]) {
          console.log("Using cached question:", questionsHistory[currentQuestionIndex]);
          setQuestion(questionsHistory[currentQuestionIndex]);
          setIsLoading(false);
          
          // Speak the question
          speakText(questionsHistory[currentQuestionIndex]);
          return;
        }
        
        const response = await axios.post('https://prep-sphere-backend.vercel.app/api/get-question', {
          topic,
          questionIndex: currentQuestionIndex
        });
        
        console.log("Question API response:", response.data);
        
        if (response.data.question === null) {
          // No more questions, show results
          console.log("No more questions, navigating to results");
          setIsCompleted(true);
          navigate('/results', { 
            state: { 
              scores, 
              topic,
              totalScore: scores.reduce((sum, score) => sum + score.score, 0)
            } 
          });
          return;
        }
        
        // Store the question in history and set current question
        setQuestionsHistory(prev => {
          const updated = [...prev];
          updated[currentQuestionIndex] = response.data.question;
          return updated;
        });
        
        setQuestion(response.data.question);
        setTranscript(''); // Clear transcript for new question
        setIsLoading(false);
        
        // Speak the question
        speakText(response.data.question);
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Failed to fetch question. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchQuestion();
  }, [currentQuestionIndex, topic, navigate, isCompleted, scores, feedback]);
  
  // Function to speak text
  const speakText = (text) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    synth.speak(utterance);
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  
  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!transcript.trim()) {
      setError('Please record an answer before submitting.');
      return;
    }
    
    try {
      setIsLoading(true);
      setIsSubmitting(true);
      setError(''); // Clear any previous errors
      
      console.log("Submitting answer:", transcript);
      
      const response = await axios.post('https://prep-sphere-backend.vercel.app/api/submit-answer', {
        topic,
        question,
        answer: transcript
      });
      
      console.log("Response received:", response.data);
      
      // Debug what was received
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      let score = 0;
      if (typeof response.data.score === 'number') {
        score = response.data.score;
      } else if (typeof response.data.score === 'string' && !isNaN(parseInt(response.data.score))) {
        score = parseInt(response.data.score);
      } else {
        console.warn("Score is invalid:", response.data.score);
      }
      
      // Fix for feedback - make sure we're getting proper formatted feedback
      let feedbackText = "No feedback available";
      if (response.data.feedback && typeof response.data.feedback === 'string') {
        feedbackText = response.data.feedback.trim();
      }
      
      let idealAnswerText = "No ideal answer available";
      if (response.data.idealAnswer && typeof response.data.idealAnswer === 'string') {
        idealAnswerText = response.data.idealAnswer.trim();
      }
      
      // Update feedback state directly
      const feedbackData = {
        score: score,
        feedback: feedbackText,
        idealAnswer: idealAnswerText
      };
      
      console.log("Processed feedback data:", feedbackData);
      
      // First update scores array
      setScores(prevScores => [...prevScores, { 
        questionIndex: currentQuestionIndex,
        question,
        answer: transcript,
        score: feedbackData.score,
        feedback: feedbackData.feedback,
        idealAnswer: feedbackData.idealAnswer
      }]);
      
      // Then set feedback state
      setFeedback(feedbackData);
      
      console.log("Feedback state set:", feedbackData);
      
    } catch (error) {
      console.error("Error submitting answer:", error.response?.data || error.message);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };
  
  // Move to next question
  const nextQuestion = () => {
    console.log("Moving to next question, current index:", currentQuestionIndex);
    
    // Clear feedback and transcript before moving to next question
    setFeedback(null);
    setTranscript('');
    
    // Fixed: Using functional update to ensure state updates correctly
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      
      // Add delay to ensure state changes have propagated before fetching next question
      setTimeout(() => {
        console.log("State updated, now at question index:", currentQuestionIndex + 1);
      }, 100);
    } else {
      setIsCompleted(true);
      // Fixed: Make sure we have scores before navigating
      const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
      console.log("Interview completed. Total score:", totalScore);
      console.log("Navigating to results with scores:", scores);
      
      navigate('/results', { 
        state: { 
          scores, 
          topic,
          totalScore
        } 
      });
    }
  };
  
  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${(currentQuestionIndex / 5) * 100}%` }}
        ></div>
        <div className="text-xs text-gray-500 mt-1">
          Question {currentQuestionIndex + 1} of 5
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                className="float-right font-bold"
                onClick={() => setError('')}
              >
                &times;
              </button>
            </div>
          )}
          
          {renderProgress()}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Question:</h2>
                <div className="bg-indigo-50 p-4 rounded-lg text-lg">
                  {question}
                </div>
                <button 
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                  onClick={() => speakText(question)}
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Hear question again
                </button>
              </div>
              
              {!feedback ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Answer:</h2>
                  <div className={`border rounded-lg p-4 min-h-24 ${isRecording ? 'border-red-400 bg-red-50 animate-pulse' : 'border-gray-300'}`}>
                    {transcript ? transcript : (
                      <span className="text-gray-400 italic">
                        {isRecording ? 'Recording your answer...' : 'Click the microphone button to start recording your answer'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      className={`flex items-center justify-center p-3 rounded-full ${isRecording ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'} transition-all duration-300`}
                      onClick={toggleRecording}
                      disabled={isSubmitting}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
                      onClick={submitAnswer}
                      disabled={!transcript.trim() || isLoading || isRecording || isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8" data-testid="feedback-section">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Feedback:</h2>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                      <div className="text-xl font-bold mr-2">Score:</div>
                      <div className="text-2xl font-bold text-indigo-700">{feedback.score}/10</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="font-semibold mb-1">Feedback:</div>
                      <div className="text-gray-700 whitespace-pre-line">{feedback.feedback}</div>
                    </div>
                    
                    <div>
                      <div className="font-semibold mb-1">Ideal Answer:</div>
                      <div className="text-gray-700 whitespace-pre-line">{feedback.idealAnswer}</div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg"
                    onClick={nextQuestion}
                  >
                    {currentQuestionIndex < 4 ? 'Next Question' : 'See Final Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {!isLoading && !feedback && (
          <div className="flex justify-center">
            <button 
              className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
              onClick={() => navigate('/topics')}
            >
              Cancel Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewPage;
