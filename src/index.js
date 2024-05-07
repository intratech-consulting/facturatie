const amqp = require("amqplib/callback_api");
const fs = require("fs");
const xmlbuilder = require("xmlbuilder");
const { DateTime } = require("luxon");

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

const TEAM = "facturatie";

let factuurKlaarChannel;
const factuurKlaarQueue = "factuur_klaar_queue"; // TODO: Insert correct queue name

function main() {
  const logger = require("pino")({
    level: "info",
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  });
  const credentials = require("amqplib").credentials.plain("user", "password");
  amqp.connect(
    "amqp://10.2.160.51",
    { credentials },
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      console.log("Connected to RabbitMQ"); // Add this line to log successful connection
      sendHeartbeats(connection);
      consumeKassa(connection);
      createPublishFactuurKlaarChannel(connection);
    },
  );
}

function sendHeartbeats(connection) {
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
    // Set interval
    setInterval(() => {
      const timestamp = DateTime.now();
      const xml_doc = xmlbuilder
        .create({
          Heartbeat: {
            Timestamp: timestamp.toISO(),
            Status: "Active",
            SystemName: TEAM,
          },
        })
        .end({ pretty: true });
      channel.sendToQueue(queue, Buffer.from(xml_doc));
      console.log("Heartbeat sent");
    }, 1000); 
  });
}

function consumeKassa(connection) {
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    console.log("Channel created"); // Add this line to log successful channel creation
    const queue = "kassa_queue"; // TODO: Insert correct queue name
    try {
      channel.assertQueue(queue, { durable: true });
    } catch (error) {
      console.error("Error asserting queue:", error.message);
      // Handle the error gracefully, for example, by logging it or retrying with different parameters.
    }
    channel.consume(
      queue,
      function (msg) {
        const xml = msg.content.toString();
        const parsed = xmlbuilder.create(xml);
        // TODO: Xml2json
        // TODO: fossbilling API call
        // TODO: Json2xml
        const received = "";
        const response = xmlbuilder // TODO: Create correct response from fossbilling API response
          .create({
            Response: {
              Received: received,
            },
          })
          .end({ pretty: true });
        factuurKlaarChannel.sendToQueue(factuurKlaarQueue, Buffer.from(response));
        // Acknowledge the message
        channel.ack(msg);
      },
      {
        noAck: false,
      },
    );
  });
}

function createPublishFactuurKlaarChannel(connection) {
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    console.log("Channel created"); // Add this line to log successful channel creation
    try {
      channel.assertQueue(factuurKlaarQueue, { durable: true });
      console.log("Queue asserted");
    } catch (error) {
      console.error("Error asserting queue:", error.message);
      // Handle the error gracefully, for example, by logging it or retrying with different parameters.
    }
    factuurKlaarChannel = channel;
  });
}

main();
