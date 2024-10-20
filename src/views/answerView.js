/**
 * Create an Answer element
 * @param {string} key - key of an answer like 'a', 'b', 'c'
 * @param {string} answerText - text of an answer
 * @param {boolean} isMultiple - flag for multiple choise
 * @returns {Element}
 */
export const createAnswerElement = (key, answerText, isMultiple) => {
  const element = document.createElement('button');
  element.classList.add('answer-button');
  element.textContent = `${key}: ${answerText}`;

  const inputType = isMultiple ? 'checkbox' : 'radio';

  element.innerHTML = String.raw`
    <label>
      <input type="${inputType}" name="answer" value="${key}" />
      ${key}: ${answerText}
    </label>
  `;

  return element;
};
