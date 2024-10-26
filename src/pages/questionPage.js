import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  PREVIOUS_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';
import { getQuizDuration, startTimerFunction, stopTimer, resetTimer, hideTimer, showTimer, updateTimerDisplay} from '../timer.js';
import { saveProgress } from '../quizProgress.js';
import { initWelcomePage } from './welcomePage.js';  

export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = ''; // Clear the interface before rendering the new question

  showTimer();

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    console.error("No questions found in quizData. Returning to welcome page.");
    initWelcomePage();
    return;
  }

  if (quizData.currentQuestionIndex >= quizData.questions.length) {
    showResultsPage();
    return;
  }

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  if (!currentQuestion || !currentQuestion.answers) {
    console.error("Invalid question structure. Returning to welcome page.");
    initWelcomePage();
    return;
  }

  const questionElement = createQuestionElement(currentQuestion.text); 
  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = ''; 

  const selectedAnswers = quizData.selectedAnswers ? quizData.selectedAnswers[quizData.currentQuestionIndex] || [] : [];
  const answerState = quizData.answerStates && quizData.answerStates[quizData.currentQuestionIndex] || {};

  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple); 
    const input = answerElement.querySelector('input');

    if ((currentQuestion.multiple && selectedAnswers.includes(key)) || (!currentQuestion.multiple && selectedAnswers === key)) {
      input.checked = true;
    }

    if (answerState[key]) {
      answerElement.style.backgroundColor = answerState[key] === 'correct' ? 'lightgreen' : 'lightcoral';
      if (answerState[key] === 'incorrect') input.disabled = true;
    }

    answerElement.querySelector('input').addEventListener('change', () => selectAnswer(key, currentQuestion.multiple));
    answersListElement.appendChild(answerElement);
  }

  document.getElementById(NEXT_QUESTION_BUTTON_ID).addEventListener('click', nextQuestion);
};

  const previousButton = document.getElementById(PREVIOUS_QUESTION_BUTTON_ID);
  if (previousButton && !previousButton.onclick) {
    previousButton.addEventListener('click', previousQuestion);
  }
  
// Go to the next question
const nextQuestion = () => {
  quizData.currentQuestionIndex += 1; 
  saveProgress(quizData, getQuizDuration());
  initQuestionPage(); // Load the next question page
};

// Go to the previous question
const previousQuestion = () => {
  quizData.currentQuestionIndex -= 1; // Move to the previous question
  saveProgress(); 
  initQuestionPage(); // Re-initialize the question page
};

// Handle when a user selects an answer
const selectAnswer = (key, isMultiple) => {
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const answersListElement = document.getElementById(ANSWERS_LIST_ID);

  quizData.answerStates = quizData.answerStates || [];
  quizData.selectedAnswers = quizData.selectedAnswers || new Array(quizData.questions.length).fill(null).map(() => []);

  if (!quizData.answerStates) {
    quizData.answerStates = [];
  }
  if (!quizData.selectedAnswers) {
    quizData.selectedAnswers = new Array(quizData.questions.length).fill(null).map(() => []);
  }

  let answerState = quizData.answerStates[quizData.currentQuestionIndex] || {};
  if (!answerState) {
    answerState = {};
    quizData.answerStates[quizData.currentQuestionIndex] = answerState;
  }

  if (isMultiple) {
    const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || [];

    if (selectedAnswers.includes(key)) {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = selectedAnswers.filter(answer => answer !== key);
    } else {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = [...selectedAnswers, key];
    }

    if (currentQuestion.correct.includes(key)) {
      document.querySelector(`input[value="${key}"]`).parentNode.parentNode.classList.add('correct');
      answerState[key] = 'correct'; 
    } else {
      document.querySelector(`input[value="${key}"]`).parentNode.parentNode.classList.add('wrong');
      answerState[key] = 'incorrect'; 

      Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
        input.disabled = true;
      });
    }
  } else {
    quizData.selectedAnswers[quizData.currentQuestionIndex] = key;

    Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
      input.disabled = true;
    });

    for (const [answerKey] of Object.entries(currentQuestion.answers)) {
      const answerElement = document.querySelector(`input[value="${answerKey}"]`).parentNode.parentNode;

      if (answerKey === currentQuestion.correct) {
        answerElement.classList.add('correct');
        answerState[answerKey] = 'correct'; 
      } else if (answerKey === key) {
        answerElement.classList.add('wrong');
        answerState[answerKey] = 'incorrect'; 
      }
    }
  }

  quizData.answerStates[quizData.currentQuestionIndex] = answerState;
  saveProgress(quizData, getQuizDuration());
};

// Show the results page
const showResultsPage = () => {
  stopTimer();
  quizData.page = 'resultsPage';
  saveProgress(quizData, getQuizDuration());
  const quizDuration = getQuizDuration(); // Get the quiz duration
  const formattedTime = formatTime(quizDuration);
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = ''; // Clear the interface

  const totalQuestions = quizData.questions.length;
  let userScore = 0;

  // Calculate the user's score
  quizData.questions.forEach((question, index) => {
    const userAnswer = quizData.selectedAnswers ? quizData.selectedAnswers[index] : null;

    if (userAnswer !== null && userAnswer.length > 0) {
      if (question.multiple) {
        const correctAnswers = question.correct.split(',').map(answer => answer.trim()).sort();
        const selectedAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : [];

        if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
          userScore += 1;
        }
      } else {
        if (userAnswer === question.correct) {
          userScore += 1;
        }
      }
    }
  });

  // Display the results and options to start over or review answers
  const resultElement = document.createElement('div');
  resultElement.innerHTML = String.raw`
    <h1>Congratulations!</h1>
    <p>You scored ${userScore} out of ${totalQuestions}!</p>
    <p>You completed the quiz in ${formattedTime} minutes.</p>
    <button id="check-answers-button">Check Your Answers</button>
    <button id="start-over-button">Start Over</button>
  `;

  userInterface.appendChild(resultElement);

  hideTimer();

  // Set up the button to restart the quiz
  document
    .getElementById('start-over-button')
    .addEventListener('click', resetQuiz);

  // Set up the button to review answers
  document
    .getElementById('check-answers-button')
    .addEventListener('click', reviewAnswers);
    quizData.page = 'resultsPage'; // track state
    saveProgress(quizData, quizDuration);
};

// Reset the quiz and clear all saved data
const resetQuiz = () => {
  localStorage.clear();
  quizData.currentQuestionIndex = 0;
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null);
  quizData.answerStates = {};

 resetTimer();
  startTimerFunction(updateTimerDisplay);
  initWelcomePage();
};

// Review the user's answers
const reviewAnswers = () => {
  quizData.page = 'reviewPage';
  saveProgress(quizData, getQuizDuration());
  quizData.currentQuestionIndex = 0; // Start review from the beginning
  showReviewPage();
};

// Show the review page for a single question
const showReviewPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = ''; // Clear the interface

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const storedQuizData = JSON.parse(localStorage.getItem('quizData')) || {}; // Get saved quiz data

  const selectedAnswers = storedQuizData.selectedAnswers && storedQuizData.selectedAnswers[quizData.currentQuestionIndex]
    ? storedQuizData.selectedAnswers[quizData.currentQuestionIndex]
    : null;

  const questionElement = createQuestionElement(currentQuestion.text);
  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = ''; // Clear previous answers

  // Loop through and display all answers with correct/incorrect feedback
  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple);
    const input = answerElement.querySelector('input');

    if (selectedAnswers && ((currentQuestion.multiple && selectedAnswers.includes(key)) || 
        (!currentQuestion.multiple && selectedAnswers === key))) {
      input.checked = true;

      if (currentQuestion.correct.includes(key)) {
        answerElement.style.backgroundColor = 'lightgreen'; // Correct answer
      } else {
        answerElement.style.backgroundColor = 'lightcoral'; // Incorrect answer
      }
    }

    input.disabled = true; // Disable inputs in review mode

    answersListElement.appendChild(answerElement);
  }

  // Set up "Next" button for review navigation
  document
    .getElementById(NEXT_QUESTION_BUTTON_ID)
    .addEventListener('click', nextReviewQuestion);

  // Set up "Previous" button for review navigation
  const previousButton = document.getElementById(PREVIOUS_QUESTION_BUTTON_ID);
  if (previousButton) {
    previousButton.addEventListener('click', previousReviewQuestion);

    if (quizData.currentQuestionIndex === 0) {
      previousButton.style.display = 'none';
    } else {
      previousButton.style.display = 'inline-block';
    }
  }
  saveProgress(quizData, getQuizDuration());
};

// Go to the next question in review mode
const nextReviewQuestion = () => {
  quizData.currentQuestionIndex += 1;
  if (quizData.currentQuestionIndex < quizData.questions.length) {
    showReviewPage(); // Show the next question
  } else {
    showResultsPage(); // If no more questions, return to the results page
  }
};

// Go to the previous question in review mode
const previousReviewQuestion = () => {
  quizData.currentQuestionIndex -= 1;
  if (quizData.currentQuestionIndex >= 0) {
    showReviewPage(); // Show the previous question
  }
};

//create progress-bar
const createProgressBarElement = () => {
  const progressContainer = document.createElement('div'); 
  progressContainer.id = 'progress-container'; 
  const progressBar = document.createElement('progress');
  progressBar.id = 'progress-bar';
  progressBar.value = 0; 
  progressBar.max = 100;  
  progressContainer.appendChild(progressBar);

  return progressContainer;  
}


const updateProgressBar = (currentQuestionIndex, totalQuestions) => {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const progressPercentage = (currentQuestionIndex / totalQuestions) * 100; 
    progressBar.value = progressPercentage; 
  }
};

const updateScoreDisplay = () => {
  const scoreElement = document.getElementById('score-display'); // Get the score display element
  let userScore = 0; // Initialize the variable to store the total score

  // Calculate the score based on the answers
  quizData.questions.forEach((question, index) => {
    const userAnswer = quizData.selectedAnswers ? quizData.selectedAnswers[index] : null; // Get the user's answer for the current question

    if (userAnswer !== null && userAnswer.length > 0) { // Check if the user has selected an answer
      if (question.multiple) { // Check if the question allows multiple answers
        const correctAnswers = question.correct.split(',').map(answer => answer.trim()).sort(); // Get and format the correct answers
        const selectedAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : []; // Sort the selected answers

        // Check if all correct answers have been selected
        const allCorrectSelected = correctAnswers.every(answer => selectedAnswers.includes(answer));
        // Check if there are any incorrect answers selected
        const anyIncorrectSelected = selectedAnswers.some(answer => !correctAnswers.includes(answer));

        // If all correct answers are selected and there are no incorrect answers, add one point
        if (allCorrectSelected && !anyIncorrectSelected) {
          userScore += 1; // Add one point for the correct answers
        }
      } else {
        // For single answer questions
        if (userAnswer === question.correct) { // Check if the selected answer is correct
          userScore += 1; // Add one point for the correct answer
        }
      }
    }
  });

  // Update the score display
  if (scoreElement) {
    scoreElement.textContent = `Score: ${userScore}`; // Update the text with the current score
  } else {
    // If the score display doesn't exist, create it
    const newScoreElement = document.createElement('div'); // Create a new div for the score
    newScoreElement.id = 'score-display'; // Set the id for the score display
    newScoreElement.textContent = `Score: ${userScore}`; // Set the initial text for the score
    document.getElementById(USER_INTERFACE_ID).prepend(newScoreElement); // Prepend it to the user interface
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
