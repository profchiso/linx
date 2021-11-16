const nats = require('node-nats-streaming');
const { Stan } = require('node-nats-streaming');

class NatsWrapper {
  // Accessible only in this class definiton
   _client;

  // Expose the NATS client instance
  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  // Connect to NATS streaming server
  connect(clusterId, clientId, url) {
    this._client = nats.connect(clusterId, clientId, { url });

    // this._client.on('connect', () => {
    //   console.log('Connected to NATS');
    // });
    // this._client.on('error', (err) => {
    //   console.error(err);
    // });

    // Modify connecting to NATS streaming server to use async/await instead of callback pattern
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// Export a single instance of NatsWrapper
export const natsWrapper = new NatsWrapper();
