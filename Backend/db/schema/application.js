const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    name: { type: String, required: true },
    key: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "companies" },
    splunk: {
        username: { type: String, required: true },
        password: { type: String, required: true },
        host: { type: String, required: true },
        port: { type: String, required: true },
        scheme: { type: String, required: true }
    }
}, { collection: 'applications' });

const createModel = function () {
    return mongoose.model("applications", applicationSchema)
}

module.exports.createModel = createModel;
