const Decimal = require('decimal.js').default;

const MERGE_THRESHOLD = 2;
module.exports = class GeohashRange {
    constructor(range1, range2) {
        this.rangeMin = Decimal.min(new Decimal(range1.toString()), new Decimal(range2.toString()));
        this.rangeMax = Decimal.max(new Decimal(range1.toString()), new Decimal(range2.toString()));
        // this.rangeMin = Math.min(range1, range2);
        // this.rangeMax = Math.max(range1, range2);
    }

    /**
     * @param {*} range GeohashRange
     */
    tryMerge(range) {
        if (range.rangeMin.minus(this.rangeMax) <= MERGE_THRESHOLD
            && range.rangeMin.minus(this.rangeMax) > 0) {
            this.rangeMax = range.rangeMax;
            return true;
        }

        if (this.rangeMin.minus(range.rangeMax) <= MERGE_THRESHOLD
            && this.rangeMin.minus(range.rangeMax) > 0) {
            this.rangeMin = range.rangeMin;
            return true;
        }
        return false;
    }

    /*
     * Try to split the range to multiple ranges based on the hash key.
     *
     * e.g., for the following range:
     *
     * min: 123456789
     * max: 125678912
     *
     * when the hash key length is 3, we want to split the range to:
     *
     * 1
     * min: 123456789
     * max: 123999999
     *
     * 2
     * min: 124000000
     * max: 124999999
     *
     * 3
     * min: 125000000
     * max: 125678912
     *
     * For this range:
     *
     * min: -125678912
     * max: -123456789
     *
     * we want:
     *
     * 1
     * min: -125678912
     * max: -125000000
     *
     * 2
     * min: -124999999
     * max: -124000000
     *
     * 3
     * min: -123999999
     * max: -123456789
     */

    /**
     * @param {*} hashKeyLength int
     * @param {*} s2Manager S2Manager
     * 
     * @return [GeohashRange]
     */
    trySplit(hashKeyLength, s2Manager) {
        let result = [];

        let minHashKey = s2Manager.generateHashKey(this.rangeMin, hashKeyLength).toNumber();
        let maxHashKey = s2Manager.generateHashKey(this.rangeMax, hashKeyLength).toNumber();
        let denominator = Decimal.pow(10, this.rangeMin.toString().length - minHashKey.toString().length);

        if (minHashKey == maxHashKey) {
            result.push(this);
        } else {
            for (let l = minHashKey; l <= maxHashKey; l++) {
                if (l > 0) {
                    result.push(new GeohashRange(l == minHashKey ? this.rangeMin : denominator.times(l),
                        l == maxHashKey ? this.rangeMax : denominator.times((l + 1)).min(1)));
                } else {
                    result.push(new GeohashRange(l == minHashKey ? this.rangeMin : denominator.times((l - 1)).plus(1),
                        l == maxHashKey ? this.rangeMax : denominator.times(l)));
                }
            }
        }
        return result;
    }
}