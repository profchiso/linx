const nats = require('node-nats-streaming');
const { randomBytes } = require('crypto');
//import { TicketCreatedListener } from './events/ticketListener';

console.clear();

// ClientID must always be unique to have as many clients as we want
const clientId = randomBytes(4).toString('hex');

const stan = nats.connect('linx', clientId, {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  // // subscription options
  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName('orders-service');

  // // Subscribe to 'ticket:created' channel
  // const subscription = stan.subscribe(
  //   'ticket:created',
  //   'orders-service-queue-group',
  //   options
  // );

  // subscription.on('message', (msg: Message) => {
  //   const data = msg.getData();

  //   if (typeof data === 'string') {
  //     console.log(
  //       `Recieved event #${msg.getSequence()}, with the data: ${data}`
  //     );
  //   }

  //   // Manually acknowledge that the event has been processed
  //   msg.ack();
  // });

  // Using TicketCreatedListener class
  //new TicketCreatedListener(stan).listen();
});

// Graceful client shutdown
process.on('SIGINT', () => stan.close()); // Listen for interrupt signals
process.on('SIGTERM', () => stan.close()); // Listen for terminate signals
