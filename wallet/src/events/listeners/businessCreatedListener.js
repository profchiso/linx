const { Listener } = require("../baseListener");
const { Message } = require('node-nats-streaming');
const { Subjects } = require('../subjects');
const db = require("../../models/index")
const { WalletCreatedPublisher } = require('../publishers/walletCreatedPublisher');
const { queueGroupName } = './queueGroupName';
const { walletCreatedEvent } = require('../walletCreatedEvent')

export class BusinessCreatedListener extends Listener {
 subject = Subjects.BusinessCreated;

  queueGroupName = queueGroupName;

  async onMessage(parsedData, msg) {
    // 
    const business = await db.Business.create(parsedData);
    const wallet = await db.wallet.create(parsedData)


    // save the business
    await business.save();

    // Publish wallet updated event
    await new WalletCreatedPublisher(this.client).publish({
      id: wallet.id,
      name: wallet.name,
      ownerId: wallet.ownerId,
      credit: wallet.credit,
      debit: wallet.debit,
      balance: wallet.balance,
      version: wallet.version,
    });

    // Ack the message
    msg.ack();
  }
}
