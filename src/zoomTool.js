// Zoom the question text in and out by changing its font size.

const MIN = 0.8; // 80%
const MAX = 2.0; // 200%
const STEP = 0.1;

const textElements = document.querySelectorAll(
  "#question-source, #question-description, #question-prompt"
);
const zoomIn = document.getElementById("zoom-in-btn");
const zoomOut = document.getElementById("zoom-out-btn");
const label = document.getElementById("zoom-label");

let scale = 1;

function applyZoom() {
  for (const el of textElements) {
    el.style.fontSize = ""; // reset so we read the original size
    el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * scale}px`;
  }
  label.textContent = `${Math.round(scale * 100)}%`;
  zoomOut.disabled = scale <= MIN;
  zoomIn.disabled = scale >= MAX;
}

function change(delta) {
  scale = Math.min(MAX, Math.max(MIN, Math.round((scale + delta) * 10) / 10));
  applyZoom();
}

zoomIn.addEventListener("click", () => change(STEP));
zoomOut.addEventListener("click", () => change(-STEP));
applyZoom();