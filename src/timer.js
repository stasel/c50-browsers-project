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

export let startTimerFunction = (updateCallback, elapsedTime = 0) => {
  if (!startTimer) {
    if (elapsedTime > 0) {
      startTimer = Date.now() - (elapsedTime * 1000);
    } else {
      startTimer = Date.now();
    }

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
  } else if (startTimer) {
    return Math.round((Date.now() - startTimer) / 1000);
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
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
};

window.addEventListener('beforeunload', () => {
  const elapsedTime = getQuizDuration();
  window.localStorage.setItem('timerState', elapsedTime);
});

window.addEventListener('load', () => {
  const savedTime = localStorage.getItem('timerState');
  if (!savedTime) {
    resetTimer();
    startTimerFunction(updateTimerDisplay);
  }
  startTimerFunction(updateTimerDisplay, savedTime);
});
