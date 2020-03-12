const s2 = require('@radarlabs/s2');

/****** METHODS THAT DON'T SEEM TO COME WITH OUR S2 LIB ******/
const FACE_BITS = 3;
const NUM_FACES = 6;
// Valid levels: 0..MAX_LEVEL
const MAX_LEVEL = 30;
const POS_BITS = 2 * MAX_LEVEL + 1;
const MAX_SIZE = 1 << MAX_LEVEL;
// Equivalent to 0xffffffffffffffffL
const MAX_UNSIGNED = -1;

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
const fromFacePosLevel = (face, pos, level) => {
    return (new s2.CellId((face << POS_BITS) + (pos | 1))).parent(level);
}

/**
 * @param {*} level int
 */
const begin = (level) => {
    let child = fromFacePosLevel(0, 0, 0);
    return childBegin(child, level);
}

/**
 * @param {*} level int
 */
const end = (level) => {
    let child = fromFacePosLevel(5, 0, 0);
    return childEnd(child, level);
}

/**
 * @param {*} level int
 */
const childBegin = (cell, level = null) => {
    if (level == null) {
        let oldLsb = lowestOnBit();
        return new s2.CellId(id - oldLsb + (oldLsb >>> 2));
    }
    return new s2.CellId(id - lowestOnBit(cell) + lowestOnBitForLevel(level));
}

/**
 * @param {*} level int
 */
const childEnd = (cell, level = null) => {
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

module.exports = {
    FACE_BITS,
    NUM_FACES,
    MAX_LEVEL,
    POS_BITS,
    MAX_SIZE,
    MAX_UNSIGNED,
    fromFacePosLevel,
    begin,
    end,
    childBegin,
    childEnd
}