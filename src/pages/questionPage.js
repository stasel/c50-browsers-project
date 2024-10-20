import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  PREVIOUS_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';

const loadApp = () => {
  quizData.currentQuestionIndex = 0;
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null);
  initQuestionPage();
};

window.addEventListener('load', loadApp);

export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  if (quizData.currentQuestionIndex >= quizData.questions.length) {
    showResultsPage();
    return;
  }

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];

  const questionElement = createQuestionElement(currentQuestion.text);
  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = '';

  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple);
    answersListElement.appendChild(answerElement);
  }


  document
    .getElementById(NEXT_QUESTION_BUTTON_ID)
    .addEventListener('click', nextQuestion);

  const previousButton = document.getElementById(PREVIOUS_QUESTION_BUTTON_ID);
  if (previousButton) {
    previousButton.addEventListener('click', previousQuestion);

    if (quizData.currentQuestionIndex === 0) {
      previousButton.style.display = 'none';
    } else {
      previousButton.style.display = 'inline-block';
    }
  }
};


const nextQuestion = () => {
  quizData.currentQuestionIndex = quizData.currentQuestionIndex + 1;
  initQuestionPage();
};

const previousQuestion = () => {
    quizData.currentQuestionIndex = quizData.currentQuestionIndex - 1;
    initQuestionPage();
};


const showResultsPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const totalQuestions = quizData.questions.length;
  let userScore = 0;

  quizData.questions.forEach((question, index) => {
    const userAnswer = quizData.selectedAnswers ? quizData.selectedAnswers[index] : null;

    if (question.multiple) {
      const correctAnswers = Array.isArray(question.correct) ? question.correct.sort() : [];
      const selectedAnswers = userAnswer ? userAnswer.sort() : [];

      if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
        userScore += 1;
      }
    } else {
      if (userAnswer === question.correct) {
        userScore += 1;
      }
    }
  });

  const resultElement = document.createElement('div');
  resultElement.innerHTML = String.raw`
    <h1>Congratulations!</h1>
    <p>You scored ${userScore} out of ${totalQuestions}!</p>
  `;

  userInterface.appendChild(resultElement);
};