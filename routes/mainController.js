const express = require("express")
const router = express.Router()
const axios = require("axios")
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const Users = require("../models/Users")
const Chats = require("../models/Chats")

mongoose.connect(process.env.MONGODB)

mongoose.connection.on("connected", () => {
    console.log("Mongodb connected")
})

const config = {
    headers: { Authorization: `Bearer ${process.env.TOKEN}` }
};


router.post("/login", async (req, res) => {
    const { name, password } = req.body;
    let user
    try {
        user = await Users.findOne({ name: name });
    } catch (err) {
        console.log(err)
    }

    if (!user) return res.status(404).json({ message: "Coulnd't find user" })

    if (password !== user.password) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    return res.status(200).json({ message: "Successfully connected" })
})

router.get('/chats', async (req, res) => {
    let chats = await Chats.find({}, "_id createdBy chatName")

    res.status(200).json({ chats: chats })
})

router.post("/new", async (req, res) => {
    const { name, message } = req.body;

    let bodyParameters = {
        prompt: message,
    }
    let responseData
    await axios.post(
        'http://172.16.50.58:5000/api/text/generate',
        bodyParameters,
        config
    ).then(response => {
        responseData = response.data
    })

    try {
        await Chats.create({ createdBy: name, chatName: message, chatsHistory: [{ sentBy: name, sentByAi: false, jobId: null, messageContent: message }, { sentBy: "AI", sentByAi: true, jobId: responseData.job_id, messageContent: "Generating response" }] })

    } catch (err) {
        return res.status(500).json({ meesage: "Internal error" })
    }

    return res.status(200).json({ message: "Successfully created new chat" })
})

router.get("/chat/:chat_id", async (req, res) => {
    const chat_id = req.params.chat_id;

    let chat = await Chats.findById(chat_id);

    chat.chatsHistory.find(async (chatHistory) => {
        if (chatHistory.sentByAi === true) {
            chatHistory.messageContent = await getResponseFromAi(chatHistory.jobId)
            console.log(chatHistory)
        }
    })

    async function getResponseFromAi(job_id) {
        let job_result;
        await axios.get(
            `http://172.16.50.58:5000/api/text/status/${job_id}`,
            config
        ).then(response => {
            job_result = response.data.job_result
        })

        return job_result
    }

    await chat.save()
    res.status(200).json({ message: chat })

})

router.delete("/chat/:chat_id/delete", async (req, res) => {
    const chat_id = req.params.chat_id;
    try {
        await Chats.deleteOne({ _id: chat_id })
    } catch (err) {
        console.log(err)
        return res.status(501).json({ message: "Internal error" })
    }

    return res.status(200).json({ message: "Successfully deleted chat" })
})




module.exports = router