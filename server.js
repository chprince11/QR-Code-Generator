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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Endpoint to generate QR code
app.post("/generate", (req, res) => {
  const url = req.body.url;
  console.log(`Received URL: ${url}`);

  // Fixed filename for the QR code image
  const qrFilename = "qr_img.png";
  const qrPath = path.join(__dirname, "public", qrFilename);

  const qrPng = qr.image(url, { type: "png" });
  const writeStream = fs.createWriteStream(qrPath);
  qrPng.pipe(writeStream);

  writeStream.on("finish", () => {
    // Append the URL to URL.txt
    fs.appendFile(
      path.join(__dirname, "public", "URL.txt"),
      url + "\n",
      (err) => {
        if (err) {
          console.error("Error saving URL:", err);
          return res.status(500).send("Server error");
        } else {
          console.log("The URL has been appended and QR code generated!");
          return res.status(200).json({ qrCodeUrl: `/${qrFilename}` });
        }
      }
    );
  });

  writeStream.on("error", (err) => {
    console.error("Error generating QR code:", err);
    return res.status(500).send("Server error");
  });
});

// Endpoint to get the list of URLs
app.get("/urls", (req, res) => {
  const filePath = path.join(__dirname, "public", "URL.txt");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading URL.txt:", err);
      return res.status(500).send("Server error");
    } else {
      const urls = data.split("\n").filter((url) => url.trim() !== "");
      return res.status(200).json({ urls });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
