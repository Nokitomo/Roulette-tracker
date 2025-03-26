const numberButtonsContainer = document.getElementById("number-buttons");
const tableBody = document.querySelector("#distance-table tbody");
const trackingModeSelect = document.getElementById("tracking-mode");
const initialDirectionSelect = document.getElementById("initial-direction");
const initialDirectionContainer = document.getElementById("initial-direction-container");

let history = [];
let trackingMode = "clockwise";
let initialDirection = "clockwise";

const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// === GENERAZIONE BOTTONI NUMERI ===
for (const num of rouletteOrder) {
  const btn = document.createElement("button");
  btn.textContent = num;
  btn.addEventListener("click", () => handleNumberClick(num));
  numberButtonsContainer.appendChild(btn);
}

// === MODALITÀ TRACCIAMENTO ===
trackingModeSelect.addEventListener("change", () => {
  trackingMode = trackingModeSelect.value;
  initialDirectionContainer.style.display = trackingMode === "alternating" ? "block" : "none";
});

initialDirectionSelect.addEventListener("change", () => {
  initialDirection = initialDirectionSelect.value;
});

function getCurrentDirection() {
  if (trackingMode === "clockwise") return "clockwise";
  if (trackingMode === "alternating") {
    return history.length % 2 === 0 ? initialDirection : (initialDirection === "clockwise" ? "counterclockwise" : "clockwise");
  }
}

function calcDistance(from, to, direction) {
  const fromIndex = rouletteOrder.indexOf(from);
  const toIndex = rouletteOrder.indexOf(to);
  if (direction === "clockwise") {
    return (toIndex - fromIndex + rouletteOrder.length) % rouletteOrder.length;
  } else {
    return (fromIndex - toIndex + rouletteOrder.length) % rouletteOrder.length;
  }
}

function handleNumberClick(number) {
  const previous = history.length > 0 ? history[history.length - 1].number : null;
  const currentDirection = getCurrentDirection();

  const distanceCW = previous !== null ? calcDistance(previous, number, "clockwise") : "-";
  const distanceCCW = previous !== null ? calcDistance(previous, number, "counterclockwise") : "-";
  const effectiveDistance = previous !== null ? calcDistance(previous, number, currentDirection) : "-";

  history.push({ number, direction: currentDirection });

  addRowToTable(number, distanceCW, distanceCCW, effectiveDistance);

  if (previous !== null) {
    highlightDistanceSector(distanceCW);
    highlightDistanceSectorCCW(distanceCCW);
    highlightDistanceSectorALT(effectiveDistance, currentDirection);
  }
}

function addRowToTable(number, cw, ccw, tracking) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${history.length}</td>
    <td>${number}</td>
    <td>${cw}</td>
    <td>${ccw}</td>
    <td>${tracking}</td>
  `;
  tableBody.appendChild(row);
}

document.getElementById("undo-btn").addEventListener("click", () => {
  if (history.length === 0) return;
  history.pop();
  tableBody.removeChild(tableBody.lastChild);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  history = [];
  tableBody.innerHTML = "";
  resetDistanceSectors();
});

// === GRAFICI ===

const svg = document.getElementById("distance-graph");
const svgCCW = document.getElementById("distance-graph-ccw");
const svgALT = document.getElementById("distance-graph-alt");

const sectorFrequencies = Array(37).fill(0);
const sectorFrequenciesCCW = Array(37).fill(0);
const sectorFrequenciesALT = Array(37).fill(0);
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

function highlightDistanceSector(distance) {
  sectorFrequencies[distance]++;
  const intensity = Math.min(sectorFrequencies[distance], 5);
  const color = `rgba(255, 204, 0, ${0.2 + intensity * 0.15})`;
  document.getElementById(`sector-${distance}`).setAttribute("fill", color);
}

function highlightDistanceSectorCCW(distance) {
  sectorFrequenciesCCW[distance]++;
  const intensity = Math.min(sectorFrequenciesCCW[distance], 5);
  const color = `rgba(0, 204, 255, ${0.2 + intensity * 0.15})`;
  document.getElementById(`sector-ccw-${distance}`).setAttribute("fill", color);
}

function highlightDistanceSectorALT(distance, direction) {
  sectorFrequenciesALT[distance]++;
  sectorDirectionsALT[distance] = direction;
  const intensity = Math.min(sectorFrequenciesALT[distance], 5);
  const baseColor = direction === "clockwise" ? [255, 204, 0] : [0, 204, 255];
  const opacity = 0.2 + intensity * 0.15;
  const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`;
  document.getElementById(`sector-alt-${distance}`).setAttribute("fill", color);
}

function resetDistanceSectors() {
  for (let i = 0; i < 37; i++) {
    sectorFrequencies[i] = 0;
    sectorFrequenciesCCW[i] = 0;
    sectorFrequenciesALT[i] = 0;
    sectorDirectionsALT[i] = null;
    document.getElementById(`sector-${i}`).setAttribute("fill", "#ffffff");
    document.getElementById(`sector-ccw-${i}`).setAttribute("fill", "#ffffff");
    document.getElementById(`sector-alt-${i}`).setAttribute("fill", "#ffffff");
  }
}

drawSectors(svg, "sector");
drawSectors(svgCCW, "sector-ccw");
drawSectors(svgALT, "sector-alt");

// === GESTIONE VISUALIZZAZIONE GRAFICI ===

const graphViewSelect = document.getElementById("graph-view");
const graphCW = document.getElementById("graph-clockwise");
const graphCCW = document.getElementById("graph-counterclockwise");
const graphALT = document.getElementById("graph-alternating");

graphViewSelect.addEventListener("change", updateGraphVisibility);

function updateGraphVisibility() {
  const value = graphViewSelect.value;
  graphCW.style.display = value === "always-clockwise" ? "block" : "none";
  graphCCW.style.display = value === "always-counterclockwise" ? "block" : "none";
  graphALT.style.display = value === "alternating" ? "block" : "none";
}
updateGraphVisibility();