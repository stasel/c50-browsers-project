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

  const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || [];

  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple);

    if ((currentQuestion.multiple && selectedAnswers.includes(key)) || (!currentQuestion.multiple && selectedAnswers === key)) {
      const input = answerElement.querySelector('input');
      input.checked = true;
    }

    answerElement.querySelector('input').addEventListener('change', () => selectAnswer(key, currentQuestion.multiple));
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

  if (isMultiple) {
    const selectedAnswers = quizData.selectedAnswers[quizData.currentQuestionIndex] || [];

    if (selectedAnswers.includes(key)) {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = selectedAnswers.filter(answer => answer !== key);
    } else {
      quizData.selectedAnswers[quizData.currentQuestionIndex] = [...selectedAnswers, key];
    }

    if (currentQuestion.correct.includes(key)) {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightgreen';
    } else {
      document.querySelector(`input[value="${key}"]`).parentNode.style.backgroundColor = 'lightcoral';

      Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
        input.disabled = true;
      });
    }
  } else {
    quizData.selectedAnswers[quizData.currentQuestionIndex] = key;

    Array.from(answersListElement.querySelectorAll('input')).forEach(input => {
      input.disabled = true;
    });

    for (const [answerKey, answerText] of Object.entries(currentQuestion.answers)) {
      const answerElement = document.querySelector(`input[value="${answerKey}"]`).parentNode;

      if (answerKey === currentQuestion.correct) {
        answerElement.style.backgroundColor = 'lightgreen';
      } else if (answerKey === key) {
        answerElement.style.backgroundColor = 'lightcoral';
      }
    }
  }

  localStorage.setItem('quizData', JSON.stringify(quizData));
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
  quizData.currentQuestionIndex = 0;
  quizData.selectedAnswers = new Array(quizData.questions.length).fill(null);

  localStorage.removeItem('quizData');

  initQuestionPage();
};


const reviewAnswers = () => {
  quizData.currentQuestionIndex = 0;
  showReviewPage();
};


const showReviewPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];

  const storedQuizData = JSON.parse(localStorage.getItem('quizData'));
  const selectedAnswers = storedQuizData.selectedAnswers[quizData.currentQuestionIndex] || [];

  const questionElement = createQuestionElement(currentQuestion.text);
  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = '';

  
  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText, currentQuestion.multiple);
    const input = answerElement.querySelector('input');

    
    if ((currentQuestion.multiple && selectedAnswers.includes(key)) || (!currentQuestion.multiple && selectedAnswers === key)) {
      input.checked = true;
      input.disabled = true; 
    }

    
    if (currentQuestion.correct.includes(key)) {
      answerElement.style.backgroundColor = 'lightgreen';
    } else if (input.checked) {
      answerElement.style.backgroundColor = 'lightcoral';
    }

    answersListElement.appendChild(answerElement);
  }

  document
    .getElementById(NEXT_QUESTION_BUTTON_ID)
    .addEventListener('click', nextReviewQuestion);

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

const nextReviewQuestion = () => {
  quizData.currentQuestionIndex += 1;
  if (quizData.currentQuestionIndex < quizData.questions.length) {
    showReviewPage();
  } else {
    showResultsPage();
  }
};

const previousReviewQuestion = () => {
  quizData.currentQuestionIndex -= 1;
  if (quizData.currentQuestionIndex >= 0) {
    showReviewPage();
  }
};
