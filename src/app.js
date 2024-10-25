import { quizData } from './data.js';
import { initWelcomePage } from './pages/welcomePage.js';
import { createTimerElement, resumeTimerFunction } from './timer.js';
import { initQuestionPage } from './pages/questionPage.js';

const loadApp = () => {
  createTimerElement();
  const savedProgress = JSON.parse(localStorage.getItem('quizData'));
  const savedElapsedTime = localStorage.getItem('elapsedTime');  // Retrieve elapsed time if saved

  if (savedProgress && confirm('Will you continue where you left off?')) {
    quizData.currentQuestionIndex = savedProgress.currentQuestionIndex;
    quizData.selectedAnswers = savedProgress.selectedAnswers;
    quizData.answerStates = savedProgress.answerStates;
    
    resumeTimerFunction(Number(savedElapsedTime), updateTimerDisplay);
    initQuestionPage();
  } else {
    
    localStorage.removeItem('quizData');
    localStorage.removeItem('elapsedTime');
    initWelcomePage();
  }
};

window.addEventListener('load', loadApp);

const updateTimerDisplay = (elapsedTime) => {
  const timerElement = document.getElementById('timer');
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
