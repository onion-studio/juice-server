import { Request, Response } from 'express';

const isReady = (req: Request, res: Response): void => {
  res.send('OK');
};

export default isReady;
