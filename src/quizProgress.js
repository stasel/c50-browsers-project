const QUIZ_DATA_KEY = 'quizData';
const ELAPSED_TIME_KEY = 'elapsedTime';
const QUIZ_STATE_KEY = 'quizState';

export const saveProgress = (quizData, elapsedTime) => {
  localStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(quizData)); 
  localStorage.setItem(ELAPSED_TIME_KEY, elapsedTime.toString()); 
  localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify({ page: quizData.page }));
};

export const loadProgress = () => {
  const savedQuizData = localStorage.getItem(QUIZ_DATA_KEY);
  const savedElapsedTime = localStorage.getItem(ELAPSED_TIME_KEY);

  return {
    quizData: savedQuizData ? JSON.parse(savedQuizData) : null,
    elapsedTime: savedElapsedTime ? parseInt(savedElapsedTime, 10) : 0
  };
};

export const clearProgress = () => {
  localStorage.removeItem(QUIZ_DATA_KEY);
  localStorage.removeItem(ELAPSED_TIME_KEY);
  localStorage.removeItem(QUIZ_STATE_KEY);
};
