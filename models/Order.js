const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    purchased_date: {
        type: Date,
        default: Date.now()
    },
    items: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: true
            },
            subtotal: {
                type: Number,
                required: true
            },
        },
        {
            _id: false
        },
    ],
    total: {
        type: Number
    },
});

module.exports = mongoose.model("Order", OrderSchema);