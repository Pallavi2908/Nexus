import sharp from "sharp";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { pool } from "../configs/poolDb.js";

//since job.data => payload => i.e. it has all the details of what stuff we need to do -> image URL
export const compressImage = async (job) => {
  try {
    console.log("Picked up a job:", job.data);
    const { public_id, url } = job.data;
    const outputDir = path.join(process.cwd(), "images");
    const filename = `compressed_${public_id.replace(/\//g, "_")}.jpg`;
    const outputPath = path.join(outputDir, filename);
    //change status of job
    await pool.query("UPDATE uploads SET status=? WHERE public_id=?", [
      "processing",
      public_id,
    ]);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Fetch failed");
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const image = sharp(buffer);
    const { width } = await image.metadata();
    let targetWidth;
    if (width <= 800) targetWidth = width;
    else if (width <= 1600) targetWidth = 1600;
    else if (width <= 3000) targetWidth = 2000;
    else targetWidth = 2400;

    await image
      .resize({
        width: targetWidth,
        withoutEnlargement: true, //prevent upscaling irrespective of target width
        kernel: sharp.kernel.mks2021, // Magic Kernel Sharp 2021 kernel, with more accurate sharpening
      })
      .jpeg({ quality: 80, mozjpeg: true }) //you can play around with how much of x% quality of the org photo do you want to retain
      .toFile(outputPath);

    const localUrl = `/images/${filename}`;
    await pool.query(
      "UPDATE uploads SET compressed_url = ?, status = ? WHERE public_id = ?",
      [localUrl, "completed", public_id]
    );

    return { savedTo: outputPath };
  } catch (error) {
    console.error("Error :", error.message);
    await pool.query("UPDATE uploads SET status = ? WHERE public_id = ?", [
      "failed",
      public_id,
    ]);
    throw error;
  }
};
