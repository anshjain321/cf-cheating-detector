import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/app/lib/db";
interface Results {
    lang: string,
    verdict: string,
    tags: string[],
    rating: number  ,
    problem_level: string ,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const connection = await pool.getConnection();
    const { user_id: user_name } = req.body;
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
    SELECT distinct problem_name , lang,verdict,tags,rating,problem_level
    FROM Problems P
    WHERE  P.user_id = ${userId}`;

    const [rows]: [Results[], any] = await connection.query(query);
    

    res.status(200).send({data: rows});
  } catch (error) {
    console.error("Error retrieving skipped contests:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}
