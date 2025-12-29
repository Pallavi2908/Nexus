//workers work in a seperate environment than the main HTTP server
import dotenv from "dotenv";

dotenv.config(); //***dotenv  will try to look for .env file in the workers folder if you try to run this file from where it's store */
// *node src/workers/imageWorker.js is the right way */
import { Worker } from "bullmq";
import { redis } from "../configs/redis.js";
import { compressImage } from "../utils/compressImage.js";

console.log("cwd:", process.cwd());

export const worker = new Worker("image-queue", compressImage, {
  connection: redis,
  concurrency: 5,
});
worker.on("completed", (job) => {
  console.log(`${job.id} has been completed`);
});
worker.on("failed", (job) => {
  console.log(`${job.id} has failed`);
});

worker.on("completed", (job) => {
  console.log("JOB ID:", job.id, " has been finished");
});

worker.on("failed", (job) => {
  console.log("JOB ID:", job.id, " has failed");
});
