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

    // Create multiple queries based on the geo ranges derived from the bounding box
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

/**
     * For the given <code>QueryRequest</code> query and the boundingBox, this method creates a collection of queries
     * that are decorated with geo attributes to enable geo-spatial querying.
     *
     * @param query       the original query request --> QueryRequest
     * @param boundingBox the bounding lat long rectangle of the geo query --> S2LatLngRect
     * @param config      the config containing caller's geo config, example index name, etc. --> GeoConfig
     * @param compositeKeyValue the value of the column that is used in the construction of the composite hash key(geoHashKey + someOtherColumnValue).
     *                          This is needed when constructing queries that need a composite hash key.
     *                          For eg. Fetch an item where lat/long is 23.78787, -70.6767 AND category = 'restaurants' --> Optional <String>
     * @return queryRequests an immutable collection of <code>QueryRequest</code> that are now "geo enabled" --> List <QueryRequest>
     */
const generateGeoQueries = async (query, boundingBox, config, compositeKeyValue) => {
    let outerRanges = getGeoHashRanges(boundingBox);
    let queryRequests = [];
    for (let outerRange of outerRanges) {
        let geohashRanges = outerRange.trySplit(config.getGeoHashKeyLength(), s2Manager);
        for (let range of geohashRanges) {
            // make a copy of the query request to retain original query attributes like table name, etc.
            let queryRequest = JSON.parse(JSON.stringify(query));
            // generate the hash key for the global secondary index
            let geohashKey = s2Manager.generateHashKey(range.getRangeMin(), config.getGeoHashKeyLength());
            // Map <String, Condition>
            let keyConditions = [{ string: 2, condition: 1.0 }];

            // construct the hashKey condition --> Condition
            let geoHashKeyCondition;
            if (config.getHashKeyDecorator() != null && compositeKeyValue != null) {
                let compositeHashKey = config.getHashKeyDecorator().get().decorate(compositeKeyValue.get(), geohashKey);
                geoHashKeyCondition = new Condition().withComparisonOperator(ComparisonOperator.EQ)
                    .withAttributeValueList(new AttributeValue().withS(compositeHashKey));
            } else {
                geoHashKeyCondition = new Condition().withComparisonOperator(ComparisonOperator.EQ)
                    .withAttributeValueList(new AttributeValue().withN(String.valueOf(geohashKey)));
            }
            keyConditions.push({ string: config.getGeoHashKeyColumn(), condition: geoHashKeyCondition });

            // generate the geo hash range
            let minRange = new AttributeValue().withN(Long.toString(range.getRangeMin()));
            let maxRange = new AttributeValue().withN(Long.toString(range.getRangeMax()));

            let geoHashCondition = new Condition().withComparisonOperator(ComparisonOperator.BETWEEN)
                .withAttributeValueList(minRange, maxRange);
            keyConditions.put(config.getGeoHashColumn(), geoHashCondition);

            queryRequest.withKeyConditions(keyConditions)
                .withIndexName(config.getGeoIndexName());
            queryRequests.add(queryRequest);
        }
    }
    return JSON.parse(JSON.stringify(queryRequests));
}
module.exports = {
    generateGeoProperties,
    generateGeoQueries
}