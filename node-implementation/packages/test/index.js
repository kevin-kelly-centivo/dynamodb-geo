const s2 = require("nodes2ts");
const s2Manager = require('@dyanmodb-geo-enhanced/geo-core/s2Manager');

let box = {
    minPoint: { lat: 35.26400806942025, lon: -80.3674660285877 },
    maxPoint: { lat: 36.16334513057974, lon: -79.2598319714123 }
}

// buffalo
// let buffLat = 42.8864;
// let buffLong = -78.8784;

// orachrd park
let lat = 42.7577;
let long = -78.7703;

let s2LatLongRect = new s2.S2LatLngRect.fromLatLng(s2.S2LatLng.fromDegrees(box.minPoint.lat, box.minPoint.lon),
    s2.S2LatLng.fromDegrees(box.maxPoint.lat, box.maxPoint.lon));
console.log(s2Manager.findCellIds(s2LatLongRect));

let geohash = s2Manager.generateGeohash(lat, long);
console.log(geohash);

let hashKey = s2Manager.generateHashKey(geohash, 10);
console.log(hashKey);

console.log(s2Manager.getBoundingBoxForRadiusQuery(lat, long, 20));
