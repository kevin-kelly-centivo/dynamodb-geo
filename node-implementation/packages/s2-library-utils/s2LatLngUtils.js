const s2 = require('@radarlabs/s2');
const nodeS2 = require("nodes2ts");

const EARTH_RADIUS_METERS = 6367000.0;
const CENTER = new s2.LatLng(0.0, 0.0);

const getDistanceAngle = (s2LatLong) => {
    // nodeS2.S2LatLng
    // This implements the Haversine formula, which is numerically stable for
    // small distances but only gets about 8 digits of precision for very large
    // distances (e.g. antipodal points). Note that 8 digits is still accurate
    // to within about 10cm for a sphere the size of the Earth.
    //
    // This could be fixed with another sin() and cos() below, but at that point
    // you might as well just convert both arguments to S2Points and compute the
    // distance that way (which gives about 15 digits of accuracy for all
    // distances).

    let lat1 = lat().radians();
    let lat2 = s2LatLong.lat().radians();
    let lng1 = lng().radians();
    let lng2 = s2LatLong.lng().radians();
    let dlat = Math.sin(0.5 * (lat2 - lat1));
    let dlng = Math.sin(0.5 * (lng2 - lng1));
    let x = dlat * dlat + dlng * dlng * Math.cos(lat1) * Math.cos(lat2);
    return (new nodeS2.S1Angle(2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0.0, 1.0 - x))))).radians;
    // Return the distance (measured along the surface of the sphere) to the
    // given S2LatLng. This is mathematically equivalent to:
    //
    // S1Angle::FromRadians(ToPoint().Angle(o.ToPoint())
    //
    // but this implementation is slightly more efficient.
}

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