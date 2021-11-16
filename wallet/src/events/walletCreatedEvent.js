const { Subjects } = require('./subjects');

// Bind a subject with its event data
const WalletCreatedEvent = {
   subject: Subjects.WalletCreated,
   data: {
    id,
    name,
    ownerId,
    credit,
    debit,
    balance
  }
}

module.exports = { WalletCreatedEvent }
