import { useState, useEffect } from 'react';
import DPquestions from '../data/DPquestions';

const getTenRandomQuestions = (level) => {
  const filtered = DPquestions.filter(q => q.level === level);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
};

function WineQuiz() {
  const [difficulty, setDifficulty] = useState('easy');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  useEffect(() => {
    const preview = getTenRandomQuestions(difficulty);
    setFilteredQuestions(preview);
  }, [difficulty]);

  useEffect(() => {
    let timer;
    if (showQuiz && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (showQuiz && timeLeft === 0) {
      handleNext();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showQuiz]);

  const handleStart = () => {
    const selected = getTenRandomQuestions(difficulty);
    if (selected.length === 0) return;
    setFilteredQuestions(selected);
    setShowQuiz(true);
    setQuestionIndex(0);
    setScore(0);
    setTimeLeft(20);
    setWrongAnswers([]);
  };

  const handleNext = () => {
    if (questionIndex < filteredQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setTimeLeft(20);
    } else {
      setShowQuiz(false);
    }
  };

  const handleAnswer = (choice) => {
    const current = filteredQuestions[questionIndex];
    if (choice === current.answer) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, {
        question: current.question,
        selected: choice,
        correct: current.answer
      }]);
    }
    handleNext();
  };

  const handleRestart = () => {
    setShowQuiz(false);
    setQuestionIndex(0);
    setScore(0);
    setTimeLeft(20);
    setWrongAnswers([]);
  };

  return (
    <div className="quiz-container">
      <h3>Test Your Beverage Knowledge</h3>

      {!showQuiz ? (
        <>
          <div className="quiz-controls">
          <label>Select Difficulty:</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={handleStart}>Start Quiz</button>
          </div>
        </>
      ) : (
        <>
          {filteredQuestions.length > 0 ? (
            <>
              <p><strong>Time left:</strong> {timeLeft}s</p>
              <p><strong>Question:</strong> {filteredQuestions[questionIndex].question}</p>
              <div className="answer-grid">
                    {filteredQuestions[questionIndex].choices.map((choice, i) => (
                    <button key={i} onClick={() => handleAnswer(choice)}>{choice}</button>
                    ))}
                </div>

              <p>Question {questionIndex + 1} of {filteredQuestions.length}</p>
              <p>Score: {score} / {filteredQuestions.length}</p>
            </>
          ) : (
            <p>No questions found for difficulty: {difficulty}</p>
          )}
        </>
      )}

      {!showQuiz && score >= 0 && filteredQuestions.length > 0 && (
        <>
          <h4>Score: {score} / {filteredQuestions.length}</h4>
          <button onClick={handleRestart}>Reset Quiz</button>

          {wrongAnswers.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4>Review Incorrect Answers:</h4>
              <ul>
                {wrongAnswers.map((item, i) => (
                  <li key={i} style={{ marginBottom: '1rem' }}>
                    <strong>Q:</strong> {item.question}<br />
                    <span style={{ color: 'red' }}><strong>Your answer:</strong> {item.selected}</span><br />
                    <span style={{ color: 'green' }}><strong>Correct answer:</strong> {item.correct}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WineQuiz;
