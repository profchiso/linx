const { Message, Stan } = require('node-nats-streaming');
const { Subjects } = require('./subjects');


// Listener Abstract Class
export class Listener {
  // Name of the channel a subclass of Listener class is going to listen to(required)
   Subjects;
  // Name of the queue group a subclass of Listener class is going to join(required)
  queueGroupName;
  // Subclasses of Listener class must implement this method to handle message received
  onMessage;

  // Accessible in this class definition only
  client;
  // Accessible in this class definition and its subclasses
  ackWait = 5 * 1000; // 5s

  constructor(client) {
    this.client = Stan;
  }

  // Default subscription options
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  // Setup the subscription for a subject and listen for a message
  listen() {
    // Subscribe to a subject
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    // Listen for a message
    subscription.on('message', (msg) => {
      console.log(`Message received: ${this.Subjects} / ${this.queueGroupName}`);

      // parse the message
      const parsedData = this.parseMessage(msg);

      // a method to be run by subclasses when a message is received
      this.onMessage(parsedData, msg);
    });
  }

  // Parse a message
  parseMessage(msg) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
