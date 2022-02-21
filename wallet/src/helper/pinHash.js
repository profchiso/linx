const bcrypt = require("bcryptjs");

//HASH USER PASSWORD WITH BCRYPTJS
exports.hashWalletPin = async (pin) => {
  try {
    const saltRound = await bcrypt.genSalt(10);
    let hashedPin = await bcrypt.hash(pin, saltRound);
    return hashedPin;
  } catch (error) {
    console.log(error);
  }
};

//function to decrypt hashed pin and compare with user entered pin
exports.decryptWalletPin = async (enteredPin, hashedPin) => {
  try {
    return await bcrypt.compare(enteredPin, hashedPin);
  } catch (error) {
    console.log(error);
  }
};
