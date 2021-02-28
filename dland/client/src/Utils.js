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

exports.monthDiff = (checkOut, checkIn) => {
    var months;
    let d1 = new Date(checkOut);
    let d2 = new Date(checkIn);
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}