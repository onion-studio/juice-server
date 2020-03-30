import { Request, Response } from 'express';
import issueLib from '../model/issues';

const get = async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await issueLib.get();
    res.json({
      issues,
    });
  } catch (e) {
    res.status(500).json({
      message: e,
    });
  }
};

export default {
  get,
};
