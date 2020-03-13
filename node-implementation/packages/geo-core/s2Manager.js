const assert = require('assert').strict;
const s2 = require("nodes2ts");

/**
 * @param {*} latLongRect S2LatLngRect
 */
const findCellIds = (latLongRect) => {
    // ConcurrentLinkedQueue<S2CellId>
    let queue = [];
    // ArrayList<S2CellId>
    let cellIds = [];

    for (let c = s2.S2CellId.begin(0); !c.equals(s2.S2CellId.end(0)); c = c.next()) {
        if (containsGeodataToFind(c, latLongRect)) {
            queue.push(c);
        }
    }

    processQueue(queue, cellIds, latLongRect);
    assert.equal(queue.length, 0);
    queue = null;

    if (cellIds.length > 0) {
        let cellUnion = new s2.S2CellUnion();
        cellUnion.initRawCellIds(cellIds);
        cellIds = null;
        return cellUnion;
    }
    return null;
}

/**
 * @param {*} cellId S2CellId
 * @param {*} latLongRect S2LatLngRect
 */
const containsGeodataToFind = (cellId, latLongRect) => {
    if (latLongRect != null) {
        return latLongRect.intersects(new s2.S2Cell(cellId));
    }
    return false;
}

/**
 * @param {*} queue ConcurrentLinkedQueue<S2CellId>
 * @param {*} cellIds ArrayList<S2CellId>
 * @param {*} latLongRect S2LatLngRect
 */
const processQueue = (queue, cellIds, latLongRect) => {
    // TODO: might have to implement an actual queue, right now using array as FIFO
    for (let c = queue.shift(); c != null; c = queue.shift()) {
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
    // new ArrayList<S2CellId>(4)
    let children = [];
    for (let c = parent.childBegin(); !c.equals(parent.childEnd()); c = c.next()) {
        if (containsGeodataToFind(c, latLongRect)) {
            children.push(c);
        }
    }

    /*
        * TODO: Need to update the strategy!
        *
        * Current strategy:
        * 1 or 2 cells contain cellIdToFind: Traverse the children of the cell.
        * 3 cells contain cellIdToFind: Add 3 cells for result.
        * 4 cells contain cellIdToFind: Add the parent for result.
        *
        * ** All non-leaf cells contain 4 child cells.
    */
    if (children.length == 1 || children.length == 2) {
        for (let child of children) {
            if (child.isLeaf()) {
                cellIds.push(child);
            } else {
                queue.push(child);
            }
        }
    } else if (children.length == 3) {
        cellIds.push(...children);
    } else if (children.length == 4) {
        cellIds.push(parent);
    } else {
        assert.equal(false);
    }
}

/**
 * @param {*} lat double
 * @param {*} long double
 * 
 * @return long
 */
const generateGeohash = (lat, long) => {
    let latLong = s2.S2LatLng.fromDegrees(lat, long);
    let cell = s2.S2Cell.fromLatLng(latLong)
    return cell.id;
}

/**
 * @param {*} geohash long
 * @param {*} hashKeyLength int
 * 
 * @return long
 */
const generateHashKey = (geohash, hashKeyLength) => {
    console.log("GEOHASH:", geohash)
    if (geohash < 0) {
        // Counteract "-" at beginning of geohash.
        hashKeyLength++;
    }

    let geohashString = geohash.toString();
    let denominator = Math.pow(10, geohashString.length - hashKeyLength);

    //  can happen if geohashString.length() < geohash. Querying with a lat/lng of 0.0 can create this situation.
    if (denominator == 0) {
        return geohash;
    }
    return geohash / denominator;
}

/**
 * @param {*} lat double
 * @param {*} long double
 * @param {*} radius double
 * 
 * @return S2LatLngRect
 */
const getBoundingBoxForRadiusQuery = (lat, long, radius) => {
    let centerLatLong = s2.S2LatLng.fromDegrees(lat, long);
    let latRefUnit = lat > 0.0 ? -1.0 : 1.0;
    let latRefLatLong = s2.S2LatLng.fromDegrees(lat + latRefUnit, long);
    let longRefUnit = long > 0.0 ? -1.0 : 1.0;
    let longRefLatLong = s2.S2LatLng.fromDegrees(lat, long + longRefUnit);

    let latForRadius = radius / centerLatLong.getEarthDistance(latRefLatLong);
    let longForRadius = radius / centerLatLong.getEarthDistance(longRefLatLong);

    let minLatLong = s2.S2LatLng.fromDegrees(lat - latForRadius, long - longForRadius);
    let maxLatLong = s2.S2LatLng.fromDegrees(lat + latForRadius, long + longForRadius);

    return new s2.S2LatLngRect(minLatLong, maxLatLong);
}

/**
 * @param {*} minLat double
 * @param {*} minLong double
 * @param {*} maxLat double
 * @param {*} maxLong double
 * 
 * @return S2LatLngRect
 */
const getBoundingBoxForRectangleQuery = (minLat, minLong, maxLat, maxLong) => {
    let minLatLong = new s2.S2LatLng(minLat, minLong);
    let maxLatLong = new s2.S2LatLng(maxLat, maxLong);
    return new s2.S2LatLng(minLatLong, maxLatLong);
}

module.exports = {
    findCellIds,
    generateGeohash,
    generateHashKey,
    getBoundingBoxForRadiusQuery,
    getBoundingBoxForRectangleQuery
}