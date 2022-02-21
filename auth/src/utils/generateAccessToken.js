const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const JWT_SECRET = process.env.JWT_KEY
console.log(JWT_SECRET)

//GENERATE ACCESS TOKEN FOR AUTHENTICATION
exports.generateAccessToken = async(payload) => {
    try {
        let accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "2 days",
        });
        return accessToken;
    } catch (error) {
        console.log(error);
    }
};


//GENERATE PASSWORD RESET TOKEN
exports.generatePasswordResetToken = async() => {
    try {
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const passwordResetToken = crypto
            .createHash("sha256")
            .update(resetPasswordToken)
            .digest("hex");
        const passwordResetTokenExpires = Date.now() + 30 * 60 * 1000; // pick the current time and add 30 ie(30*60) minutes to it and convert to seconds by multiplying with 1000

        return {
            resetPasswordToken,
            passwordResetTokenExpires,
            passwordResetToken,
        };
    } catch (error) {
        console.log(error);
    }
};