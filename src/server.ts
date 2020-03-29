import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import api from './controller';

const app = express();
const port = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const corsOptions = {
  // origin: 'https://juice.vote',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(limiter);

app.get('/', (req, res) => res.send(`JUICE SERVER WORKS(env: ${process.env.NODE_ENV})`));
app.get('/health', api.status);
app.post('/init', api.init.add);
app.get('/issues', api.issues.get);
app.get('/pledges', api.pledges.get);
app.get('/pledges/:id', api.pledges.getPledgeById);
app.get('/result', api.result.get);
app.post('/result', api.result.add);
app.get('/personal', api.personal.get);
app.post('/personal', api.personal.add);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
