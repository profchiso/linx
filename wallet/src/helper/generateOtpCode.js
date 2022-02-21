//GENERATE RANDOM 6 DIGIT VERIFICATION CODE
exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
