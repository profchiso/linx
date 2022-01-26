const db = require("../models/index")
exports.getStaffWalletFromQueueAndUpdate = () => {

    const updatedStaffWallet = await db.staff.update({ walletId: "" }, { where: { id: staffId }, returning: true, plain: true })
};