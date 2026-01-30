(() => {
  const display = document.getElementById('calcDisplay');
  const keys = document.querySelector('.calc-keys');

  let first = null;
  let operator = null;
  let waitingSecond = false;

  function updateDisplay(value) {
    display.textContent = value;
  }

  function inputDigit(d) {
    const current = display.textContent;
    if (waitingSecond) {
      updateDisplay(d);
      waitingSecond = false;
    } else {
      updateDisplay(current === '0' ? d : current + d);
    }
  }

  function inputDecimal() {
    const current = display.textContent;
    if (waitingSecond) {
      updateDisplay('0.');
      waitingSecond = false;
      return;
    }
    if (!current.includes('.')) updateDisplay(current + '.');
  }

  function clearAll() {
    first = null;
    operator = null;
    waitingSecond = false;
    updateDisplay('0');
  }

  function setOperator(op) {
    const current = parseFloat(display.textContent);
    if (operator && waitingSecond) {
      operator = op;
      return;
    }
    if (first === null) {
      first = current;
    } else if (operator) {
      first = compute(first, current, operator);
      updateDisplay(String(first));
    }
    operator = op;
    waitingSecond = true;
  }

  function equals() {
    const current = parseFloat(display.textContent);
    if (operator === null || first === null) return;
    const result = compute(first, current, operator);
    updateDisplay(String(result));
    first = result;
    operator = null;
    waitingSecond = true;
  }

  function compute(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  keys.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'digit') inputDigit(btn.textContent.trim());
    else if (action === 'decimal') inputDecimal();
    else if (action === 'clear') clearAll();
    else if (action === 'operator') setOperator(btn.dataset.operator);
    else if (action === 'equals') equals();
  });
})(); 
