const { Publisher } = require('../basePublisher');
const { Subjects } = require('../subjects');
const { walletCreatedEvent } = require('../walletCreatedEvent');

export class WalletCreatedPublisher extends Publisher {
  subject = Subjects.WalletCreated;
}
