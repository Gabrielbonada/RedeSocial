const mongoose = require("mongoose");
 
const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    texto: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now }
});
 
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
 
    src: {
        type: String,
        required: true
    },
 
    caption: {
        type: String,
        default: ""
    },
 
    type: {
        type: String,
        enum: ["post", "reel"],
        default: "post"
    },
 
    likes: {
        type: Number,
        default: 0
    },
 
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
 
    comments: [CommentSchema]
 
}, { timestamps: true });
 
module.exports = mongoose.model("Post", PostSchema);