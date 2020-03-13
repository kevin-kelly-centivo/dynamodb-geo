const s2 = require("nodes2ts");
module.exports = class RadiusGeoFilter {
    constructor(extractor, latLongRect) {
        if (extractor == null || latLong == null) {
            throw new Error("RADIUS GEO FILTER ERROR NULL VALUE");
        }
        this.extractor = extractor;
        this.latLongRect = latLongRect;
    }

    /**
     * @param {*} items array of T
     */
    filter(items) {
        let result = [];
        for (let item of items) {
            let lat = this.extractor.extractLatitude(item);
            let long = this.extractor.extractLongitude(item);
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