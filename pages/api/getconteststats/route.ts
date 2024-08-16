import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

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

interface ResponseData {
    status: string;
    result: ResultItem[];
}

interface ContestStatsData {
    [contestId: number]: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user_id = req.body.userId;
    const url = `https://codeforces.com/api/user.status?handle=${user_id}&from=1&count=10000`;

    try {
        const response = await axios.get<ResponseData>(url);
        const data = response.data;
        let contestStats: ContestStatsData = {};

        data.result.forEach(item => {
            if (item.verdict === "SKIPPED") {
                const contestId = item.contestId;
                if (!(contestId in contestStats)) {
                    contestStats[contestId] = 0;
                }
                contestStats[contestId]++;
            }
        });
        console.log(contestStats)
        res.status(200).json(contestStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching data.' });
    }
}
