import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  PREVIOUS_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';
import { startTimerFunction, stopTimer, getQuizDuration, resetTimer, hideTimer, showTimer} from '../timer.js';

// Loads the app when the page is first opened
const loadApp = () => {
  quizData.currentQuestionIndex = 0; // Start from the first question
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null); // Initialize answers array
  initQuestionPage(); // Initialize the first question
};

window.addEventListener('load', loadApp); // Set up loadApp to run when the page loads

// Initialize the question page
export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = ''; // Clear the interface before rendering the new question

  showTimer();

  // If there are no more questions, show the results page
  if (quizData.currentQuestionIndex >= quizData.questions.length) {
    showResultsPage();
    return;
  }

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex]; // Get the current question

  const questionElement = createQuestionElement(currentQuestion.text); // Create the question element
  userInterface.appendChild(questionElement); // Append the question element to the page

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = ''; // Clear previous answers

  const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || []; // Get the selected answers for this question
  const answerState = quizData.answerStates && quizData.answerStates[quizData.currentQuestionIndex] || {}; // Get the state of answers

  // Loop through each answer option and render it
  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple); // Create the answer element
    const input = answerElement.querySelector('input');

    // Pre-check answers that were already selected by the user
    if ((currentQuestion.multiple && selectedAnswers.includes(key)) || (!currentQuestion.multiple && selectedAnswers === key)) {
      input.checked = true;
    }

    // If the answer has been graded (correct/incorrect), color it accordingly
    if (answerState[key]) {
      if (answerState[key] === 'correct') {
        answerElement.style.backgroundColor = 'lightgreen'; // Correct answer
      } else if (answerState[key] === 'incorrect') {
        answerElement.style.backgroundColor = 'lightcoral'; // Incorrect answer
        input.disabled = true; // Disable the input if the answer was incorrect
      }
    }

    // Set up the event listener for answer selection
    answerElement.querySelector('input').addEventListener('change', () => selectAnswer(key, currentQuestion.multiple));
    answersListElement.appendChild(answerElement);
  }

  // Set up "Next" button to go to the next question
  document
    .getElementById(NEXT_QUESTION_BUTTON_ID)
    .addEventListener('click', nextQuestion);

  // Set up "Previous" button to go to the previous question
  const previousButton = document.getElementById(PREVIOUS_QUESTION_BUTTON_ID);
  if (previousButton) {
    previousButton.addEventListener('click', previousQuestion);

    // Hide the "Previous" button for the first question
    if (quizData.currentQuestionIndex === 0) {
      previousButton.style.display = 'none';
    } else {
      previousButton.style.display = 'inline-block';
    }
  }
};

// Go to the next question
const nextQuestion = () => {
  quizData.currentQuestionIndex += 1; // Move to the next question
  initQuestionPage(); // Re-initialize the question page
};

// Go to the previous question
const previousQuestion = () => {
  quizData.currentQuestionIndex -= 1; // Move to the previous question
  initQuestionPage(); // Re-initialize the question page
};

// Handle when a user selects an answer
const selectAnswer = (key, isMultiple) => {
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  let answerState = quizData.answerStates || {}; // Initialize or get answer states

  if (!answerState[quizData.currentQuestionIndex]) {
    answerState[quizData.currentQuestionIndex] = {}; // Initialize answer state for the current question
  }

  if (isMultiple) {
    const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || [];

    // Add or remove selected answers based on the user's selection
    if (selectedAnswers.includes(key)) {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = selectedAnswers.filter(answer => answer !== key);
    } else {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = [...selectedAnswers, key];
    }

    // Highlight the answer based on correctness
    if (currentQuestion.correct.includes(key)) {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightgreen'; // Correct answer
      answerState[quizData.currentQuestionIndex][key] = 'correct'; // Save correct state
    } else {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightcoral'; // Incorrect answer
      answerState[quizData.currentQuestionIndex][key] = 'incorrect'; // Save incorrect state

      // Disable all inputs after selecting an incorrect answer
      Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
        input.disabled = true;
      });
    }
  } else {
    // Handle single choice questions
    quizData.selectedAnswers[quizData.currentQuestionIndex] = key;

    // Disable all answer inputs after selection
    Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
      input.disabled = true;
    });

    // Highlight correct/incorrect answers
    for (const [answerKey] of Object.entries(currentQuestion.answers)) {
      const answerElement = document.querySelector(`input[value="${answerKey}"]`).parentNode;

      if (answerKey === currentQuestion.correct) {
        answerElement.style.backgroundColor = 'lightgreen'; // Correct answer
        answerState[quizData.currentQuestionIndex][answerKey] = 'correct'; // Save correct state
      } else if (answerKey === key) {
        answerElement.style.backgroundColor = 'lightcoral'; // Incorrect selected answer
        answerState[quizData.currentQuestionIndex][answerKey] = 'incorrect'; // Save incorrect state
      }
    }
  }

  quizData.answerStates = answerState; // Save answer states
  localStorage.setItem('quizData', JSON.stringify(quizData)); // Save to local storage
};

// Show the results page
const showResultsPage = () => {
  stopTimer(); // Stop the quiz timer
  const quizDuration = getQuizDuration(); // Get the quiz duration
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
    <p>You completed the quiz in ${quizDuration} seconds.</p>
    <button id="start-over-button">Start Over</button>
    <button id="check-answers-button">Check Your Answers</button>
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
};

// Reset the quiz and clear all saved data
const resetQuiz = () => {
  localStorage.removeItem('quizData'); // Clear local storage

  quizData.currentQuestionIndex = 0; // Reset the question index
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null); // Clear selected answers
  quizData.answerStates = {}; // Clear answer states

  resetTimer(); // Reset the quiz timer

  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `Time: 0:00`;
  }

  // Start the timer again for a new quiz
  startTimerFunction((elapsedTime) => {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  });

  initQuestionPage(); // Restart the quiz from the first question
};

// Review the user's answers
const reviewAnswers = () => {
  quizData.currentQuestionIndex = 0; // Start from the first question
  showReviewPage(); // Show the review page
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
