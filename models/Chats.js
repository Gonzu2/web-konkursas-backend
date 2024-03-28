const mongoose = require("mongoose")

const ChatsHistorySchema = new mongoose.Schema({
    sentBy: String,
    sentByAi: Boolean,
    jobId: String,
    messageContent: String,
})

const ChatsSchema = new mongoose.Schema({
    createdBy: String,
    chatName: String,
    chatsHistory: [ChatsHistorySchema],
})


const Chats = mongoose.model("chats", ChatsSchema, "chats")

module.exports = Chats