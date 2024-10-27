import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

interface Problem {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points: number;
    rating: number;
    tags: string[];
}

interface Author {
    contestId: number;
    members: { handle: string }[];
    participantType: string;
    ghost: boolean;
    startTimeSeconds: number;
}

interface ResultItem {
    id: number;
    contestId: number;
    creationTimeSeconds: number;
    relativeTimeSeconds: number;
    problem: Problem;
    author: Author;
    programmingLanguage: string;
    verdict: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
}

interface Problemstats {
    status: string;
    result: ResultItem[];
}

interface ResultItem2 {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

interface Conteststats {
    status: string;
    result: ResultItem2[];
}

interface User_raw extends RowDataPacket {
    id: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user_id = req.body.userId; 
    const url = `https://codeforces.com/api/user.status?handle=${user_id}&from=1&count=100000`;
    const url2 = `https://codeforces.com/api/user.rating?handle=${user_id}`;

    try {
        const connection = await pool.getConnection();

        const [user_row]: [User_raw[], any] = await connection.query('SELECT id FROM Users WHERE user_name = ?', [user_id]);

        const [problems, contests] = await Promise.all([
            axios.get<Problemstats>(url),
            axios.get<Conteststats>(url2)
        ]);

        if (!problems.data.result || problems.data.result.length === 0 || user_id.length <= 3 || !isNaN(user_id[0])) {
            connection.release();
            return res.status(400).json({ message: 'Invalid username' });
        }

        if (user_row.length === 0) {
            await connection.query('INSERT INTO Users (user_name) VALUES (?)', [user_id]);
            const [newUser]: [User_raw[], any] = await connection.query('SELECT id FROM Users WHERE user_name = ?', [user_id]);
            user_row.push(newUser[0]);
        }

        const userId = user_row[0].id;
        
        await Promise.all(contests.data.result.map(contest => {
            return connection.query(
                `INSERT INTO Contests (user_id, contest_id, contest_name, old_rating, new_rating, contest_rank)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 contest_name = VALUES(contest_name), 
                 old_rating = VALUES(old_rating), 
                 new_rating = VALUES(new_rating), 
                 contest_rank = VALUES(contest_rank)`,
                [userId, contest.contestId, contest.contestName, contest.oldRating, contest.newRating, contest.rank]
            ).catch((err: unknown) => {
                console.error(`Contest insertion error for ${contest.contestId}:`, err);
            });
        }));

        await Promise.all(problems.data.result.map(problem => {
            return connection.query(
                `INSERT INTO Problems (user_id, problem_name, lang, verdict, tags, rating, problem_level, contest_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 problem_name = VALUES(problem_name),
                 lang = VALUES(lang), 
                 verdict = VALUES(verdict), 
                 tags = VALUES(tags), 
                 rating = VALUES(rating), 
                 problem_level = VALUES(problem_level),
                 contest_id = VALUES(contest_id)`,
                [userId, problem.problem.name, problem.programmingLanguage, problem.verdict, JSON.stringify(problem.problem.tags), problem.problem.rating, problem.problem.index, problem.contestId]
            ).catch((err: unknown) => {
                console.error(`Problem insertion error for contest ${problem.contestId}:`, err);
            });
        }));

        connection.release();
        return res.status(200).json({ message: 'Database updated successfully' });

    } catch (err: unknown) {
        console.error('Error:', err);
        return res.status(500).json({ message: 'Invalid username or an error occurred' });
    }
}
