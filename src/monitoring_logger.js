const { XMLBuilder } = require("fast-xml-parser");
const sendValidatedXML = require("./sendValidatedXML");
const constants = require("./constants");

async function sendLogEntry(functionName, logs, error) {
  // Create XML data
  const builder = new XMLBuilder("1.0", {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const xmlData = builder
    .create({
      LogEntry: {
        SystemName: constants.SYSTEM,
        FunctionName: functionName,
        Logs: logs,
        Error: error ? "true" : "false",
        Timestamp: new Date().toISOString(), // Current timestamp
      },
    })
    .end();

  // Define the routing key
  const routingKey = "logs";

  // Send the validated XML
  await sendValidatedXML(xmlData, routingKey);
}

module.exports = sendLogEntry;
