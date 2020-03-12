const s2 = require('@radarlabs/s2');

const EARTH_RADIUS_METERS = 6367000.0;
const CENTER = new s2.LatLng(0.0, 0.0);

/**
 * @param {*} s2LatLong 
 * @param {*} radius 
 */
const getDistance = (s2LatLong, radius) => {
    // return getDistance(s2LatLong).radians() * radius;
}

/**
 * @param {*} s2LatLong 
 */
const getEarthDistance = (s2LatLong) => {
    return getDistance(s2LatLong, EARTH_RADIUS_METERS);
}

module.exports = {
    getDistance,
    getEarthDistance
}