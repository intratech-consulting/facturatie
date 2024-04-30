const amqp = require("amqplib/callback_api");
const fs = require("fs");
const xmlbuilder = require("xmlbuilder");
const { DateTime } = require("luxon");

const TEAM = "facturatie";

function main(timestamp) {
  const logger = require("pino")({
    level: "info",
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  });

  const heartbeat_xml = `
    <Heartbeat>
        <Timestamp>${timestamp.toISO()}</Timestamp>
        <Status>1</Status>
        <SystemName>${TEAM}</SystemName>
    </Heartbeat>
    `;

  const heartbeat_xsd = `
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="Heartbeat">
            <xs:complexType>
                <xs:sequence>
                    <xs:element name="Timestamp" type="xs:dateTime" />
                    <xs:element name="Status" type="xs:int" />
                    <xs:element name="SystemName" type="xs:string" />
                </xs:sequence>
            </xs:complexType>
        </xs:element>
    </xs:schema>
    `;

  const xml_doc = xmlbuilder
    .create({
      Heartbeat: {
        Timestamp: timestamp.toISO(),
        Status: 1,
        SystemName: TEAM,
      },
    })
    .end({ pretty: true });

  console.log("XML document:", xml_doc); // Add this line to log the XML document

  // Assuming schema validation logic here

  const credentials = require("amqplib").credentials.plain("user", "password");
  amqp.connect(
    "amqp://10.2.160.51",
    { credentials },
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      console.log("Connected to RabbitMQ"); // Add this line to log successful connection
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        console.log("Channel created"); // Add this line to log successful channel creation
        const queue = "heartbeat_queue";

        try {
          channel.assertQueue(queue, { durable: true });
          console.log("Queue asserted");
        } catch (error) {
          console.error("Error asserting queue:", error.message);
          // Handle the error gracefully, for example, by logging it or retrying with different parameters.
        }

        channel.sendToQueue(queue, Buffer.from(xml_doc));
        console.log("Message sent");
      });
    }
  );
}

function sendHeartbeat() {
  try {
    main(DateTime.now());
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Call sendHeartbeat again after 1 seconds (1000 milliseconds)
    setTimeout(sendHeartbeat, 1000);
  }
}

// Call sendHeartbeat initially
sendHeartbeat();
