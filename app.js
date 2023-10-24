import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json());

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

app.use(express.static(path.join(__dirname, "build")));
app.use((_req, res, _next) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});
