/**
 * Create an Answer element
 * @param {string} key - key of an answer like 'a', 'b', 'c'
 * @param {string} answerText - text of an answer
 * @param {boolean} isMultiple - flag for multiple choise
 * @returns {Element}
 */
export const createAnswerElement = (key, answerText, isMultiple) => {
  const element = document.createElement('div');
  element.classList.add('answer-button');
  element.textContent = `${key}: ${answerText}`;
  // Set a data attribute to identify the answer key
  
  const inputType = isMultiple ? 'checkbox' : 'radio';

  element.innerHTML = String.raw`
    <label>
       <label style="display: flex; align-items: center; cursor: pointer; width: 100%;">
      <input type="${inputType}" name="answer" value="${key}" />
      ${key}: ${answerText}
    </label>
  `;
  element.addEventListener('click', () => {
    const input = element.querySelector('input');
    input.checked = !input.checked; // 
    input.dispatchEvent(new Event('change')); //
  });
  return element;
};
