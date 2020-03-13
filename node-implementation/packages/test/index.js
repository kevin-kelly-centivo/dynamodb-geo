const s2 = require("nodes2ts");
const s2Manager = require('@dyanmodb-geo-enhanced/geo-core/s2Manager');

// buffalo
// let lat = 42.8864;
// let long = -78.8784;

// orachrd park
let lat = 42.7577;
let long = -78.7703;


console.log(s2Manager.getBoundingBoxForRadiusQuery(lat, long, 100));
console.log(s2Manager.findCellIds(new s2.S2LatLng.fromDegrees(lat, long)));