const aws = require('aws-sdk');
aws.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = new aws.DynamoDB.DocumentClient();
const ddbMaunal = new aws.DynamoDB();
const parse = aws.DynamoDB.Converter;

const abstractLoopDdbQuery = async (ddb, params) => {
    let keepGoing = true;
    let items = null;
    let result = [];
    while (keepGoing) {
        let newParams = params;
        if (items && items.LastEvaluatedKey) {
            newParams = {
                ...params,
                ExclusiveStartKey: items.LastEvaluatedKey,
            };
        }
        items = await ddb.query(newParams).promise();
        if (items && items.Items && items.Items.length > 0) {
            result.push(...items.Items)
        }
        if (items.count > 0 || !items.LastEvaluatedKey) {
            keepGoing = false;
        }
    }
    return result;
}

/**
 * @param {*} data 
 * 
 * TODO: i think this can be replaced by parser.marshal *face-palm* except for bigint?
 * map appropriate value type to manual ddb put item type
 */
const attributeValueMapper = (item) => {
    let mapped = {};
    for (let key of Object.keys(item)) {
        let value = item[key];

        if (value === undefined) {
            mapped[key] = { 'NULL': true };
            continue;
        }
        else if (value === null) {
            mapped[key] = { 'NULL': true };
        }
        else if (Array.isArray(value)) {
            if (value.every((arrayItem) => {
                return !isNaN(+arrayItem);
            })) {
                mapped[key] = { "NS": value };
                continue;
            } else if (value.every((arrayItem) => {
                return typeof arrayItem === "string"
            })) {
                mapped[key] = { "SS": value };
                continue;
            }
            let newValue = [];
            for (let item of value) {
                // TODO: this might not recursively work, pretty sure it doesnt
                newValue.push({ "M": attributeValueMapper(item) });
            }
            mapped[key] = { "L": newValue };
        }
        else if (typeof value === 'number') {
            mapped[key] = { "N": value.toString() };
        }
        else if (typeof value === 'string') {
            mapped[key] = { "S": value };
        }
        else if (typeof value === 'boolean') {
            mapped[key] = { "BOOL": value };
        }
        else if (typeof value === 'bigint') {
            mapped[key] = { "N": value.toString() };
        }
        // do last many things resulst to this
        else if (typeof value === 'object') {
            mapped[key] = { "M": attributeValueMapper(value) };
        }
    }
    return mapped;
}

/**
 * @param {*} data 
 * 
 * map appropriate value type to manual ddb put item type
 */
const batchAttributeValueMapper = (data) => {
    let mapped = [];
    for (let item of data) {
        mapped.push(attributeValueMapper(item));
    }
    return mapped;
}

const loopDdbQuery = async (params) => {
    return await abstractLoopDdbQuery(ddb, params);
}
const loopDdbManualQuery = async (params) => {
    let data = await abstractLoopDdbQuery(ddbMaunal, params);
    let parsedArray = [];
    for (let item of data) {
        parsedArray.push(parse.unmarshall(item));
    }
    return parsedArray;
}

module.exports = {
    attributeValueMapper,
    batchAttributeValueMapper,
    loopDdbQuery,
    loopDdbManualQuery
}