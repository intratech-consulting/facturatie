const xmlbuilder = require("xmlbuilder");
const { DateTime } = require("luxon");
const Logger = require("./logger");
const logger = Logger.getLogger();
const constants = require("./constants");

async function setupHeartbeats(connection) {
  const channel = await connection.createChannel();
  logger.log("setupHeartbeats", `Heartbeat channel created`, false);
  const queue = "heartbeat_queue";
  try {
    await channel.assertQueue(queue, { durable: true });
    logger.log("setupHeartbeats", `Asserted queue: ${queue}`, false);
  } catch (error) {
    logger.log("setupHeartbeats", `Error asserting queue: ${queue}`, true);
  }
  // Set interval
  setInterval(() => {
    const xml_doc = xmlbuilder
      .create({
        Heartbeat: {
          Timestamp: DateTime.now().toISO(),
          Status: "Active",
          SystemName: constants.SYSTEM,
          ErrorLog: "",
        },
      })
      .end({ pretty: true });
    channel.sendToQueue(queue, Buffer.from(xml_doc));
  }, 1000);
}

module.exports = setupHeartbeats;
