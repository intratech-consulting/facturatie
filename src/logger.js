const constants = require("./constants");

let logger = null;

class Logger {
  pinoLogger = null;
  channel = null;
  exchange = constants.MAIN_EXCHANGE;

  constructor() {
    logger = require("pino")({
      level: "info",
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    });
  }

  async setupLogger(connection) {
    // Create channel
    channel = await connection.createChannel();
    await channel.assertExchange(this.exchange, "topic", {
      durable: true,
    });

    logger.info(`Sent validated XML data to topic: ${routingKey}`);

    // Close channel and connection
    await channel.close();
    await connection.close();
  }

  async log(functionName, log, isError) {
    let logData = {
      LogEntry: {
        SystemName: constants.SYSTEM,
        FunctionName: functionName,
        Logs: log,
        Error: isError ? "true" : "false",
        Timestamp: new Date().toISOString(), // Current timestamp
      },
    };
    if (channel) {
      channel.publish(exchange, "logs", Buffer.from(xmlData));
    }
    pinoLogger.info(logData);
  }

  static getLogger() {
    return logger;
  }
}

module.exports = Logger;
