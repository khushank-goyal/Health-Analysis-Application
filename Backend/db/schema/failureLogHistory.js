const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const failueLogDetailsHistory = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    name : { type : String , required : true } ,
    failureTime : { type : String , required : true },
    severity : { type : String , required : true },
    successTime : { type : String , required : false },
    failureCount : {type : Number , required : true },
    failedApi : { type : String , required : true },
    failedMicroservice : { type: mongoose.Schema.Types.ObjectId, ref: "microservices" },
    failureData : {type : Array , required : true }
}, { collection: 'failueLogDetailsHistory' });

const createModel = function () {
    mongoose.model("failueLogDetailsHistory", failueLogDetailsHistory).createCollection()
    return mongoose.model("failueLogDetailsHistory", failueLogDetailsHistory)
}

module.exports.createModel = createModel;
