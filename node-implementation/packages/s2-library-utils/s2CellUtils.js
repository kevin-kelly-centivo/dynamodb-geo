const s2 = require('@radarlabs/s2');

/****** METHODS THAT DON'T SEEM TO COME WITH OUR S2 LIB ******/
exports.FACE_BITS = 3;
exports.NUM_FACES = 6;
// Valid levels: 0..MAX_LEVEL
exports.MAX_LEVEL = 30;
exports.POS_BITS = 2 * MAX_LEVEL + 1;
exports.MAX_SIZE = 1 << MAX_LEVEL;
// Equivalent to 0xffffffffffffffffL
exports.MAX_UNSIGNED = -1;

/**
 * @param {*} face int
 * @param {*} pos long
 * @param {*} level level
 * 
 * @return S2CellId
 * 
 * @description 
 *   Return a cell given its face (range 0..5), 61-bit Hilbert curve position
 *   within that face, and level (range 0..MAX_LEVEL). The given position will
 *   be modified to correspond to the Hilbert curve position at the center of
 *   the returned cell. This is a static function rather than a constructor in
 *   order to give names to the arguments.
 * 
 */
exports.fromFacePosLevel = (face, pos, level) => {
    return (new s2.CellId((face << POS_BITS) + (pos | 1))).parent(level);
}

/**
 * @param {*} level int
 */
exports.begin = (level) => {
    let child = fromFacePosLevel(0, 0, 0);
    return childBegin(child, level);
}

/**
 * @param {*} level int
 */
exports.end = (level) => {
    let child = fromFacePosLevel(5, 0, 0);
    return childEnd(child, level);
}

/**
 * @param {*} level int
 */
exports.childBegin = (cell, level = null) => {
    if (level == null) {
        let oldLsb = lowestOnBit();
        return new s2.CellId(id - oldLsb + (oldLsb >>> 2));
    }
    return new s2.CellId(id - lowestOnBit(cell) + lowestOnBitForLevel(level));
}

/**
 * @param {*} level int
 */
exports.childEnd = (cell, level = null) => {
    if (level == null) {
        let oldLsb = lowestOnBit();
        return new s2.CellId(id + oldLsb + (oldLsb >>> 2));
    }
    return new s2.CellId(id + lowestOnBit(cell) + lowestOnBitForLevel(level));
}

lowestOnBit = (cell) => {
    return cell.id & -cell.id;
}
lowestOnBitForLevel = (level) => {
    return 1 << (2 * (MAX_LEVEL - level));
}