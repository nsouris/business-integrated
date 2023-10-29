import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { Chat } from "./chat.model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://orionx7:i7HxupA9otqHGDWo@testcluster.t3fpgoc.mongodb.net/$TestMinimal?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    (_) => console.log("Connection to Db Succesfull!"),
    (err) => console.log("Somthing Went Wrong:", err)
  );

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from Db!!!");
});

mongoose.set("toJSON", { virtuals: true });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Expose-Headers", "*");
  next();
});

app.use((req, _res, next) => {
  console.log("Requset method and url : ", req.method, req.url);
  console.log("Requset queryParams:", req.query);
  console.log("Requset body:", req.body);
  next();
});

app.patch("/", async (req, res) => {
  try {
    await Chat.create({ roomId: "roomId", messages: ["ale"] });
    // const doc = await Chat.findOne({ roomId: "minimal" });
    // doc.messages.push(req.body.msg);
    // await doc.save();
    res.status(202).json("ok");
  } catch (error) {
    console.log("🌞", error.message);
    res.status(517).json(error.message);
  }
});
app.post("/", async (req, res) => {
  try {
    const doc = await Chat.findOne({ roomId: "minimal" });
    doc.messages = [];
    await doc.save();
    res.status(202).json("ok");
  } catch (error) {
    console.log("🌞", error.message);
    res.status(517).json(error.message);
  }
});

app.use(express.static(path.join(__dirname, "build")));
app.use((_req, res, _next) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});
