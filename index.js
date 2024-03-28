const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express();
const router = require("./routes/mainController")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/", router)

app.listen(3000, (req, res) => {
    console.log("Successfully listening on port 3000")
})