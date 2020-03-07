import express from "express";
import api from "./controller";

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send(`JUICE SERVER WORKS(env: ${process.env.NODE_ENV})`))
app.get('/health', api.status)
app.get('/issues', api.issues.get)
app.get('/issues/:id', api.issues.getIssuesById)
app.get('/pledges', api.pledges.get)
app.get('/pledges/:id', api.pledges.getPledgeById)
app.get('/result', api.result.get)
app.post('/result', api.result.add)
app.post('/personal', api.personal.add)

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
