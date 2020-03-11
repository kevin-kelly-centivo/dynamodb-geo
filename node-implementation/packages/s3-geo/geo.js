/**
 * @param {*} geoHashLength int
 * @param {*} lat double
 * @param {*} long double
 * 
 * @return GeoProperties
 */
const getGeoProperties = (geoHashLength, lat, long) => {

}

/**
 * @param {*} geoHashLength int
 * @param {*} lat double
 * @param {*} long double
 * @param {*} radius double
 * 
 * @return List<GeoProperties>
 */
const generatePropertiesForRadiusQuery = (geoHashLength, lat, long, radius) => {

}

/**
 * @param {*} geoHashLength int
 * @param {*} minlat double
 * @param {*} minLong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 * 
 * @return 
 */
const generatePropertiesForRectangleQuery = (geoHashLength, minlat, minLong, maxLat, maxLong) => {

}

/**
 * @param {*} properties [GeoProperties]
 * @param {*} lat double
 * @param {*} long double
 * @param {*} radius double
 */
const filterByRadius = (properties, lat, long, radius) => {

}

/**
 * @param {*} properties [GeoProperties]
 * @param {*} minLat double
 * @param {*} minlong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 */
const filterByRectangle = (properties, minLat, minlong, maxLat, maxLong) => {

}
module.exports = {
    getGeoProperties,
    generatePropertiesForRadiusQuery,
    generatePropertiesForRectangleQuery,
    filterByRadius,
    filterByRectangle
}