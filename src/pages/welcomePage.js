import { USER_INTERFACE_ID, START_QUIZ_BUTTON_ID } from '../constants.js';
import { createWelcomeElement } from '../views/welcomeView.js';
import { initQuestionPage } from './questionPage.js';
import { startTimerFunction } from '../timer.js'; 

export const initWelcomePage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const welcomeElement = createWelcomeElement();
  userInterface.appendChild(welcomeElement);

  document
    .getElementById(START_QUIZ_BUTTON_ID)
    .addEventListener('click', startQuiz);
};

const updateTimerDisplay = (elapsedTime) => {
  const timerElement = document.getElementById('timer');
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const startQuiz = () => {
  startTimerFunction(updateTimerDisplay); 
  initQuestionPage();
};
