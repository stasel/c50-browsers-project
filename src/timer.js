let startTimer = null;
let endTimer = null;
let timerInterval = null;

export const createTimerElement = () => {
  const timerDiv = document.createElement('div');
  timerDiv.id = 'timer';
  timerDiv.classList.add('centered');
  timerDiv.style.display = 'none'; 
  document.body.appendChild(timerDiv);
};

export const startTimerFunction = (updateCallback, elapsedTime = 0) => {
  startTimer = Date.now() - elapsedTime * 1000;  // Offset by elapsed time
  timerInterval = setInterval(() => {
    const currentElapsedTime = Math.floor((Date.now() - startTimer) / 1000);
    updateCallback(currentElapsedTime);
  }, 1000);
};

export const resumeTimerFunction = (elapsedTime, updateCallback) => {
  startTimerFunction(updateCallback, elapsedTime);
};

export const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    endTimer = Date.now();
    timerInterval = null;
  }
};

export const getQuizDuration = () => {
  if (startTimer && endTimer) {
    return Math.round((endTimer - startTimer) / 1000);
  }
  return 0;
};

export const resetTimer = () => {
  clearInterval(timerInterval);
  startTimer = null;
  endTimer = null;
  timerInterval = null;
  localStorage.removeItem('elapsedTime');  // Clear saved time if stored
};

export const hideTimer = () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.style.display = 'none'; // Hide the timer
  }
};

export const showTimer = () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.style.display = 'block'; // Show the timer
  }
};
