let logger = null;

function setupLogger() {
  logger = require("pino")({
    level: "info",
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  });
}

function getLogger() {
  if (logger === null) {
    setupLogger();
  }
  return logger;
}

module.exports = { getLogger };
