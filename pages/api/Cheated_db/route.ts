import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/app/lib/db";

interface Results {
  contest_id: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const connection = await pool.getConnection();
    const { user_id: user_name } = req.body;
    console.log(user_name);
    if (!user_name) {
      return res.status(400).send({ message: "User name is required" });
    }

    const [userResult]: [any[], any] = await connection.query(
      "SELECT id FROM Users WHERE user_name = ?",
      [user_name]
    );

    if (userResult.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const userId = userResult[0].id;

    const query = `
    SELECT DISTINCT P.contest_id
    FROM Problems P
    WHERE P.verdict = 'SKIPPED' AND P.user_id = ?
`;

    const [rows]: [Results[], any] = await connection.query(query, [userId]);

    const data: Results[] = rows.map((row) => ({
      contest_id: row.contest_id,
    }));

    res.status(200).send(data);
  } catch (error) {
    console.error("Error retrieving skipped contests:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}
