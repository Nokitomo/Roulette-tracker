document.addEventListener("DOMContentLoaded", function () {
  const numberButtonsContainer = document.getElementById("number-buttons");
  const tableBody = document.querySelector("#distance-table tbody");
  const trackingModeSelect = document.getElementById("tracking-mode");
  const initialDirectionSelect = document.getElementById("initial-direction");
  const initialDirectionContainer = document.getElementById("initial-direction-container");
  const tableClockwise = document.querySelector("#table-clockwise tbody");
  const tableCounterclockwise = document.querySelector("#table-counterclockwise tbody");
  const tableAlternating = document.querySelector("#table-alternating tbody");
  const tableOnlyCW = document.querySelector("#table-only-clockwise tbody");

  let history = JSON.parse(localStorage.getItem("roulette-history")) || [];
  let trackingMode = "clockwise";
  let initialDirection = "clockwise";

  const distanceUsage = Array(37).fill(0);
  const distanceUsageCCW = Array(37).fill(0);
  const distanceUsageALT = Array(37).fill(0);
  const directionUsageALT = Array(37).fill(null);

  const rouletteOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  for (const num of rouletteOrder) {
    const btn = document.createElement("button");
    btn.textContent = num;
    btn.addEventListener("click", () => handleNumberClick(num));
    numberButtonsContainer.appendChild(btn);
  }

  trackingModeSelect.addEventListener("change", () => {
  trackingMode = trackingModeSelect.value;
  localStorage.setItem("tracking-mode", trackingMode);
  initialDirectionContainer.style.display = trackingMode === "alternating" ? "block" : "none";
  rebuildFromHistory(); // <-- aggiunto!
});

  initialDirectionSelect.addEventListener("change", () => {
  initialDirection = initialDirectionSelect.value;
  localStorage.setItem("initial-direction", initialDirection);
  rebuildFromHistory(); // <-- aggiunto!
});

  function getCurrentDirection() {
    if (trackingMode === "clockwise") return "clockwise";
    return history.length % 2 === 0 ? initialDirection : (initialDirection === "clockwise" ? "counterclockwise" : "clockwise");
  }
  
  function saveHistory() {
  localStorage.setItem("roulette-history", JSON.stringify(history));
}

  function calcDistance(from, to, direction) {
    const fromIndex = rouletteOrder.indexOf(from);
    const toIndex = rouletteOrder.indexOf(to);
    return direction === "clockwise"
      ? (toIndex - fromIndex + rouletteOrder.length) % rouletteOrder.length
      : (fromIndex - toIndex + rouletteOrder.length) % rouletteOrder.length;
  }

  function getNumberAtDistance(fromNumber, distance) {
    const fromIndex = rouletteOrder.indexOf(fromNumber);
    const index = (fromIndex + distance) % rouletteOrder.length;
    return rouletteOrder[index];
  }

  function getNumberAtDistanceCCW(fromNumber, distance) {
    const fromIndex = rouletteOrder.indexOf(fromNumber);
    const index = (fromIndex - distance + rouletteOrder.length) % rouletteOrder.length;
    return rouletteOrder[index];
  }

  function registerDistance(distance) {
    distanceUsage[distance]++;
  }

  function registerDistanceCCW(distance) {
    distanceUsageCCW[distance]++;
  }

  function registerDistanceALT(distance, direction) {
    distanceUsageALT[distance]++;
    directionUsageALT[distance] = direction;
  }

  function updateClockwiseTable(latestNumber) {
    tableClockwise.innerHTML = "";
    for (let i = 0; i <= 18; i++) {
      const leftDistance = i;
      const rightDistance = i + 19;
      const leftNumber = getNumberAtDistance(latestNumber, leftDistance);
      const rightNumber = getNumberAtDistance(latestNumber, rightDistance);
      const leftClass = distanceUsage[leftDistance] ? `highlight-${Math.min(distanceUsage[leftDistance], 4)}` : "";
      const rightClass = distanceUsage[rightDistance] ? `highlight-${Math.min(distanceUsage[rightDistance], 4)}` : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${leftDistance}</td>
        <td class="${leftClass}">${leftNumber}</td>
        <td>${rightDistance}</td>
        <td class="${rightClass}">${rightNumber}</td>
      `;
      tableClockwise.appendChild(row);
    }
  }

  function updateCounterclockwiseTable(latestNumber) {
    tableCounterclockwise.innerHTML = "";
    for (let i = 0; i <= 18; i++) {
      const leftDistance = i;
      const rightDistance = i + 19;
      const leftNumber = getNumberAtDistanceCCW(latestNumber, leftDistance);
      const rightNumber = getNumberAtDistanceCCW(latestNumber, rightDistance);
      const leftClass = distanceUsageCCW[leftDistance] ? `highlight-blue-${Math.min(distanceUsageCCW[leftDistance], 4)}` : "";
      const rightClass = distanceUsageCCW[rightDistance] ? `highlight-blue-${Math.min(distanceUsageCCW[rightDistance], 4)}` : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${leftDistance}</td>
        <td class="${leftClass}">${leftNumber}</td>
        <td>${rightDistance}</td>
        <td class="${rightClass}">${rightNumber}</td>
      `;
      tableCounterclockwise.appendChild(row);
    }
  }

  function updateAlternatingTable(latestNumber) {
    tableAlternating.innerHTML = "";
    for (let i = 0; i <= 18; i++) {
      const leftDistance = i;
      const rightDistance = i + 19;
      const leftNumber = getNumberAtDistance(latestNumber, leftDistance);
      const rightNumber = getNumberAtDistance(latestNumber, rightDistance);
      const leftDir = directionUsageALT[leftDistance];
      const rightDir = directionUsageALT[rightDistance];
      const leftClass = distanceUsageALT[leftDistance] ? (leftDir === "clockwise" ? "highlight-alt-yellow" : "highlight-alt-blue") : "";
      const rightClass = distanceUsageALT[rightDistance] ? (rightDir === "clockwise" ? "highlight-alt-yellow" : "highlight-alt-blue") : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${leftDistance}</td>
        <td class="${leftClass}">${leftNumber}</td>
        <td>${rightDistance}</td>
        <td class="${rightClass}">${rightNumber}</td>
      `;
      tableAlternating.appendChild(row);
    }
  }
  
  function updateOnlyCWTable(latestNumber) {
  tableOnlyCW.innerHTML = "";
  for (let i = 0; i <= 18; i++) {
    const leftDistance = i;
    const rightDistance = i + 19;
    const leftNumber = getNumberAtDistance(latestNumber, leftDistance);
    const rightNumber = getNumberAtDistance(latestNumber, rightDistance);
    const leftClass = sectorFrequenciesOnlyCW[leftDistance] ? `highlight-1` : "";
    const rightClass = sectorFrequenciesOnlyCW[rightDistance] ? `highlight-1` : "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${leftDistance}</td>
      <td class="${leftClass}">${leftNumber}</td>
      <td>${rightDistance}</td>
      <td class="${rightClass}">${rightNumber}</td>
    `;
    tableOnlyCW.appendChild(row);
  }
}

  function addRowToTable(number, cw, ccw, tracking, direction) {
    const row = document.createElement("tr");
    let trackingColor = "-";
    if (tracking !== "-") {
      trackingColor = direction === "clockwise"
        ? "rgba(255, 204, 0, 0.3)"
        : "rgba(0, 204, 255, 0.3)";
    }
    row.innerHTML = `
      <td>${history.length}</td>
      <td>${number}</td>
      <td>${cw}</td>
      <td>${ccw}</td>
      <td style="background-color: ${trackingColor}; font-weight: bold;">${tracking}</td>
    `;
    tableBody.appendChild(row);
  }

  document.getElementById("undo-btn").addEventListener("click", () => {
    if (history.length === 0) return;
    history.pop();
    tableBody.removeChild(tableBody.lastChild);
    const lastNumber = history.length ? history[history.length - 1].number : 0;
    updateClockwiseTable(lastNumber);
    updateCounterclockwiseTable(lastNumber);
    updateAlternatingTable(lastNumber);
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    history = [];
    localStorage.removeItem("roulette-history");
    tableBody.innerHTML = "";
    tableClockwise.innerHTML = "";
    tableCounterclockwise.innerHTML = "";
    tableAlternating.innerHTML = "";
    distanceUsage.fill(0);
    distanceUsageCCW.fill(0);
    distanceUsageALT.fill(0);
    directionUsageALT.fill(null);
    resetDistanceSectors();
  });

  function handleNumberClick(number) {
    const previous = history.length > 0 ? history[history.length - 1].number : null;
    const currentDirection = getCurrentDirection();
    const distanceCW = previous !== null ? calcDistance(previous, number, "clockwise") : null;
    const distanceCCW = previous !== null ? calcDistance(previous, number, "counterclockwise") : null;
    const effectiveDistance = previous !== null ? calcDistance(previous, number, currentDirection) : null;

    history.push({ number, direction: currentDirection });
    addRowToTable(number, distanceCW ?? "-", distanceCCW ?? "-", effectiveDistance ?? "-", currentDirection);

    if (previous !== null) {
  registerDistance(distanceCW);
  highlightDistanceSector(distanceCW);
  
  if (currentDirection === "clockwise") {
  highlightDistanceSectorOnlyCW(distanceCW);
}

  if (currentDirection === "counterclockwise") {
    registerDistanceCCW(distanceCCW);
    highlightDistanceSectorCCW(distanceCCW);
  }

  registerDistanceALT(effectiveDistance, currentDirection);
  highlightDistanceSectorALT(effectiveDistance, currentDirection);
}

    updateClockwiseTable(number);
    updateCounterclockwiseTable(number);
    updateAlternatingTable(number);
    updateOnlyCWTable(number);
    saveHistory();
  }

  // GRAFICI
  const svg = document.getElementById("distance-graph");
  const svgCCW = document.getElementById("distance-graph-ccw");
  const svgALT = document.getElementById("distance-graph-alt");
  const svgOnlyCW = document.getElementById("distance-graph-only-cw");

  const sectorFrequencies = Array(37).fill(0);
  const sectorFrequenciesCCW = Array(37).fill(0);
  const sectorFrequenciesALT = Array(37).fill(0);
  const sectorFrequenciesOnlyCW = Array(37).fill(0);
  const sectorDirectionsALT = Array(37).fill(null);

  function drawSectors(svgElement, prefix) {
    const center = 150, radius = 140, sectorAngle = 360 / 37;
    for (let i = 0; i < 37; i++) {
      const startAngle = (i * sectorAngle - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * sectorAngle - 90) * Math.PI / 180;
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`);
      path.setAttribute("fill", "#ffffff");
      path.setAttribute("stroke", "#ccc");
      path.setAttribute("id", `${prefix}-${i}`);
      svgElement.appendChild(path);

      const midAngle = ((i + 0.5) * sectorAngle - 90) * Math.PI / 180;
      const labelX = center + (radius - 20) * Math.cos(midAngle);
      const labelY = center + (radius - 20) * Math.sin(midAngle);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", labelX);
      text.setAttribute("y", labelY);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("alignment-baseline", "middle");
      text.setAttribute("font-size", "12px");
      text.textContent = i;
      svgElement.appendChild(text);
    }
  }

  function resetDistanceSectors() {
  for (let i = 0; i < 37; i++) {
    sectorFrequencies[i] = 0;
    sectorFrequenciesCCW[i] = 0;
    sectorFrequenciesALT[i] = 0;
    sectorDirectionsALT[i] = null;
    sectorFrequenciesOnlyCW[i] = 0;

    document.getElementById(`sector-${i}`)?.setAttribute("fill", "#ffffff");
    document.getElementById(`sector-ccw-${i}`)?.setAttribute("fill", "#ffffff");
    document.getElementById(`sector-alt-${i}`)?.setAttribute("fill", "#ffffff");
    document.getElementById(`sector-only-cw-${i}`)?.setAttribute("fill", "#ffffff");
  }
}
  
  function rebuildFromHistory() {
  tableBody.innerHTML = "";
  tableClockwise.innerHTML = "";
  tableCounterclockwise.innerHTML = "";
  tableAlternating.innerHTML = "";
  tableOnlyCW.innerHTML = "";

  distanceUsage.fill(0);
  distanceUsageCCW.fill(0);
  distanceUsageALT.fill(0);
  directionUsageALT.fill(null);
  resetDistanceSectors();

  const previousHistory = [...history];
  history = [];
  for (const entry of previousHistory) {
    handleNumberClick(entry.number);
  }
}

  function highlightDistanceSector(distance) {
    sectorFrequencies[distance]++;
    const intensity = Math.min(sectorFrequencies[distance], 5);
    const color = `rgba(255, 204, 0, ${0.2 + intensity * 0.15})`;
    document.getElementById(`sector-${distance}`)?.setAttribute("fill", color);
  }

  function highlightDistanceSectorCCW(distance) {
    sectorFrequenciesCCW[distance]++;
    const intensity = Math.min(sectorFrequenciesCCW[distance], 5);
    const color = `rgba(0, 204, 255, ${0.2 + intensity * 0.15})`;
    document.getElementById(`sector-ccw-${distance}`)?.setAttribute("fill", color);
  }

  function highlightDistanceSectorALT(distance, direction) {
    sectorFrequenciesALT[distance]++;
    sectorDirectionsALT[distance] = direction;
    const baseColor = direction === "clockwise" ? [255, 204, 0] : [0, 204, 255];
    const opacity = 0.2 + Math.min(sectorFrequenciesALT[distance], 5) * 0.15;
    const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`;
    document.getElementById(`sector-alt-${distance}`)?.setAttribute("fill", color);
  }
  
  function highlightDistanceSectorOnlyCW(distance) {
  sectorFrequenciesOnlyCW[distance]++;
  const intensity = Math.min(sectorFrequenciesOnlyCW[distance], 5);
  const color = `rgba(255, 204, 0, ${0.2 + intensity * 0.15})`;
  document.getElementById(`sector-only-cw-${distance}`)?.setAttribute("fill", color);
}

  drawSectors(svg, "sector");
  drawSectors(svgCCW, "sector-ccw");
  drawSectors(svgALT, "sector-alt");
  drawSectors(svgOnlyCW, "sector-only-cw");

  const graphViewSelect = document.getElementById("graph-view");
  const graphCW = document.getElementById("graph-clockwise");
  const graphCCW = document.getElementById("graph-counterclockwise");
  const graphALT = document.getElementById("graph-alternating");

  graphViewSelect.addEventListener("change", () => {
  const value = graphViewSelect.value;
  localStorage.setItem("graph-view", value); // <--- salvataggio
  updateGraphVisibility();
});

  function updateGraphVisibility() {
    const value = graphViewSelect.value;
    graphCW.style.display = value === "always-clockwise" ? "block" : "none";
    graphCCW.style.display = value === "always-counterclockwise" ? "block" : "none";
    graphALT.style.display = value === "alternating" ? "block" : "none";
    document.getElementById("graph-only-clockwise").style.display = value === "only-clockwise" ? "block" : "none";
  }
  updateGraphVisibility();
  
  // --- RIPRISTINO IMPOSTAZIONI SALVATE ---
const savedTrackingMode = localStorage.getItem("tracking-mode");
if (savedTrackingMode) {
  trackingMode = savedTrackingMode;
  trackingModeSelect.value = savedTrackingMode;
  initialDirectionContainer.style.display = trackingMode === "alternating" ? "block" : "none";
}

const savedInitialDirection = localStorage.getItem("initial-direction");
if (savedInitialDirection) {
  initialDirection = savedInitialDirection;
  initialDirectionSelect.value = savedInitialDirection;
}

const savedGraphView = localStorage.getItem("graph-view");
if (savedGraphView) {
  graphViewSelect.value = savedGraphView;
  updateGraphVisibility();
}
  
  // --- CARICAMENTO DATI SALVATI DA LOCALSTORAGE ---
if (history.length > 0) {
  const previousHistory = [...history]; // Evitiamo duplicazioni
  history = []; // Svuotiamo per far funzionare correttamente handleNumberClick
  for (const entry of previousHistory) {
    handleNumberClick(entry.number);
  }
}

// Protezione: aggiungi event listener solo se il bottone esiste
const updateBtn = document.getElementById("update-btn");
if (updateBtn) {
  updateBtn.addEventListener("click", () => {
    if (confirm("Vuoi aggiornare l'app e svuotare i dati salvati?")) {
      localStorage.clear();
      location.reload();
    }
  });
}