const s2 = require("nodes2ts");
module.exports = class RadiusGeoFilter {
    constructor(centerLatLng, radiusInMeter) {
        if (extractor == null || centerLatLng == null || (radiusInMeter <= 0)) {
            throw new Error("RADIUS GEO FILTER ERROR NULL VALUE OR 0 METER");
        }
        this.centerLatLng = centerLatLng;
        this.radiusInMeter = radiusInMeter;
    }

    /**
     * @param {*} items array of T
     */
    filter(items) {
        let result = [];
        for (let item of items) {
            let lat = item.lat;
            let long = item.long;
            if (lat != null && long != null) {
                let latLong = s2.S2LatLng.fromDegrees(lat, long);
                if (centerLatLng.getEarthDistance(latLong) <= radiusInMeter) {
                    result.push(item);
                }
            }
        }
        return result;
    }
}