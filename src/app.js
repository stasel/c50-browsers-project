import { quizData } from './data.js';
import { initWelcomePage } from './pages/welcomePage.js';
import { createTimerElement, resumeTimerFunction, updateTimerDisplay, getQuizDuration } from './timer.js';
import { initQuestionPage } from './pages/questionPage.js';
import { loadProgress, clearProgress, saveProgress } from './quizProgress.js';

const loadApp = () => {
  createTimerElement();

  const { quizData: savedQuizData, elapsedTime: savedElapsedTime } = loadProgress();

  if (savedQuizData) {
    Object.assign(quizData, savedQuizData);
    resumeTimerFunction(savedElapsedTime, updateTimerDisplay);
    initQuestionPage();
  } else {
    clearProgress();
    initWelcomePage();
  }
};

window.addEventListener('beforeunload', () => {
  const elapsedTime = getQuizDuration();
  quizData.page = quizData.page || 'quiz';
  saveProgress(quizData, elapsedTime);
});

window.addEventListener('load', loadApp);
