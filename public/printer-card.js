"use strict";
(() => {
  // src/client/printerCard.ts
  var previousStateByCardId = /* @__PURE__ */ new Map();
  var animationClasses = ["printer-flash-ready", "printer-flash-error"];
  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }
  function readTemperature(value) {
    if (value === null) return null;
    return isFiniteNumber(value) ? value : void 0;
  }
  function parsePrinterCardData(value) {
    if (typeof value !== "object" || value === null) return null;
    const record = value;
    const status = record.status;
    if (status !== "ready" && status !== "printing" && status !== "error") return null;
    const bedTemperature = readTemperature(record.bedTemperature);
    if (bedTemperature === void 0 || !Array.isArray(record.extruderTemperatures)) return null;
    if (!isFiniteNumber(record.progress) || typeof record.filename !== "string") return null;
    const extruderTemperatures = [];
    for (const temperature of record.extruderTemperatures) {
      if (!isFiniteNumber(temperature)) return null;
      extruderTemperatures.push(temperature);
    }
    return {
      status,
      bedTemperature,
      extruderTemperatures,
      progress: record.progress,
      filename: record.filename
    };
  }
  function normalizeProgress(progress) {
    const percentage = progress >= 0 && progress <= 1 ? progress * 100 : progress;
    return Math.min(100, Math.max(0, percentage));
  }
  function formatTemperature(temperature) {
    if (temperature === null) return "—";
    const rounded = Math.round(temperature * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}°C`;
  }
  function getPrinterCardAnimation(previousStatus, nextStatus) {
    if (previousStatus === "printing" && nextStatus === "ready") return "printer-flash-ready";
    if (previousStatus !== void 0 && previousStatus !== "error" && nextStatus === "error") {
      return "printer-flash-error";
    }
    return null;
  }
  function queryRequiredElement(card, selector) {
    return card.querySelector(selector);
  }
  function restartCardAnimation(card, animation) {
    card.classList.remove(...animationClasses);
    if (!animation) return;
    void card.offsetWidth;
    card.classList.add(animation);
    card.addEventListener("animationend", () => card.classList.remove(animation), { once: true });
  }
  function updatePrinterCard(cardId, input) {
    const data = parsePrinterCardData(input);
    const card = document.getElementById(cardId);
    if (!data || !(card instanceof HTMLElement)) return false;
    const statusDot = queryRequiredElement(card, ".status-dot");
    const bedValue = queryRequiredElement(card, "[data-printer-bed-temperature]");
    const extruderValue = queryRequiredElement(card, "[data-printer-extruder-temperatures]");
    const percentage = queryRequiredElement(card, "[data-printer-progress-label]");
    const progressBar = queryRequiredElement(card, "[data-printer-progress-bar]");
    const progressFill = queryRequiredElement(card, "[data-printer-progress-fill]");
    const filename = queryRequiredElement(card, "[data-printer-filename]");
    if (!statusDot || !bedValue || !extruderValue || !percentage || !progressBar || !progressFill || !filename) {
      return false;
    }
    const progress = normalizeProgress(data.progress);
    const progressText = `${Math.round(progress)}%`;
    const isPrinting = data.status === "printing";
    const previousStatus = previousStateByCardId.get(cardId);
    card.dataset.printerState = data.status;
    card.classList.toggle("is-printing", isPrinting);
    statusDot.classList.remove("initial", "connect", "warning", "disconnected");
    statusDot.classList.add(data.status === "ready" ? "connect" : data.status === "printing" ? "warning" : "disconnected");
    statusDot.title = data.status === "ready" ? "Готов" : data.status === "printing" ? "Печать" : "Ошибка";
    bedValue.textContent = formatTemperature(data.bedTemperature);
    extruderValue.textContent = data.extruderTemperatures.length > 0 ? data.extruderTemperatures.map((temperature) => formatTemperature(temperature)).join(" / ") : "—";
    percentage.textContent = progressText;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));
    progressBar.hidden = !isPrinting;
    filename.textContent = isPrinting && data.filename.trim() ? data.filename.trim() : "";
    filename.setAttribute("aria-hidden", String(!isPrinting));
    restartCardAnimation(card, getPrinterCardAnimation(previousStatus, data.status));
    previousStateByCardId.set(cardId, data.status);
    return true;
  }

  // src/client/printerCard.entry.ts
  window.updatePrinterCard = updatePrinterCard;
})();
//# sourceMappingURL=printer-card.js.map
