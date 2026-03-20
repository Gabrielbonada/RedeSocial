const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    src: {
        type: String,
        required: true
    },

    expiraEm: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }

}, { timestamps: true });

module.exports = mongoose.model("Story", StorySchema);