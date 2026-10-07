const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        checkin: {
            type: String,
            required: true
        },

        checkout: {
            type: String,
            required: true
        },

        room: {
            type: String,
            required: true
        },

        guests: {
            type: Number,
            required: true
        },

        message: {
            type: String,
            default: ""
        },

        nights: {
            type: Number,
            required: true
        },

        pricePerNight: {
            type: Number,
            required: true
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Cancelled"],
            default: "Pending"
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);