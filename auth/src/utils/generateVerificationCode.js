//GENERATE RANDOM 6 DIGIT VERIFICATION CODE
exports.generateVerificationCode = () => {

    return Math.floor(100000 + Math.random() * 900000);
}