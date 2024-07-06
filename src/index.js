import connectDB from "./database/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import cluster from "node:cluster";
import os from "node:os";
const totalCpu = os.cpus().length;

dotenv.config({
  path: "./.env",
});
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`server is running on the port:${process.env.PORT}`);
      });
    })
    .catch((error) => {
      console.log("Mongodb connection failed!!!", error);
    });
}
