import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
} from '../constants.js';
import { quizData } from '../data.js';

let correctAnswers = 0;
let timeLeft = 30;
let timerInterval;

export const initQuestionPage = () => {
  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';

  const quizContainer = document.createElement('div');
  quizContainer.className = 'quiz-container';

  
  const progressBarContainer = document.createElement('div');
  progressBarContainer.className = 'progress-bar-container';

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';

  const progress = document.createElement('div');
  progress.className = 'progress';
  progressBar.appendChild(progress);

  const progressInfo = document.createElement('div');
  progressInfo.className = 'progress-info';
  progressInfo.id = 'progress-info';
  progressInfo.textContent = `${quizData.currentQuestionIndex + 1}/10`;

  progressBarContainer.appendChild(progressBar);
  progressBarContainer.appendChild(progressInfo);

  
  const timerContainer = document.createElement('div');
  timerContainer.className = 'timer-container';

  const timerCircle = document.createElement('div');
  timerCircle.className = 'timer-circle';

  const timerText = document.createElement('div');
  timerText.className = 'timer-text';
  timerText.id = 'timer-text';
  timerText.textContent = timeLeft;

  const timerFill = document.createElement('div');
  timerFill.className = 'timer-fill';
  timerFill.id = 'timer-fill';

  timerCircle.appendChild(timerFill);
  timerCircle.appendChild(timerText);
  timerContainer.appendChild(timerCircle);

  quizContainer.appendChild(progressBarContainer);
  quizContainer.appendChild(timerContainer);

  const questionElement = document.createElement('div');
  questionElement.className = 'question';
  quizContainer.appendChild(questionElement);

  const answersListElement = document.createElement('ul');
  answersListElement.className = 'options';
  answersListElement.id = ANSWERS_LIST_ID;
  quizContainer.appendChild(answersListElement);

  const nextButton = document.createElement('button');
  nextButton.className = 'next-btn';
  nextButton.id = NEXT_QUESTION_BUTTON_ID;
  nextButton.innerText = 'Next';
  nextButton.addEventListener('click', nextQuestion);

  quizContainer.appendChild(nextButton);
  userInterface.appendChild(quizContainer);

  loadQuestion(); // Load the current question
  startTimer(); // Start the timer
};

const loadQuestion = () => {
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const questionElement = document.querySelector('.question');
  questionElement.innerText = currentQuestion.text;

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  answersListElement.innerHTML = '';

  Object.entries(currentQuestion.answers).forEach(([key, answerText]) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.classList.add('option-button');
    button.innerHTML = `
      <div>${answerText}</div>
      <div class="circle" id="circle-${key}"></div>
    `;

    button.onclick = () => checkAnswer(key, button);
    li.appendChild(button);
    answersListElement.appendChild(li);
  });

  updateProgress();
};

const checkAnswer = (selectedKey, button) => {
  clearInterval(timerInterval); // Stop timer when answer is selected
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const correctKey = currentQuestion.correct;  

  // Disable all buttons after selecting an answer
  const options = document.querySelectorAll('.option-button');
  options.forEach(option => option.disabled = true);

  // Check if the selected answer is correct
  const circles = document.querySelectorAll('.circle');
  if (selectedKey === correctKey) {
    button.classList.add('correct');
    const correctCircle = document.getElementById(`circle-${selectedKey}`);
    correctCircle.classList.add('correct');
    correctCircle.innerHTML = '<span class="icon">✔</span>';
    correctAnswers++;
    
    updateProgress(); // Update progress only if the answer is correct
  } else {
    button.classList.add('incorrect');
    const incorrectCircle = document.getElementById(`circle-${selectedKey}`);
    incorrectCircle.classList.add('incorrect');
    incorrectCircle.innerHTML = '<span class="icon">✘</span>';

    // Highlight the correct answer
    const correctButton = document.getElementById(`circle-${correctKey}`);
    if (correctButton) {
      correctButton.classList.add('correct');
      correctButton.innerHTML = '<span class="icon">✔</span>';
    }
  }

  // Enable the Next button after a delay
  setTimeout(() => {
    document.getElementById(NEXT_QUESTION_BUTTON_ID).disabled = false;
  }, 1000);
};

const nextQuestion = () => {
  if (quizData.currentQuestionIndex < quizData.questions.length - 1) {
    quizData.currentQuestionIndex++;
    initQuestionPage();
  } else {
    // End of quiz
    alert(`Quiz finished! You answered ${correctAnswers} out of ${quizData.questions.length} questions correctly.`);
  }
};

// Timer logic with conic-gradient fill
const startTimer = () => {
  timeLeft = 30;
  const timerText = document.getElementById('timer-text');
  timerText.textContent = timeLeft;
  clearInterval(timerInterval);

  let percentage = 100;
  const timerFill = document.getElementById('timer-fill');
  timerFill.style.background = `conic-gradient(#ffa500 ${percentage}%, #333 ${percentage}%)`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    percentage = (timeLeft / 30) * 100; 
    timerFill.style.background = `conic-gradient(#ffa500 ${percentage}%, #333 ${percentage}%)`; 

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoWrongAnswer();
    }
  }, 1000);
};

// Automatically select wrong answer if time runs out
const autoWrongAnswer = () => {
  const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
  const correctKey = currentQuestion.correct;

  // Disable all buttons
  const options = document.querySelectorAll('.option-button');
  options.forEach(option => option.disabled = true);

  // Highlight correct answer
  const correctButton = document.getElementById(`circle-${correctKey}`);
  if (correctButton) {
    correctButton.classList.add('correct');
    correctButton.innerHTML = '<span class="icon">✔</span>';
  }

  // Proceed to next question after a short delay
  setTimeout(nextQuestion, 1000);
};

// Update the progress bar and question count
const updateProgress = () => {
  const progressInfo = document.getElementById('progress-info');
  progressInfo.textContent = `${quizData.currentQuestionIndex + 1}/${quizData.questions.length}`;

  // Update progress only if the last answer was correct
  if (correctAnswers > 0) {
    const progress = (correctAnswers / quizData.questions.length) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
  }
};
