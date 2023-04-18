export default isValidDate = (d) => {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d)) { // d.getTime() or d.valueOf() will also work
            // date object is not valid
            return false;
        } else {
            // date object is valid
            return true;
        }
    } else {
        // not a date object
        return false;
    }
};
