import express from "express";
import bodyParser from "body-parser";
import qr from "qr-image";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Endpoint to generate QR code
app.post("/generate", (req, res) => {
  const url = req.body.url;
  console.log(`Received URL: ${url}`);

  const qrPng = qr.image(url, { type: "png" });
  const qrPath = path.join(__dirname, "public", "qr_img.png");

  const writeStream = fs.createWriteStream(qrPath);
  qrPng.pipe(writeStream);

  writeStream.on("finish", () => {
    fs.writeFile(path.join(__dirname, "public", "URL.txt"), url, (err) => {
      if (err) {
        console.error("Error saving URL:", err);
        return res.status(500).send("Server error");
      } else {
        console.log("The URL has been saved and QR code generated!");
        return res.status(200).send("QR code generated");
      }
    });
  });

  writeStream.on("error", (err) => {
    console.error("Error generating QR code:", err);
    return res.status(500).send("Server error");
  });
});

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
