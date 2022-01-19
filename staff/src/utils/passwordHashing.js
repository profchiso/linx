const bcrypt = require("bcryptjs");

//HASH USER PASSWORD WITH BCRYPTJS
exports.hashUserPassword = async(password) => {
    try {
        const saltRound = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, saltRound);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
};

//function to decrypt hashed password and compare with user entererd password
exports.decryptPassword = async(enteredPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    } catch (error) {
        console.log(error);
    }
};