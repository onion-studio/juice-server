import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import api from './controller';
import path from 'path';
import asyncHandler from 'express-async-handler';
import logger from 'morgan';

const app = express();
const port = 3003;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const whiteList = [
  'https://www.juice.vote',
  'https://juice.vote',
  'http://localhost:3000',
  'http://192.168.21.9:3000',
  'https://juice.onion-studio.com:3003',
  'http://juice.onion-studio.com:3003',
];
const corsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin: (origin: any, cb: any): void => {
    if (whiteList.indexOf(origin) !== -1) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

// app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);
app.use(logger('combined'));

app.get('/', (req, res) => res.send(`JUICE SERVER WORKS(env: ${process.env.NODE_ENV})`));
app.get('/health', api.status);
app.post(
  '/init',
  asyncHandler(async (req, res) => {
    await api.init.add(req, res);
  }),
);
app.get(
  '/issues',
  asyncHandler(async (req, res) => {
    await api.issues.get(req, res);
  }),
);
app.get(
  '/pledges',
  asyncHandler(async (req, res) => {
    await api.pledges.get(req, res);
  }),
);
app.get(
  '/pledges/:id',
  asyncHandler(async (req, res) => {
    await api.pledges.getPledgeById(req, res);
  }),
);
app.get(
  '/result',
  asyncHandler(async (req, res) => {
    await api.result.get(req, res);
  }),
);
app.post(
  '/result',
  asyncHandler(async (req, res) => {
    await api.result.add(req, res);
  }),
);
app.get(
  '/result/pledges',
  asyncHandler(async (req, res) => {
    await api.result.getPledgesTotalCount(req, res);
  }),
);
app.get(
  '/result/juice',
  asyncHandler(async (req, res) => {
    await api.result.getJuice(req, res);
  }),
);
app.post(
  '/personal',
  asyncHandler(async (req, res) => {
    await api.personal.add(req, res);
  }),
);
app.get(
  '/personal/count',
  asyncHandler(async (req, res) => {
    await api.personal.getIdentitiesCount(req, res);
  }),
);

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
