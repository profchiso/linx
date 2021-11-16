const { Stan } = require('node-nats-streaming');
const { Subjects } = require('./subjects');


export class Publisher {
  // Name of the channel a subclass of Publisher class is going to publish to(required)
  Subjects;

  // Accessible in this class definition only
  client;

  constructor(client) {
    this.client = Stan;
  }

  // Publishing an event to NATS streaming server is an async operation. This is cool for a scenario that we want an event to be published before doing something else in our code
  publish(data) {
    return new Promise((resolve, reject) => {
      this.client.publish(this.Subjects, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }

        console.log('Event published to subject', this.Subjects);
        resolve();
      });
    });
  }
}
