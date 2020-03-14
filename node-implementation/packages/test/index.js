const { s2Manager, geo, geoQueryHelper } = require('@dyanmodb-geo-enhanced/s3-geo');

let box = {
    minPoint: { lat: 42.3654830956, long: -79.6339240663 },
    maxPoint: { lat: 43.2018233349, long: -77.8713694208 }
}

// buffalo
// let buffLat = 42.8864;
// let buffLong = -78.8784;

// orachrd park
let lat = 42.7577;
let long = -78.7703;

// let s2LatLongRect = new s2.S2LatLngRect.fromLatLng(s2.S2LatLng.fromDegrees(box.minPoint.lat, box.minPoint.lon),
//     s2.S2LatLng.fromDegrees(box.maxPoint.lat, box.maxPoint.lon));
// console.log(s2Manager.findCellIds(s2LatLongRect));

let geohash = s2Manager.generateGeohash(lat, long);
console.log(geohash);

let hashKey = s2Manager.generateHashKey(geohash, 4);
console.log(hashKey);

console.log(s2Manager.getBoundingBoxForRadiusQuery(lat, long, 20));
console.log(s2Manager.getBoundingBoxForRectangleQuery(box.minPoint.lat, box.minPoint.long, box.maxPoint.lat, box.maxPoint.long));

let geoRadiusProps = geo.generatePropertiesForRadiusQuery(4, lat, long, 20);
console.log(geoRadiusProps);

let geoRectProps = geo.generatePropertiesForRectangleQuery(4, box.minPoint.lat, box.minPoint.long, box.maxPoint.lat, box.maxPoint.long);
console.log(geoRectProps);

let geoProperties = geo.getGeoProperties(4, lat, long);
console.log(geoProperties);
