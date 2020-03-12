const s2 = require('@radarlabs/s2');

/**
 * @param {*} latLongRect S2LatLngRect
 */
const findCellIds = (latLongRect) => {
    // ConcurrentLinkedQueue<S2CellId>
    let queue = [];
    // ArrayList<S2CellId>
    let cellIds = [];

    for (let c = S2CellId.begin(0); !c.equals(S2CellId.end(0)); c = c.next()) {
        if (containsGeodataToFind(c, latLngRect)) {
            queue.push(c);
        }
    }

}

/**
 * @param {*} cellId S2CellId
 * @param {*} latLongRect S2LatLngRect
 */
const containsGeodataToFind = (cellId, latLongRect) => {
    if (latLongRect != null) {
        return latLongRect.intersects(new s2.Cell(cellId));
    }
    return false;
}

/**
 * @param {*} queue ConcurrentLinkedQueue<S2CellId>
 * @param {*} cellIds ArrayList<S2CellId>
 * @param {*} latLongRect S2LatLngRect
 */
const processQueue = (queue, cellIds, latLongRect) => {
    for (let c = queue.poll(); c != null; c = queue.poll()) {
        if (!c.isValid()) {
            break;
        }
        processChildren(c, latLongRect, queue, cellIds);
    }
}

/**
 * @param {*} parent S2CellId
 * @param {*} latLongRect S2LatLngRect
 * @param {*} queue ConcurrentLinkedQueue<S2CellId> 
 * @param {*} cellIds ArrayList<S2CellId>
 */
const processChildren = (parent, latLongRect, queue, cellIds) => {

}

/**
 * @param {*} lat double
 * @param {*} long double
 */
const generateGeohash = (lat, long) => {

}

/**
 * @param {*} geohash long
 * @param {*} hashKeyLength int
 */
const generateHashKey = (geohash, hashKeyLength) => {

}

/**
 * @param {*} lat double
 * @param {*} long double
 * @param {*} radius double
 */
const getBoundingBoxForRadiusQuery = (lat, long, radius) => {

}

/**
 * @param {*} minLat double
 * @param {*} minLong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 */
const getBoundingBoxForRectangleQuery = (minLat, minLong, maxLat, maxLong) => {

}

module.exports = {
    findCellIds,
    generateGeohash,
    generateHashKey,
    getBoundingBoxForRadiusQuery,
    getBoundingBoxForRectangleQuery
}