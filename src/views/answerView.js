/**
 * Create an Answer element
 * @param {string} key - key of an answer like 'a', 'b', 'c'
 * @param {string} answerText - text of an answer
 * @param {boolean} isMultiple - flag for multiple choice
 * @returns {Element}
 */
export const createAnswerElement = (key, answerText, isMultiple) => {
  const element = document.createElement('div'); // Use div instead of button to allow inputs
  element.classList.add('answer-item'); // Custom class for styling

  const inputType = isMultiple ? 'checkbox' : 'radio'; // Determine input type (radio or checkbox)

  // Add input and label elements with the correct design
  element.innerHTML = String.raw`
    <label class="answer-label">
      <input type="${inputType}" name="answer" value="${key}" class="custom-input"/> 
      <span class="custom-input-design"></span> 
      ${key}: ${answerText}
    </label>
  `;

  const input = element.querySelector('input');

  // Handle click events for both single and multiple answers
  element.addEventListener('click', () => {
    if (isMultiple) {
      input.checked = !input.checked; // Toggle checkbox for multiple selection
    } else {
      input.checked = true; // Select the current radio button for single choice
    }

    input.dispatchEvent(new Event('change')); // Trigger change event

    // Handle visual feedback for single choice
    if (!isMultiple) {
      const answerButtons = element.parentNode.querySelectorAll('.answer-item');
      answerButtons.forEach((btn) => {
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none'; // Disable further clicks after selection
      });
    }

    // Visual feedback based on correct or wrong answer
    const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
    if (currentQuestion.correct.includes(key)) {
      element.classList.add('correct');
    } else {
      element.classList.add('wrong');
    }
  });

  return element;
};
