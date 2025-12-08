
# Nexus : Scalable Image Compression Pipeline

Nexus is a robust image compression pipeline designed with scalability and fault-tolerance in mind. It simulates the ingestion-heavy systems used in modern content platforms; using BullMQ to handle the heavy job of image compression in the background.

The secondary goal of Nexus is to be able to understand what a 'scalable' and 'fault-tolerant' system really means, and to decide the future scope of this project.

### 🚧 Project Status: Work in Progress 🚧
Nexus is currently 50% complete.
The ingestion layer and a basic BullMQ processing system have been implemented.
This repository is intentionally being developed in the open to reflect how I would structure, plan, and ship a real-world project at a startup.
I am actively working on the remaining features.
# High-Level Architecture
![design](https://res.cloudinary.com/dfedndfmw/image/upload/v1765194142/diagram-export-12-8-2025-5_11_58-PM_fmr7ty.png)

## End-to-End Flow
1. Client uploads file → Server (ingestion).
2. Server stores file temporarily & enqueues a job in BullMQ.
3. Worker picks up the job asynchronously.
4. Worker compresses image using Sharp.
5. Worker uploads compressed file to Cloudinary.
6. Worker updates job record in MySQL.
7. Worker emits progress → Server forwards via SSE. 
8. Client UI updates in real time.
9. Final compressed URL returned.

## ✔️What's already working!
- Implemented working UI design
- Dockerized Redis instance
- Image ingestion with Multer+Express and Cloudinary REST API
- Signed uploads for security and to avoid bogus images, spamming images etc.
- Basic compression pipeline using Sharp

## 🛠️ Work Remaining (Tracked as GitHub Issues)
Pending work is managed as GitHub Issues.
You can view the full roadmap here:
https://github.com/Pallavi2908/Nexus/issues
# Tech-stack
### Backend
- Node.js + Express
- Multer
- Sharp
- BullMQ
- Redis (Docker image)
- MySQL (mysql2)
- SSE (Server-Sent Events)

### Storage / Infra
- Cloudinary
- Docker

### Frontend
- EJS
- TailwindCSS
- JavaScript
