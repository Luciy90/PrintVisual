import { updatePrinterCard } from './printerCard.js';

declare global {
  interface Window {
    updatePrinterCard: typeof updatePrinterCard;
  }
}

window.updatePrinterCard = updatePrinterCard;
