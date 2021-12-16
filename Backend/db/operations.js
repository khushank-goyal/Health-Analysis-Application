const logger = require('tracer').colorConsole();

const findDocumentsByQuery = async (modelObject, query, options) => {
    try {
        return await modelObject.find(query, options).lean();
    } catch (error) {
        logger.error("Error while fetching data:" + error)
        throw new Error(error);
    }
}

const saveDocuments = async (modelObject, data, options) => {
    try {
        let model = new modelObject(data);
        return await model.save(options);
    } catch (error) {
        logger.error("Error while saving data:" + error)
        throw new Error(error);
    }
}

const updateField = async (modelObject, query, update) => {
    try {
        return await modelObject.findOneAndUpdate(query, update, { useFindAndModify: false });
    } catch (error) {
        logger.error("Error while updating data:" + error)
        throw new Error(error);
    }
}

const deleteDocument = async function (modelObject, _id) {
    const result = await modelObject.deleteOne({ _id });
    return result;
}

module.exports.findDocumentsByQuery = findDocumentsByQuery;
module.exports.saveDocuments = saveDocuments;
module.exports.updateField = updateField;
module.exports.deleteDocument = deleteDocument;
