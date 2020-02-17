import express from "express";
import api from "./controller/api";

const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello, world!"));
app.get("/pledges", api.pledges.get);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
