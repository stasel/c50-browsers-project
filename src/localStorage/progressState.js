import { NEXT_QUESTION_BUTTON_ID } from '../constants.js';
import { quizData } from '../data.js';
import { getQuizDuration, resetTimer, startTimerFunction, updateTimerDisplay } from '../timer.js';
import { initQuestionPage } from '../pages/questionPage.js';
import { initWelcomePage } from '../pages/welcomePage.js';

export function saveQuizState() {
  const quizState = {
    currentQuestionIndex: quizData.currentQuestionIndex,
    selectedAnswers: quizData.selectedAnswers,
    timerState: getQuizDuration(),
  };
  localStorage.setItem('quizState', JSON.stringify(quizState));
}

export function loadQuizState() {
  const savedState = localStorage.getItem('quizState');
  if (savedState) {
    try {
      const quizState = JSON.parse(savedState);
      quizData.currentQuestionIndex = quizState.currentQuestionIndex || 0;
      quizData.selectedAnswers = quizState.selectedAnswers || [];
      return true;
    } catch (error) {
      localStorage.removeItem('quizState');
      return false;
    }
  }
  return false;
}

export const handleStateOnLoad = () => {
  const stateLoaded = loadQuizState();

  if (stateLoaded) {
    const savedTimerState = window.localStorage.timerState || 0; 
    let adjustedStartTimer = Date.now() - (savedTimerState * 1000); 

    startTimerFunction(updateTimerDisplay, savedTimerState);
    // startTimerFunction((null, savedTimerState) => {
    //   console.log(`savedTimerState2: ${savedTimerState}`);
    //   const totalElapsedTime = savedTimerState + elapsedTime;

    //   const minutes = Math.floor(totalElapsedTime / 60);
    //   const seconds = totalElapsedTime % 60;

    //   const timerElement = document.getElementById('timer');
    //   if (timerElement) {
    //     timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    //   }
    // });

    initQuestionPage();
  } else {
    initWelcomePage();
  }
};

document.getElementById(NEXT_QUESTION_BUTTON_ID)?.addEventListener('click', function () {
  saveQuizState();
  quizData.currentQuestionIndex++;
});

setInterval(() => {
  saveQuizState();
}, 1000);
