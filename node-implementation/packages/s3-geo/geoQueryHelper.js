const s2Manager = require('./s2Manager');
const { GeohashRange, GeoProperties } = require('./model');

/**
 * Merge continuous cells in cellUnion and return a list of merged GeohashRanges.
 *
 * @param cellUnion Container for multiple cells. S2CellUnion
 * @return A list of merged GeohashRanges.
 */
const mergeCells = (cellUnion) => {
    let cellIds = cellUnion.getCellIds();
    if (cellIds.length > 1000) {
        console.log(`Created ${cellIds.length} cell ids`);
    }
    let ranges = [];
    for (let c of cellIds) {
        let range = new GeohashRange(c.rangeMin().id, c.rangeMax().id);
        let wasMerged = false;
        for (let r of ranges) {
            if (r.tryMerge(range)) {
                wasMerged = true;
                break;
            }
        }
        if (!wasMerged) {
            ranges.push(range);
        }
    }
    return ranges;
}

/**
 * Creates a collection of <code>GeohashRange</code> by processing each cell {@see com.google.common.geometry.S2CellId}
 * that is contained inside the given boundingBox
 *
 * @param boundingBox the boundingBox {@link com.google.common.geometry.S2LatLngRect} of a given query S2LatLngRect
 * @return ranges a list of <code>GeohashRange</code>
 */
const getGeoHashRanges = (boundingBox) => {
    let cells = s2Manager.findCellIds(boundingBox);
    return mergeCells(cells);
}

/**
* For the given <code>QueryRequest</code> query and the boundingBox, this method creates a collection of queries
* that are decorated with geo attributes to enable geo-spatial querying.
*
* @param boundingBox the bounding lat long rectangle of the geo query : S2LatLngRect
* @param hashKeyLength the hash key length for the geo query : int
* @return an immutable collection of {@linkplain GeoProperties}
*/
const generateGeoProperties = (boundingBox, hashKeyLength) => {
    let outerRanges = getGeoHashRanges(boundingBox);
    let queryRequests = [];

    //Create multiple queries based on the geo ranges derived from the bounding box
    for (let outerRange of outerRanges) {
        let geohashRanges = outerRange.trySplit(hashKeyLength, s2Manager);
        for (let range of geohashRanges) {
            let geoHashKey = s2Manager.generateHashKey(range.rangeMin, hashKeyLength);
            queryRequests.push(GeoProperties(hashKeyLength, geoHashKey, range.rangeMin, range.rangeMax));
        }
    }
    // to return new deep copy of this JSON stringify json parse return
    return queryRequests;
}

module.exports = {
    generateGeoProperties
}