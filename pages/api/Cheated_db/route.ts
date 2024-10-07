import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/app/lib/db";

interface Results  {
    contest_id: number;
    contest_name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const connection = await pool.getConnection();
        
        
        const query = `
            SELECT P.contest_id, C.contest_name
            FROM Problems P
            LEFT JOIN Contests C ON P.contest_id = C.contest_id
            WHERE P.verdict = 'SKIPPED'
        `;
    
   const [rows]: [Results[], any] = await connection.query(query);
   const data: Results[] = rows.map(row => ({
    contest_id: row.contest_id,
    contest_name: row.contest_name,
}));

        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
