const assert = require('assert').strict;
const s2 = require('@radarlabs/s2');
const s2CellUtils = require('@dyanmodb-geo-enhaned/s2-library-utils').s2CellUtils;

/**
 * @param {*} latLongRect S2LatLngRect
 */
const findCellIds = (latLongRect) => {
    // ConcurrentLinkedQueue<S2CellId>
    let queue = [];
    // ArrayList<S2CellId>
    let cellIds = [];

    for (let c = s2CellUtils.begin(0); !c.equals(s2CellUtils.end(0)); c = c.next()) {
        if (containsGeodataToFind(c, latLongRect)) {
            queue.push(c);
        }
    }

    processQueue(queue, cellIds, latLongRect);
    assert.equal(queue.size(), 0);
    queue = null;

    if (cellIds.length > 0) {
        let cellUnion = new s2.CellUnion(cellIds);
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
    // new ArrayList<S2CellId>(4)
    let children = [];
    for (let c = s2CellUtils.childBegin(parent); !c.equals(s2CellUtils.childEnd(parent)); c = c.next()) {
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
    let latLong = new s2.LatLng(lat, long);
    let cellId = new s2.CellId(latLong);
    // TODO: not needed I dont think
    // let cellId = cell.id(); 
    return cellId.id();
}

/**
 * @param {*} geohash long
 * @param {*} hashKeyLength int
 * 
 * @return long
 */
const generateHashKey = (geohash, hashKeyLength) => {
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
    let centerLatLong = new s2.LatLng(lat, long);
    let latRefUnit = lat > 0.0 ? -1.0 : 1.0;
    let latRefLatLong = new s2.LatLng(lat + latRefUnit, long);
    let longRefUnit = long > 0.0 ? -1.0 : 1.0;
    let longRefLatLong = new s2.LatLng(lat, long + longRefUnit);

    let latForRadius = radius / centerLatLong.getEarthDistance(latRefLatLong);
    let longForRadius = radius / centerLatLong.getEarthDistance(longRefLatLong);

    let minLatLong = new s2.LatLng(lat - latForRadius, long - longForRadius);
    let maxLatLong = new s2.LatLng(lat + latForRadius, long + longForRadius);

    return new S2LatLngRect(minLatLong, maxLatLong);
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
    let minLatLong = new s2.LatLng(minLat, minLong);
    let maxLatLong = new s2.LatLng(maxLat, maxLong);
    return new S2LatLngRect(minLatLong, maxLatLong);
}

module.exports = {
    findCellIds,
    generateGeohash,
    generateHashKey,
    getBoundingBoxForRadiusQuery,
    getBoundingBoxForRectangleQuery
}