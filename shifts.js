import { getEmployees } from './employees.js';

const shiftHours = {
  primo: 6,
  secondo: 6
};

let schedule = {}; // { data: { primo: [], secondo: [] } }

export function initShiftModule() {
  updateWorkedHours();
}

export function saveShift(date, shiftType, employeeList) {
  if (!schedule[date]) schedule[date] = {};
  schedule[date][shiftType] = employeeList;
  updateWorkedHours();
}

function updateWorkedHours() {
  const hoursDiv = document.getElementById('worked-hours');
  hoursDiv.innerHTML = '';
  const employees = getEmployees();

  const totals = {};
  employees.forEach(emp => (totals[emp] = 0));

  for (const date in schedule) {
    for (const shift in schedule[date]) {
      const empList = schedule[date][shift];
      empList.forEach(emp => {
        if (totals[emp] != null) {
          totals[emp] += shiftHours[shift] || 0;
        }
      });
    }
  }

  for (const emp in totals) {
    const p = document.createElement('p');
    p.textContent = `${emp}: ${totals[emp]} ore lavorate`;
    hoursDiv.appendChild(p);
  }
}

export function getSchedule() {
  return schedule;
}

export function clearEmployeeData(emp) {
  for (const date in schedule) {
    for (const shift in schedule[date]) {
      schedule[date][shift] = schedule[date][shift].filter(e => e !== emp);
    }
  }
}