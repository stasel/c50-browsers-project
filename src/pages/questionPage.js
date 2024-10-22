import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';

export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];

  const questionElement = createQuestionElement(currentQuestion.text);

  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);

  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText);
    answersListElement.appendChild(answerElement);
  }

  document
    .getElementById(NEXT_QUESTION_BUTTON_ID)
    .addEventListener('click', nextQuestion);
};

const nextQuestion = () => {
  quizData.currentQuestionIndex += 1;
  initQuestionPage();
};

const previousQuestion = () => {
  quizData.currentQuestionIndex -= 1;
  initQuestionPage();
};

const selectAnswer = (key, isMultiple) => {
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  let answerState = quizData.answerStates || {}; 

  if (!answerState[quizData.currentQuestionIndex]) {
    answerState[quizData.currentQuestionIndex] = {};
  }

  if (isMultiple) {
    const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || [];

    if (selectedAnswers.includes(key)) {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = selectedAnswers.filter(answer => answer !== key);
    } else {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = [...selectedAnswers, key];
    }

    if (currentQuestion.correct.includes(key)) {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightgreen';
      answerState[quizData.currentQuestionIndex][key] = 'correct'; 
    } else {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightcoral';
      answerState[quizData.currentQuestionIndex][key] = 'incorrect'; 

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
      const answerElement = document.querySelector(`input[value="${answerKey}"]`).parentNode;

      if (answerKey === currentQuestion.correct) {
        answerElement.style.backgroundColor = 'lightgreen';
        answerState[quizData.currentQuestionIndex][answerKey] = 'correct'; 
      } else if (answerKey === key) {
        answerElement.style.backgroundColor = 'lightcoral';
        answerState[quizData.currentQuestionIndex][answerKey] = 'incorrect'; 
      }
    }
  }

  quizData.answerStates = answerState; 
  localStorage.setItem('quizData', JSON.stringify(quizData));
};

const showResultsPage = () => {
  stopTimer();
  const quizDuration = getQuizDuration();
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const totalQuestions = quizData.questions.length;
  let userScore = 0;

  quizData.questions.forEach((question, index) => {
    const userAnswer = quizData.selectedAnswers ? quizData.selectedAnswers[index] : null;

    if (userAnswer !== null && userAnswer.length > 0) {
      if (question.multiple) {
        const correctAnswers = question.correct.split(',').map(answer => answer.trim()).sort();
        const selectedAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : [];

        if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
          userScore += 1;
        } else {
          userScore += 0;
        }
      } else {
        if (userAnswer === question.correct) {
          userScore += 1;
        }
      }
    }
  });

  const resultElement = document.createElement('div');
  resultElement.innerHTML = String.raw`
    <h1>Congratulations!</h1>
    <p>You scored ${userScore} out of ${totalQuestions}!</p>
    <p>You completed the quiz in ${quizDuration} seconds.</p>
    <button id="start-over-button">Start Over</button>
    <button id="check-answers-button">Check Your Answers</button>
  `;

  userInterface.appendChild(resultElement);

  document
    .getElementById('start-over-button')
    .addEventListener('click', resetQuiz);

  document
    .getElementById('check-answers-button')
    .addEventListener('click', reviewAnswers);
};

const resetQuiz = () => {
  localStorage.removeItem('quizData');

  quizData.currentQuestionIndex = 0;
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null);
  quizData.answerStates = {};

  resetTimer();

  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `Time: 0:00`;
  }

  startTimerFunction((elapsedTime) => {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  });

  initQuestionPage();
};
