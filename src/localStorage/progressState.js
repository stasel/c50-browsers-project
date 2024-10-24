import { NEXT_QUESTION_BUTTON_ID } from '../constants.js';
import { quizData } from '../data.js';
import { getQuizDuration, resetTimer, startTimerFunction } from '../timer.js';
import { initQuestionPage } from '../pages/questionPage.js';
import { initWelcomePage } from '../pages/welcomePage.js';

// Function to save the quiz state
export function saveQuizState() {
  const quizState = {
    currentQuestionIndex: quizData.currentQuestionIndex,
    selectedAnswers: quizData.selectedAnswers,
    timerState: getQuizDuration(), // Save the elapsed timer state
  };
  localStorage.setItem('quizState', JSON.stringify(quizState));
  console.log("Quiz state saved:", quizState); // Log to check if state is being saved
}


// Function to load the quiz state
export function loadQuizState() {
  const savedState = localStorage.getItem('quizState');
  if (savedState) {
    try {
      const quizState = JSON.parse(savedState);
      quizData.currentQuestionIndex = quizState.currentQuestionIndex || 0;
      quizData.selectedAnswers = quizState.selectedAnswers || [];
      resetTimer(quizState.timerState || 0); // Restore the timer to the saved state
      console.log("Quiz state loaded:", quizState); // Log the loaded state
      return true; // State successfully loaded
    } catch (error) {
      console.error('Failed to parse quiz state:', error);
      localStorage.removeItem('quizState'); // Clear corrupted state
      return false; // Failed to load state
    }
  }
  return false; // No saved state
}

// Function to handle state loading and decide the next step
export function handleStateOnLoad() {
  const stateLoaded = loadQuizState();
  
  if (stateLoaded) {
    console.log("Resuming quiz from saved state");
    startTimerFunction((elapsedTime) => {
      const timerElement = document.getElementById('timer');
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });
    initQuestionPage(); // Resume the quiz from the saved question
  } else {
    console.log("No saved state found, initializing welcome page");
    initWelcomePage(); // Start a new quiz
  }
}

// Clear the quiz state after the quiz is completed
function clearQuizState() {
  localStorage.removeItem('quizState');
  console.log("Quiz state cleared after completion");
}

// Manually test loading the quiz state on page reload
window.addEventListener('load', function () {
  const stateLoaded = loadQuizState();
  
  if (stateLoaded) {
    // Resume quiz with loaded state
    console.log("Resuming quiz from saved state"); // Log state resume
    startTimerFunction((elapsedTime) => {
      const timerElement = document.getElementById('timer');
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });
    initQuestionPage(); // Display the question page based on the saved state
  } else {
    // Start fresh if no state was found
    console.log("No saved state, initializing welcome page"); // Log no saved state
    initWelcomePage();
  }
});

// Trigger save state on next question
document.getElementById(NEXT_QUESTION_BUTTON_ID)?.addEventListener('click', function () {
  saveQuizState(); // Save state before moving to the next question
  quizData.currentQuestionIndex++; // Move to the next question
  console.log("Moving to next question, updated index:", quizData.currentQuestionIndex);
});

// Save the quiz state every second
setInterval(() => {
  saveQuizState();
}, 1000); // Saves the quiz state every 1 second
