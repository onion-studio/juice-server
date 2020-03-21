import { Request, Response } from 'express';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';

const add = (req: Request, res: Response): void => {
  const timestamp = moment.now();
  const token = uuidv1();
  res.json({
    token,
    timestamp,
  });
};

export default {
  add,
};
