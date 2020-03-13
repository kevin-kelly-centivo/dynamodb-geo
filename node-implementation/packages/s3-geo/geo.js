const s2 = require("nodes2ts");
const s2Manager = require('./s2Manager');
const geoHelper = require('./geoQueryHelper');
const { GeoProperties, RadiusGeoFilter, RectangleGeoFilter } = require('./model');

/**
 * @param {*} geoHashLength int
 * @param {*} lat double
 * @param {*} long double
 * 
 * @return GeoProperties
 */
const getGeoProperties = (geoHashLength, lat, long) => {
    let geohash = s2Manager.generateGeohash(lat, long);
    let geohashKey = s2Manager.generateHashKey(geohash, geoHashLength);
    return GeoProperties(geoHashLength, geohashKey, lat, long);
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
    let boundingBox = s2Manager.getBoundingBoxForRadiusQuery(lat, long, radius);
    return geoHelper.generateGeoProperties(boundingBox, geoHashLength);
}

/**
 * @param {*} geoHashLength int
 * @param {*} minlat double
 * @param {*} minLong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 * 
 * @return List<GeoProperties>
 */
const generatePropertiesForRectangleQuery = (geoHashLength, minlat, minLong, maxLat, maxLong) => {
    let boundingBox = s2Manager.getBoundingBoxForRectangleQuery(minlat, minLong, maxLat, maxLong);
    return geoHelper.generateGeoProperties(boundingBox, geoHashLength);
}

/**
 * @param {*} properties [GeoProperties]
 * @param {*} lat double
 * @param {*} long double
 * @param {*} radius double
 * 
 * @return List<GeoProperties>
 */
const filterByRadius = (properties, lat, long, radius) => {
    let centerLatLng = s2.S2LatLng.fromDegrees(lat, long);
    let filter = new RadiusGeoFilter(centerLatLng, radius);
    return filter.filter(properties);
}

/**
 * @param {*} properties [GeoProperties]
 * @param {*} minLat double
 * @param {*} minlong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 */
const filterByRectangle = (properties, minLat, minlong, maxLat, maxLong) => {
    let boundingBox = s2Manager.getBoundingBoxForRectangleQuery(minLat, minlong, maxLat, maxLong);
    let filter = new RectangleGeoFilter(boundingBox);
    return filter.filter(properties);
}
module.exports = {
    getGeoProperties,
    generatePropertiesForRadiusQuery,
    generatePropertiesForRectangleQuery,
    filterByRadius,
    filterByRectangle
}