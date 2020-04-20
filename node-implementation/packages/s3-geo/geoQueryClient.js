const aws = require('aws-sdk');
aws.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = new aws.DynamoDB.DocumentClient();

/**
 * A convenience method that executes the <code>queryRequests</code> 
 *  and applies the <code>resultFilter</code> to the query results.
 *
 * @return an immutable collection of filtered items
 */
const execute = async (geoQueryRequest) => {
    let tasks = [];
    for (let query of geoQueryRequest.getQueryRequests()) {
        tasks.push(executeQuery(query, geoQueryRequest.getResultFilter()));
    }
    let results = await Promise.all(tasks);
    // TODO might have to make a consolidated results =[] foreach cresults.push(...result)
    return results;
}

/**
 * Executes the  query using the provided db client. The geo filter is applied to the results of the query.
 *
 * @param queryRequest the query to execute
 * @param resultFilter ---> GeoFilter <Map <String, AttributeValue>>
 * @return a collection of filtered result items
 */
const executeQuery = async (queryRequest, resultFilter) => {
    let queryResult;
    // List <Map <String, AttributeValue>>
    let resultItems = [];

    do {
        queryResult = ddb.query(queryRequest);
        // List <Map <String, AttributeValue>>
        let items = queryResult.getItems();
        // filter the results using the geo filter
        let filteredItems = resultFilter.filter(items);
        resultItems.push(...filteredItems);
        queryRequest = queryRequest.withExclusiveStartKey(queryResult.getLastEvaluatedKey());
    } while ((queryResult.getLastEvaluatedKey() != null));
}
module.exports = {
    execute
}