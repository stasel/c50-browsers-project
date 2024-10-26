export let startTimer = null;
export let timerInterval = null;

export const createTimerElement = () => {
  const timerDiv = document.createElement('div');
  timerDiv.id = 'timer';
  timerDiv.classList.add('centered');
  document.body.appendChild(timerDiv);
};

export const startTimerFunction = (updateCallback, elapsedTime = 0) => {
  startTimer = Date.now() - elapsedTime * 1000;

  timerInterval = setInterval(() => {
    const currentElapsedTime = Math.floor((Date.now() - startTimer) / 1000);
    updateCallback(currentElapsedTime);
  }, 1000);
};

export const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

export const getQuizDuration = () => {
  if (startTimer) {
    return Math.floor((Date.now() - startTimer) / 1000);
  }
  return 0;
};

export const resetTimer = () => {
  stopTimer();
  startTimer = null;
};

export const hideTimer = () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.style.display = 'none';
  }
};

export const showTimer = () => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.style.display = 'block';
  }
};

export const updateTimerDisplay = (elapsedTime) => {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
};


window.addEventListener('load', () => {
  const savedTime = parseInt(localStorage.getItem('elapsedTime'), 10);
  if (!isNaN(savedTime) && savedTime >= 0) {
    startTimerFunction(updateTimerDisplay, savedTime);
  } else {
    resetTimer();
    startTimerFunction(updateTimerDisplay);
  }
});

export const resumeTimerFunction = (elapsedTime, updateCallback) => {
  stopTimer();

  startTimer = Date.now() - (elapsedTime * 1000);
  timerInterval = setInterval(() => {
    const currentElapsedTime = Math.floor((Date.now() - startTimer) / 1000);
    updateCallback(currentElapsedTime);
  }, 1000);

  updateCallback(elapsedTime);
};
