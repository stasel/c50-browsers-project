/**
 * Create an Answer element
 * @param {string} key - key of an answer like 'a', 'b', 'c'
 * @param {string} answerText - text of an answer
 * @param {boolean} isMultiple - flag for multiple choice
 * @returns {Element}
 */
export const createAnswerElement = (key, answerText, isMultiple) => {
  const element = document.createElement('button');
  element.classList.add('answer-button');
  element.textContent = `${key}: ${answerText}`;
  element.type = 'button'; // Prevents default form submission behavior if inside a form

  const inputType = isMultiple ? 'checkbox' : 'radio';

  // Add hidden input element for tracking selected answers
  element.innerHTML = String.raw`
    <label class="answer-label">
      <input type="${inputType}" name="answer" value="${key}" style="display: none;" />
      ${key}: ${answerText}
    </label>
  `;

  element.addEventListener('click', () => {
    const input = element.querySelector('input');
    
    // Toggle selection for checkboxes if isMultiple
    if (isMultiple) {
      input.checked = !input.checked; // Toggle for multiple choices
    } else {
      input.checked = true; // Select the current button for single choice
    }
    
    input.dispatchEvent(new Event('change')); // Trigger change event for further handling

    // Handle visual feedback for single choice
    if (!isMultiple) {
      // Disable all answer buttons after one is selected
      const answerButtons = element.parentNode.querySelectorAll('.answer-button');
      answerButtons.forEach((btn) => {
        btn.classList.add('disabled'); // Add a class to change the appearance
        btn.style.pointerEvents = 'none'; // Prevent further clicks
      });
    }

    // Change the background color based on whether the answer is correct or not
    const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
    if (currentQuestion.correct.includes(key)) {
      element.classList.add('correct'); // Add correct class for correct answer
    } else {
      element.classList.add('wrong'); // Add wrong class for wrong answer
    }
  });

  return element;
};
const updateScoreDisplay = (score) => {
  const scoreElement = document.getElementById('score-display');
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score}`; // Update the text with the current score
  } else {
    // Create the score display if it doesn't exist
    const newScoreElement = document.createElement('div');
    newScoreElement.id = 'score-display';
    newScoreElement.textContent = `Score: ${score}`;
    document.getElementById(USER_INTERFACE_ID).prepend(newScoreElement); // Prepend to the user interface
  }
};