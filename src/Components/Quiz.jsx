import React, { useState, useEffect } from 'react';

const PRIMARY_COLOR = '#00538B';
const QUIZ_DURATION_MINUTES = 15;

const Quiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testEnded, setTestEnded] = useState(false); // New state to control the end screen

  useEffect(() => {
    fetch('/csharp-questions.json')
      .then(response => response.json())
      .then(data => {
        setQuizData(data);
        setUserAnswers(new Array(data.questions.length).fill(null));
      })
      .catch(error => console.error('Error fetching quiz data:', error));
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setTestEnded(true); // End the test when time is up
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startQuiz = () => {
    setIsActive(true);
  };

  const handleAnswerChange = (key) => {
    const currentQuestionData = quizData.questions[currentQuestion];
    if (Array.isArray(currentQuestionData.correctAnswer)) {
      setSelectedAnswers(prev =>
        prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
      );
    } else {
      setSelectedAnswers([key]);
    }
  };

  const handleNextOrSubmit = () => {
    if (!quizData) return;

    const currentQuestionData = quizData.questions[currentQuestion];
    let pointsEarned = 0;

    if (Array.isArray(currentQuestionData.correctAnswer)) {
      const totalCorrectAnswers = currentQuestionData.correctAnswer.length;
      const correctSelectedAnswers = selectedAnswers.filter(answer =>
        currentQuestionData.correctAnswer.includes(answer)
      ).length;
      pointsEarned = correctSelectedAnswers / totalCorrectAnswers;
    } else {
      pointsEarned = selectedAnswers.includes(currentQuestionData.correctAnswer) ? 1 : 0;
    }

    setScore(score + pointsEarned);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswers;
    setUserAnswers(newUserAnswers);

    if (currentQuestion + 1 < quizData.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
    } else {
      setTestEnded(true); // End the test on submit
      setIsActive(false);
    }
  };

  const handleShowScore = () => {
    setShowScore(true);
  };


  const renderAnswers = () => {
    const currentQuestionData = quizData.questions[currentQuestion];
    const isMultipleAnswer = Array.isArray(currentQuestionData.correctAnswer);

    return Object.entries(currentQuestionData.answers).map(([key, value]) => (
      <div key={key} className="mb-2">
        <label className="flex items-center w-full">
          <input
            type={isMultipleAnswer ? "checkbox" : "radio"}
            checked={selectedAnswers.includes(key)}
            onChange={() => handleAnswerChange(key)}
            name={`question-${currentQuestion}`}
            className="absolute opacity-0 w-0 h-0"
          />
          <span className={`
            flex items-center w-full p-3 rounded-lg cursor-pointer transition-colors duration-200
            ${selectedAnswers.includes(key)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          `}>
            <span className="mr-2 text-lg font-semibold">{key.toUpperCase()}.</span>
            <span>{value}</span>
          </span>
        </label>
      </div>
    ));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderQuizResults = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
      <p className="text-xl mb-4">
        Your score: {score.toFixed(2)} out of {quizData.questions.length}
      </p>
      <p className="text-xl mb-4">
        {((score / quizData.questions.length) * 100).toFixed(2)}%
      </p>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Quiz Review:</h3>
        {quizData.questions.map((question, index) => (
          <div key={index} className="mb-8 p-4 border rounded text-left">
            <p className="font-bold text-lg mb-2">Question {index + 1}: {question.question}</p>
            <div className="mb-4">
              {Object.entries(question.answers).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-2 mb-2 rounded ${Array.isArray(question.correctAnswer)
                      ? question.correctAnswer.includes(key)
                        ? 'bg-green-100'
                        : userAnswers[index] && userAnswers[index].includes(key)
                          ? 'bg-red-100'
                          : 'bg-gray-100'
                      : key === question.correctAnswer
                        ? 'bg-green-100'
                        : userAnswers[index] && userAnswers[index].includes(key)
                          ? 'bg-red-100'
                          : 'bg-gray-100'
                    }`}
                >
                  {key.toUpperCase()}. {value}
                  {Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.includes(key) && ' ✓'
                    : key === question.correctAnswer && ' ✓'}
                  {userAnswers[index] && userAnswers[index].includes(key) && ' (Your answer)'}
                </div>
              ))}
            </div>
            <p className={userAnswers[index] ? (
              Array.isArray(question.correctAnswer)
                ? question.correctAnswer.every(a => userAnswers[index].includes(a)) &&
                  userAnswers[index].length === question.correctAnswer.length
                : userAnswers[index].includes(question.correctAnswer)
            ) ? 'text-green-600 font-bold' : 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
              {userAnswers[index]
                ? (Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.every(a => userAnswers[index].includes(a)) &&
                      userAnswers[index].length === question.correctAnswer.length
                    : userAnswers[index].includes(question.correctAnswer)
                  ) ? 'Correct' : 'Incorrect'
                : 'Not Answered'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!quizData) return <div>Loading quiz data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      {showScore ? (
        renderQuizResults()
      ) : testEnded ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test Ended</h2>
          <button
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="py-2 px-4 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            onClick={handleShowScore}
          >
            Show Score
          </button>
        </div>
      ) : !isActive ? (
        <>
          <button
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            onClick={startQuiz}
          >
            Start Quiz
          </button>
          <p className="mt-6 text-sm text-gray-600">
            Please note: Once you start the quiz, you cannot go back to previous questions.
            Take your time to answer each question carefully.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 text-right">
            <span className="font-bold">Time left: {formatTime(timeLeft)}</span>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              Question {currentQuestion + 1}/{quizData.questions.length}
            </h2>
            <p className="text-lg">{quizData.questions[currentQuestion].question} {Array.isArray(quizData.questions[currentQuestion].correctAnswer) ? "(Multiple Choice)" : ""}</p>
          </div>
          <div className="space-y-2">
            {renderAnswers()}
          </div>
          <button
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            onClick={handleNextOrSubmit}
            disabled={selectedAnswers.length === 0}
          >
            {currentQuestion + 1 < quizData.questions.length ? 'Next' : 'Submit'}
          </button>
        </>
      )}
    </div>
  );
};

export default Quiz;