exports.generateEntityId = (n) => {
    n = n + 1;
    if (n <= 999) {
        return ("00" + n).slice(-3);
    } else {
        return n;
    }
};