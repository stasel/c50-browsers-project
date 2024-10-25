export let startTimer = null;
export let endTimer = null;
export let timerInterval = null;

export const createTimerElement = () => {
  const timerDiv = document.createElement('div');
  timerDiv.id = 'timer';
  timerDiv.classList.add('centered');
  timerDiv.style.display = 'block';
  document.body.appendChild(timerDiv);
};

export let startTimerFunction = (updateCallback) => {
  if (!startTimer) {
    startTimer = Date.now();

    timerInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTimer) / 1000);
      updateCallback(elapsedTime);
    }, 1000);
  }
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
  stopTimer();
  startTimer = null;
  endTimer = null;
  timerInterval = null;
};

export const hideTimer = () => {
  const timerElement = document.getElementById
