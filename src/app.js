import { quizData } from './data.js';
import { createTimerElement, resetTimer, updateTimerDisplay, showTimer } from './timer.js';
import { handleStateOnLoad, saveQuizState } from './localStorage/progressState.js';
import { updateScoreDisplay, initQuestionPage } from './pages/questionPage.js'; 

const loadApp = () => {
  quizData.currentQuestionIndex = 0;
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null);
  quizData.score = 0;

  updateScoreDisplay(quizData.score);
  createTimerElement();
  showTimer();

  resetTimer();
  updateTimerDisplay(0);

  handleStateOnLoad();

  setInterval(() => {
    saveQuizState();
  }, 1000);
  
  initQuestionPage();
};

window.addEventListener('load', loadApp);
