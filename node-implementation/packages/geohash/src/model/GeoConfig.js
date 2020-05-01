const generate = (geoIndexName, geoHashKeyColumn, geoHashColumn,
    geoHashKeyLength, hashKeyDecorator = null, compositeHashKeyColumn = null) => {
    return {
        geoIndexName,
        geoHashKeyColumn,
        geoHashColumn,
        geoHashKeyLength,
        hashKeyDecorator,
        compositeHashKeyColumn
    };
}
module.exports = {
    generate
}