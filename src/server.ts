import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

const server = app.listen(config.PORT, config.HOST, () => {
  console.log(`PrintVisual is running at http://${config.HOST}:${config.PORT}`);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}; closing the HTTP server...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out; closing active connections.");
    server.closeAllConnections();
    process.exitCode = 1;
  }, 10_000);
  forceShutdownTimer.unref();

  server.close(error => {
    clearTimeout(forceShutdownTimer);
    if (error) {
      console.error("Failed to close the HTTP server cleanly.", error);
      process.exitCode = 1;
      return;
    }
    console.log("HTTP server closed.");
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
