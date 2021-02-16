exports.getFurnishing = function (furnishing) {
    if (furnishing === "0") {
        return "Un-furnished";
    }
    else if (furnishing === "1") {
        return "Semi-furnished";
    }
    else {
        return "Full-furnished";
    }
}

exports.getFlatType = function (flatType) {
    if (flatType === "0") {
        return "1RK";
    }
    else if (flatType === "1") {
        return "1BHK";
    }
    else if (flatType === "2") {
        return "2BHK";
    }
    else {
        return "3BHK";
    }
}

exports.getDateFromEpoch = function (epoch) {
    if (epoch === undefined) {
        return ""
    }
    const newDate = new Date(0);
    newDate.setUTCMilliseconds(epoch);
    return newDate.toDateString();
}