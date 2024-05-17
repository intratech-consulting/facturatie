const { XMLBuilder } = require("fast-xml-parser");
const sendValidatedXML = require("./sendValidatedXML");
const constants = require("./constants");

async function sendLogEntry(functionName, logs, error) {
  const xsdData = constants.LOG_XSD;

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
        Error: error,
        Timestamp: new Date().toISOString(), // Current timestamp
      },
    })
    .end();

  // Define the routing key
  const routingKey = "logs";

  // Send the validated XML
  await sendValidatedXML(xmlData, xsdData, routingKey);
}

module.exports = sendLogEntry;
