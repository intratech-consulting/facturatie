const amqp = require("amqplib");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const Logger = require("./logger");
const logger = Logger.getLogger();
const FossbillingAdmin = require("./fossbilling/admin");
const { getClientIdByUuid, linkUuidToClientId, updateUuidToClientId } = require("./masteruuid");
const constants = require("./constants");

const parser = new XMLParser();
const fossbilling = new FossbillingAdmin();

async function setupUserPublisher(connection) {
    const channel = await connection.createChannel();
    const exchange = "amq.topic";
    await channel.assertExchange(exchange, "topic", { durable: true });
    logger.log("setupUserPublisher", `Asserted exchange: ${exchange}`, false);
    
    // return async function publishUser(user) {
    //     const message = XMLBuilder.buildObject({ user });
    //     logger.log("setupUserPublisher", `Publishing message: ${message}`, false);
    //     channel.publish(exchange, constants.USER, Buffer.from(message));
    // };

    channel.publish(exchange, '', Buffer.from('Hello World!'));
}

module.exports = setupUserPublisher;
