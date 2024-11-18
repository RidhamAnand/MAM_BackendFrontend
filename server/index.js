const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
const Image = require("./model/Image"); // Ensure your Image model is defined
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies
// Configure Nodemailer

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service provider
    auth: {
        user: 'ridhamanand31@gmail.com',
        pass: 'hzrn oryt ygab cqrq', // use an app password if using Gmail with 2FA
    },
})

// MongoDB connection
const connectDb = async () => {
    try {
        console.log("Connecting to DB.........");
        
        await mongoose.connect("mongodb+srv://ridhamanand31:MessiIsBest@cluster0.uugnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Database Connected Successfully");
    } catch (e) {
        console.log("Error connecting to DB", e);
    }
};

connectDb();

// Set up HTTP routes
app.get("/getImages", async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 }); // Adjust based on your model
        res.json({ images });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

// Start the HTTP server
const httpPort = 8000;
const httpServer = app.listen(httpPort, () => {
    console.log(`HTTP Server Listening at http://localhost:${httpPort}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Upgrade the HTTP server to handle WebSocket requests
httpServer.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

// WebSocket connection handling
wss.on("connection", (ws) => {
    console.log("New WebSocket client connected");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        // Handle incoming messages if needed
    });

    ws.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});

// Example ESP32 WebSocket connection
const esp32Url = "ws://192.168.9.89:8080"; // Adjust this to your ESP32 IP
const esp32Connection = new WebSocket(esp32Url);

esp32Connection.onopen = () => {
    console.log("Connected to ESP32 WebSocket server");
};

esp32Connection.onmessage = async (message) => {
    try {
        const obj = JSON.parse(message.data);
        console.log("Received data from ESP32:", obj);

        const newImage = new Image({ url: obj.url });
        await newImage.save();
        console.log("Image saved");

          // Send email notification
          const mailOptions = {
            from: 'ridhamanand31@gmail.com',
            to: 'arnavanand710@gmail.com', // replace with the user's email
            subject: 'Someone is At the Door!',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                    <h2 style="color: #333;">Someone is at the Door!</h2>
                    <p>A new image has been saved:</p>
                    <img src="${obj.url}" alt="Door Image" style="max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 4px;" />
                    <p style="color: #555;">Check it out above!</p>
                </div>
            `
        };
         
        console.log("Sending Email Notification.....");
        
       

        // Broadcast to all connected WebSocket clients
        const alertData = { message: "New image saved!", url: obj.url, timestamp: new Date() };
        broadcast(alertData);
        await transporter.sendMail(mailOptions);
        console.log("Email sent");
    } catch (error) {
        console.error("Error processing message:", error);
    }
};

const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};


app.post("/sendResponse",(req,res)=>{
    const responseMessage = req.body.message || "Default response message";

    // Send a message back to the ESP32
    esp32Connection.send(JSON.stringify({ response: responseMessage }));

    console.log("Sent response to ESP32:", responseMessage);
    res.status(200).send("Response sent to ESP32");
})
// No need for a separate listen for the WebSocket server
