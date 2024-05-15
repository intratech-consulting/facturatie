// async function setupOrderConsumer(connection) {
//   const channel = await getChannel(connection);
//   const exchange = "amq.topic";
//   const queue = "inventory"; // TODO: Fix queue and routing key
//   const routing_key = queue + ".facturatie";
//   channel.assertExchange(exchange, "topic", { durable: true });
//   channel.assertQueue(queue, { durable: true });
//   channel.bindQueue(queue, exchange, routing_key);
//   channel.consume(
//     queue,
//     async function (msg) {
//       const parser = new XMLParser();
//       const object = parser.parse(msg.content.toString());
//       const order = object.order;
//       if (order.routing_key != routing_key) {
//         console.log(
//           "Routing key does not match: ",
//           order.routing_key,
//           routing_key,
//         );
//         return;
//       }
//       switch (object.crud_operation) {
//         case "create":
//           await createOrder(order);
//           break;
//         case "update":
//           break;
//         case "delete":
//           break;
//       }
//       channel.ack(msg);
//     },
//     {
//       noAck: false,
//     },
//   );
// }
//
// async function createOrder(uuid, order) {
//   let clientId = null;
//   try {
//     clientId = await getClientIdByUuid(uuid);
//   } catch (error) {
//     logger.error(error);
//     return;
//   }
//   order.client_id = clientId;
//   try {
//     await fossbilling.createOrder(order);
//   } catch (error) {
//     logger.error(error);
//   }
// }