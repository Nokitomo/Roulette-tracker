import { initCalendarModule } from './calendar.js';
import { initShiftModule, clearEmployeeData } from './shifts.js';

let employees = [];

export function initEmployeeModule() {
  const input = document.getElementById('employee-name');
  const button = document.getElementById('add-employee');
  const list = document.getElementById('employee-list');

  button.addEventListener('click', () => {
    const name = input.value.trim();
    if (name && !employees.includes(name)) {
      employees.push(name);
      renderEmployeeList();
      input.value = '';

      // Ricostruisce calendario e turni
      initCalendarModule();
      initShiftModule();
    }
  });

  function renderEmployeeList() {
    list.innerHTML = '';
    employees.forEach((emp, index) => {
      const li = document.createElement('li');
      li.textContent = emp;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Rimuovi';
      removeBtn.style.backgroundColor = '#e74c3c';
      removeBtn.style.marginLeft = '1rem';
      removeBtn.onclick = () => {
        employees.splice(index, 1);
        clearEmployeeData(emp);
        renderEmployeeList();

        // Aggiorna calendario e turni dopo la rimozione
        initCalendarModule();
        initShiftModule();
      };

      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  }
}

export function getEmployees() {
  return employees;
}