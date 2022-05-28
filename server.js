const express = require("express");
const app = express();
const morgan = require("morgan");
const api = require("./routes/indexRoute");
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "512mb" }));
app.use(express.json({ limit: "512mb" }));
app.use(morgan("dev"));

app.use("/api/v1/", api);
app.listen(8000, function () {
  console.log("Server is listening on", 8000);
});
