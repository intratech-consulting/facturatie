const amqp = require("amqplib/callback_api");
const fs = require("fs");
const xmlbuilder = require("xmlbuilder");
const { DateTime } = require("luxon");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const xml2js = require("xml2js");
const Admin = require("./admin");
const { getClientIdByUuid, linkUuidToClientId } = require("./masteruuid");

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

const parser = new XMLParser();
const admin = new Admin();
const system = "facturatie";

const logger = require("pino")({
  level: "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

async function getChannel(connection) {
  return new Promise((resolve, reject) => {
    connection.createChannel(function (error1, channel) {
      if (error1) {
        reject(error1);
      }
      resolve(channel);
    });
  });
}

async function main() {
  const credentials = require("amqplib").credentials.plain("user", "password");
  amqp.connect(
    "amqp://localhost:5672",
    { credentials },
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      console.log("Connected to RabbitMQ"); // Add this line to log successful connection
      // Can go to default
      sendHeartbeats(connection);
      setupUserConsumer(connection);
      // setupOrderConsumer(connection);
    },
  );
}

async function setupUserConsumer(connection) {
  const channel = await getChannel(connection);
  const exchange = "amq.topic";
  const queue = system;
  const routing_key = "user." + system;
  channel.assertExchange(exchange, "topic", { durable: true });
  channel.assertQueue(queue, { durable: true });
  logger.info(`Start consuming messages: ${queue}`);
  channel.consume(
    queue,
    async function (msg) {
      logger.info(`Received message: ${msg.content.toString()}`);
      const object = parser.parse(msg.content.toString());
      const user = object.user;
      switch (object.crud_operation) {
        case "create":
          try {
            const clientId = await admin.createClient(user);
            await linkUuidToClientId(user.id, clientId);
            channel.ack(msg);
          } catch (error) {
            logger.error(error);
            channel.nack(msg);
          }
          break;
        case "update":
          channel.ack(msg);
          return;
        case "delete":
          // await deleteUser(user); // TODO: Needs Master UUID deletion method
          channel.ack(msg);
          return;
      }
      new_msg = xmlbuilder
        .create({
          user,
        })
        .end({ pretty: true });
      logger.info(`Publishing message: ${new_msg}`);
      channel.publish(exchange, routing_key, Buffer.from(new_msg));
    },
    {
      noAck: false,
    },
  );
}

async function setupOrderConsumer(connection) {
  const channel = await getChannel(connection);
  const exchange = "amq.topic";
  const queue = "inventory"; // TODO: Fix queue and routing key
  const routing_key = queue + ".facturatie";
  channel.assertExchange(exchange, "topic", { durable: true });
  channel.assertQueue(queue, { durable: true });
  channel.bindQueue(queue, exchange, routing_key);
  channel.consume(
    queue,
    async function (msg) {
      const parser = new XMLParser();
      const object = parser.parse(msg.content.toString());
      const order = object.order;
      if (order.routing_key != routing_key) {
        console.log(
          "Routing key does not match: ",
          order.routing_key,
          routing_key,
        );
        return;
      }
      switch (object.crud_operation) {
        case "create":
          await createOrder(order);
          break;
        case "update":
          break;
        case "delete":
          break;
      }
      channel.ack(msg);
    },
    {
      noAck: false,
    },
  );
}

async function createOrder(uuid, order) {
  let clientId = null;
  try {
    clientId = await getClientIdByUuid(uuid);
  } catch (error) {
    logger.error(error);
    return;
  }
  order.client_id = clientId;
  try {
    await admin.createOrder(order);
  } catch (error) {
    logger.error(error);
  }
}

async function sendHeartbeats(connection) {
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
            SystemName: system,
            ErrorLog: "",
          },
        })
        .end({ pretty: true });
      channel.sendToQueue(queue, Buffer.from(xml_doc));
    }, 1000);
  });
}

main();
