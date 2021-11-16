const { businessCreatedListener } = require('../events/listeners/businessCreatedListener');
const { natsWrapper } = require('./natsWrapper');

require("dotenv").config();

export const connectNATS = async () => {
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    // Graceful Shutdown - Gotcha => code like this(which can cause our entire program to exit) should not be put/hidden away inside of some method in a class/far away file(bad design!). we only ever want to allow something to exit our entire program from inside of more central location such as the index.ts file(This is good since we're still calling this function in our index.ts file - same as writing this code in index.ts file)
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); // Listen for interrupt signals
    process.on('SIGTERM', () => natsWrapper.client.close()); // Listen for terminate signals

    // Initialize listeners to listen for events
    new businessCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};
