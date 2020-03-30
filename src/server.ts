import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import api from './controller';
import path from 'path';

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
app.use(express.json());
app.use(limiter);
app.get('/', (req, res) => res.send(`JUICE SERVER WORKS(env: ${process.env.NODE_ENV})`));
app.get('/health', api.status);
app.post('/init', api.init.add);
app.get('/issues', api.issues.get);
app.get('/pledges', api.pledges.get);
app.get('/pledges/:id', api.pledges.getPledgeById);
app.get('/result', api.result.get);
app.post('/result', api.result.add);
app.get('/result/pledges', api.result.getPledgesTotalCount);
app.get('/result/juice', api.result.getJuice);
app.post('/personal', api.personal.add);
app.get('/personal/count', api.personal.getIdentitiesCount);

if (process.env.NODE_ENV === 'production') {
  require('greenlock-express')
    .init({
      packageRoot: path.resolve(__dirname, '..'),
      configDir: './greenlock.d',

      // contact for security and critical bug notices
      maintainerEmail: 'onionstudio.kr@gmail.com',

      // whether or not to run at cloudscale
      cluster: false,
    })
    // Serves on 80 and 443
    // Get's SSL certificates magically!
    .serve(app);
} else {
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
