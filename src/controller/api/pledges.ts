import { pool_query } from '../../pool'
import { Request, Response } from 'express'
import { Pledge } from '../../dto'

export const get = async (req: Request, res: Response): Promise<void> => {
    const q = `
        select * from pledges;
    `
    const rows: Pledge[] = await pool_query(q, [])
    res.json(rows)
}