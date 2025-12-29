import express from "express";
import Redis from "ioredis";

import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

import { pool } from "./src/configs/poolDb.js";
const PORT = 3000;
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.set("views", "./src/views"); // folder where your .ejs files live
app.use("/images", express.static(path.join(process.cwd(), "images")));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const redis = new Redis({ port: 6379, maxRetriesPerRequest: null });
const imageQueue = new Queue("image-queue", { connection: redis });
// ********************************************
app.get("/get-signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "nexus_uploads",
    },
    process.env.API_SECRET
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.API_KEY,
    cloudName: process.env.CLOUD_NAME,
    folder: "nexus_uploads",
  });
});

app.post("/store-data", async (req, res) => {
  const { uploads } = req.body;

  try {
    console.log(uploads);
    for (const f of uploads) {
      await pool.query("INSERT INTO uploads (public_id, url) VALUES(?, ?)", [
        f.public_id,
        f.url,
      ]);
      await imageQueue.add(
        "image-queue",
        {
          public_id: f.public_id,
          url: f.url,
        },
        { attempts: 3, backoff: { type: "fixed", delay: 2000 } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.log("Error occured:", error);
  }
  //write sql query to store each upload
});
app.get("/final", (req, res) => {
  res.render("final");
});

app.get("/", (req, res, next) => {
  res.render("home");
});
app.listen(PORT, () => {
  console.log(`Listening at ${PORT}`);
});
