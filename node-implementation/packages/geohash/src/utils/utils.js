/**
 * @param {*} columnValue --> String
 * @param {*} geoHashKey --> long
 */
const decorate = (columnValue, geoHashKey) => {
    return `${columnValue}:${geoHashKey}`;
}
module.exports = {
    decorate
}