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
    id: number,
    user_name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user_id = req.body.userId; 
    const url = `https://codeforces.com/api/user.status?handle=${user_id}&from=1&count=100000`;
    const url2 = `https://codeforces.com/api/user.rating?handle=${user_id}`;

    try {
        const problems = await axios.get<Problemstats>(url);
        const contests = await axios.get<Conteststats>(url2);
        const connection = await pool.getConnection();

        if(problems.data.result.length === 0 || user_id.length <=3  || !isNaN(user_id[0])){
            return res.status(400).json({message: 'invalid user_name'})
        }

        const [user_row]: [User_raw[], any] = await connection.query('SELECT id FROM Users WHERE user_name = ?', [user_id]);

        if (user_row.length > 0 ){
            return res.status(200).json({ message: 'User already inserted' });
        } 
            await connection.query(
                'INSERT INTO Users (user_name) values(?)',
                [user_id]
            );

          
            const [newUser]: [User_raw[], any] = await connection.query('SELECT id FROM Users WHERE user_name = ?', [user_id]);
            const userId = newUser[0].id;
            await Promise.all( contests.data.result.map((contest) =>{
                return connection.query(
                    'INSERT INTO Contests (user_id, contest_id, contest_name, old_rating, new_rating, contest_rank) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, contest.contestId, contest.contestName, contest.oldRating, contest.newRating, contest.rank]
                );
            }));
            await Promise.all(
                problems.data.result.map((problem)=>{
                    return connection.query(
                        'INSERT INTO Problems (user_id, lang, verdict, tags, rating, problem_level, contest_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [userId, problem.programmingLanguage, problem.verdict, JSON.stringify(problem.problem.tags), problem.problem.rating, problem.problem.index, problem.contestId]
                    );
                })
            
            )            
        

       return res.status(200).json({ message: 'Database updated successfully' });
    } catch (error) {
        console.error('Error:', error);
      return  res.status(500).json({ message: 'Invalid username or an error occurred' });
    } 
}
