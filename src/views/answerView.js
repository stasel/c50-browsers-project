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
    // Disable all answer buttons after one is selected
    const answerButtons = element.parentNode.querySelectorAll('.answer-button');
    answerButtons.forEach((btn) => {
      btn.classList.add('disabled'); // Add a class to change the appearance
      btn.style.pointerEvents = 'none'; // Prevent further clicks
    });

    const input = element.querySelector('input');

    // If it's a radio button, check this and uncheck others
    if (!isMultiple) {
      input.checked = true; // Select the current button for radio
    } else {
      input.checked = !input.checked; // Toggle selection for checkboxes
    }

    input.dispatchEvent(new Event('change')); // Trigger change event for further handling

    // Change the background color based on whether the answer is correct or not
    // Assume currentQuestion is available in scope
    const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
    if (currentQuestion.correct.includes(key)) {
      element.classList.add('correct'); // Add correct class
    } else {
      element.classList.add('wrong'); // Add wrong class
    }
  });

  return element;
};
