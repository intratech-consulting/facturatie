const constants = require("./constants");
const pino = require("pino");

class Logger {
  constructor() {
    this.pinoLogger = pino({
      level: "info",
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    });
    this.channel = null;
    this.exchange = constants.MAIN_EXCHANGE;
  }

  async setupLogger(connection) {
    // Create channel
    this.channel = await connection.createChannel();
    await this.channel.assertExchange(this.exchange, "topic", {
      durable: true,
    });
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
    if (this.channel) {
      this.channel.publish(this.exchange, "logs", Buffer.from(JSON.stringify(logData)));
    }
    this.pinoLogger.info(logData);
  }

  static getLogger() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

module.exports = Logger;
