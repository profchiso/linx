const { Subjects } = require('./subjects');
const  { WalletCreatedEvent }  = require('./walletCreatedEvent');
const { Publisher } = require('./basePublisher');

export class WalletCreatedPublisher extends Publisher {
   subject = Subjects.WalletCreated;
}
 