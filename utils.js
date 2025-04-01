// Modulo placeholder per funzioni riutilizzabili future

export function calculateMonthlyHours(schedule, shiftHours) {
  const result = {};

  for (const emp in schedule) {
    result[emp] = 0;
    for (const day in schedule[emp]) {
      const shift = schedule[emp][day];
      result[emp] += shiftHours[shift] || 0;
    }
  }

  return result;
}
