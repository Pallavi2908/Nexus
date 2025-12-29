import { redis } from "../configs/redis.js";

import { Queue } from "bullmq";

export const imageQueue = new Queue("image-queue", { connection: redis });
