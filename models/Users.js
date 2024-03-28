const mongoose = require("mongoose")

const UsersSchema = new mongoose.Schema({
    name: String,
    password: String,
})

const Users = mongoose.model("users", UsersSchema, "users")

module.exports = Users