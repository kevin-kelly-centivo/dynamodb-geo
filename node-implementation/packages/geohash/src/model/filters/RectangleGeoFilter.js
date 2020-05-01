const s2 = require("nodes2ts");
module.exports = class RadiusGeoFilter {
    constructor(latLongRect) {
        if (latLong == null) {
            throw new Error("RADIUS GEO FILTER ERROR NULL VALUE");
        }
        this.latLongRect = latLongRect;
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
                if (this.latLongRect.contains(latLong)) {
                    result.push(item);
                }
            }
        }
        return result;
    }
}