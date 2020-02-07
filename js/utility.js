
/**
 * Utility functions
 */
var getColour = region => {
    if (region == "Europe") {
        return blue;
    } else if (region == "Africa") {
        return red;
    } else if (region == "Americas") {
        return grey;
    } else if (region == "Asia") {
        return yellow;
    } else if (region == "Oceania") {
        return green;
    } else {
        return grey;
    }
};

function getCircleSize(arr) {
    return arr.reduce((a, b) => a + b, 0);
}