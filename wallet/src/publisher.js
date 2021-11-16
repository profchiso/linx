const nats = require('node-nats-streaming');
const { randomBytes } = require('crypto');
//import { TicketCreatedPublisher } from './events/ticketPublisher';

console.clear();

// ClientID must always be unique to have as many clients as we want
const clientId = randomBytes(4).toString('hex');

const stan = nats.connect('linx', clientId, {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  // // We can only essentially share strings or raw data
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'Concert',
  //   price: 50,
  //   userId: '456',
  // });

  // // The data and callback fn is optional
  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'Concert',
      price: 50,
      userId: '456',
    });
  } catch (err) {
    console.error(err);
  }
});
