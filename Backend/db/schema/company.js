const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
}, { collection: 'companies' });

const createModel = function () {
    mongoose.model("companies", companySchema).createCollection()
    return mongoose.model("companies", companySchema)
}

module.exports.createModel = createModel;
