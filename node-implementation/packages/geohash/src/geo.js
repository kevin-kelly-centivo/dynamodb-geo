const Decimal = require('decimal.js').default;
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

/**
 * Decorates the given <code>putItemRequest</code> with attributes required for geo spatial querying.
 *
 * @param putItem        the request that needs to be decorated with geo attributes --> query request for put
 * @param latitude       the latitude that needs to be attached with the item --> double
 * @param longitude      the longitude that needs to be attached with the item --> double
 * @param configs        the collection of configurations to be used for decorating the request with geo attributes --> List<GeoConfig> 
 * @return the decorated request
 */
const putItemRequest = async (putItem, latitude, longitude, configs) => {
    if (configs == null) {
        throw Error("MUST HAVE CONFIGS");
    }

    let newItem = {
        ...putItem
    };
    for (let config of configs) {
        isConfigValid(config);

        let geohash = s2Manager.generateGeohash(latitude, longitude);
        let geoHashKey = s2Manager.generateHashKey(geohash, config.geoHashKeyLength);

        // this needs to be number value
        // let geoHashValue = parseFloat(geohash);
        let geoHashValue = new Decimal(geohash.toString());
        // newItem[config.geoHashColumn] = parseFloat(geoHashValue);
        newItem[config.geoHashColumn] = geoHashValue.toString();

        let geoHashKeyValue;
        if (config.hashKeyDecorator != null && config.compositeHashKeyColumn != null) {
            let compositeHashKeyValue = newItem[config.compositeHashKeyColumn];
            if (compositeHashKeyValue == null) {
                continue;
            }
            let compositeColumnValue = compositeHashKeyValue.toString();
            let hashKey = config.hashKeyDecorator(compositeColumnValue, geoHashKey);
            // decorate the request with the composite geoHashKey (type String)
            geoHashKeyValue = hashKey.toString();
        } else {
            // decorate the request with the geoHashKey (type Number)
            // geoHashKeyValue = parseFloat(geoHashKey);
            geoHashKeyValue = new Decimal(geoHashKey.toString());
        }
        newItem[config.geoHashKeyColumn] = geoHashKeyValue.toString();
    }
    return newItem;
}

/**
* Decorates the given query request with attributes required for geo spatial querying.
*
* @param queryRequest the request that needs to be decorated with geo attributes --> QueryRequest
* @param latitude     the latitude of the item that is being queried --> double
* @param longitude    the longitude of the item that is being queried --> double
* @param config       the configuration to be used for decorating the request with geo attributes --> GeoConfig
* @param compositeKeyValue the value of the column that is used in the construction of the composite hash key(geoHashKey + someOtherColumnValue).
*                          This is needed when constructing queries that need a composite hash key. --> Optional <String>
*                          For eg. Fetch an item where lat/long is 23.78787, -70.6767 AND category = 'restaurants'
* @return the decorated request --> QueryRequest
*/
const getItemQuery = async (getItem, latitude, longitude, config, compositeKeyValue) => {
    isConfigValid(config);
    let newItem = {
        ...getItem
    };

    // generate the geohash and geoHashKey to query by global secondary index
    let geoHash = s2Manager.generateGeohash(latitude, longitude);
    let geoHashKey = s2Manager.generateHashKey(geoHash, config.geoHashKeyLength);
    newItem.IndexName = config.geoIndexName;

    // construct hashkey condition
    let geoHashKeyCondition;
    if (config.hashKeyDecorator != null && compositeKeyValue != null) {
        let hashKey = config.hashKeyDecorator(compositeKeyValue, geoHashKey);
        geoHashKeyCondition = `${config.geoHashKeyColumn} = ${hashKey}`;
    } else {
        geoHashKeyCondition = `${config.geoHashKeyColumn} = ${geoHashKey}`;
    }
    let geoHashCondition = `${config.geoHashColumn} = ${geoHash}`;

    newItem.KeyConditionExpression = `${geoHashKeyCondition} AND ${geoHashCondition}`;
    return newItem;
}

/**
 * @param {*} config 
 */
const isConfigValid = (config) => {
    if (config.geoIndexName == null || config.geoHashKeyColumn == null ||
        config.geoHashColumn == null || config.geoHashKeyLength == null) {
        throw Error("Invalid Config");
    }
}

module.exports = {
    getGeoProperties,
    generatePropertiesForRadiusQuery,
    generatePropertiesForRectangleQuery,
    filterByRadius,
    filterByRectangle,
    putItemRequest,
    getItemQuery
}