import { Request, Response } from 'express';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import initLib from '../model/init';

const add = async (req: Request, res: Response): Promise<void> => {
  const token = uuidv1();
  const now = moment.utc().format();
  try {
    await initLib.add(token, now);
    res.json({
      token,
      timestamp: now,
    });
  } catch (e) {
    throw {
      message: e,
    };
  }
};

export default {
  add,
};
