import { quizData } from './data.js';
import { createTimerElement } from './timer.js';
import { handleStateOnLoad, saveQuizState } from './localStorage/progressState.js';

const loadApp = () => {
  createTimerElement(); 
  handleStateOnLoad();

  setInterval(() => {
    saveQuizState();
  }, 1000);

};

window.addEventListener('load', loadApp);

