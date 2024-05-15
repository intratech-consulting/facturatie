const xmlbuilder = require("xmlbuilder");
const { DateTime } = require("luxon");
const logger = require("./logger").getLogger();
const constants = require("./constants");

const heartbeat_xsd = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="Heartbeat">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="Timestamp" type="xs:dateTime" />
                <xs:element name="Status" type="xs:string" />
                <xs:element name="SystemName" type="xs:string" />
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

async function setupHeartbeats(connection) {
  const channel = await connection.createChannel();
  logger.info("Heartbeat channel created");
  const queue = "heartbeat_queue";
  try {
    await channel.assertQueue(queue, { durable: true });
    logger.info(`Asserted queue: ${queue}`);
  } catch (error) {
    logger.error(error);
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
