import { Request, Response } from 'express';
import { v1 as uuidv1 } from 'uuid';
import moment from 'moment';
import initLib from '../model/init';

const add = async (req: Request, res: Response): Promise<void> => {
  const token = uuidv1();
  const now = moment.utc().format();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const agent = req.header('User-Agent') || null;
  try {
    await initLib.add(token, now, ip, agent);
    res.json({
      token,
      timestamp: now,
    });
  } catch (e) {
    res.status(500).json({
      message: e,
    });
  }
};

export default {
  add,
};
