'use client';
import { FC, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import dynamic from "next/dynamic";
import "chart.js/auto";
import { Chart as ChartJS, Plugin } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const Bar = dynamic(
 () => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), { ssr: false });

interface DataProps {
  problem_name: string,
  contest_id:number,
  lang: string;
  verdict: string;
  tags: string[];
  rating: number;
  problem_level: string;
}
interface unsolved_problem{
  [problem_name:string] :{
    verdict: string[],
    contest_id:number,
    problem_level:string
  }
}
const convertToPercentage = (data: number[]) => {
  const total = data.reduce((acc, value) => acc + value, 0);
  return data.map(value => ((value / total) * 100).toFixed(2)); 
};
const Page: FC = () => {
  const [parsedData, setParsedData] = useState<DataProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myMap, setMyMap] = useState<Map<string, number>>(new Map());
  const [myMap2, setMyMap2] = useState<Map<number, number>>(new Map());
  const [verdictCounts, setVerdictCounts] = useState<Map<string, number>>(new Map());
  const [langCounts, setLangCounts] = useState<Map<string, number>>(new Map());
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
  const [unsolved, setunsolved] = useState<unsolved_problem>()
  const params = useSearchParams();
  const user_id = params?.get("user_id");

  const data_fetch = async () => {
    try {
      const res = await axios.post("/api/user_detailsdb/route", {
        user_id: user_id,
      });
      setParsedData(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof AxiosError) {
        setError("Failed to fetch data");
        console.log("Data not added to the database");
      }
    }
  };

  useEffect(() => {
    if (user_id) {
      data_fetch();
    }
  }, [user_id]);

  useEffect(() => {
    const map = new Map<string, number>();
    const map2 = new Map<number, number>();
    const map3 = new Map<string, number>();
    const map4 = new Map<string, number>();
    const tagMap = new Map<string, number>();

   const probMap:unsolved_problem = {};

    parsedData.forEach((e) => {
      if (e.verdict === 'OK') {
        map.set(e.problem_level, (map.get(e.problem_level) || 0) + 1);
        map2.set(e.rating, (map2.get(e.rating) || 0) + 1);
      }
      map3.set(e.verdict, (map3.get(e.verdict) || 0) + 1);
      map4.set(e.lang, (map4.get(e.lang) || 0) + 1);

      e.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
       
      if(!probMap[e.problem_name]){
         probMap[e.problem_name] = {
          verdict: [e.verdict],
          contest_id:e.contest_id,
          problem_level:e.problem_level
         }
      }
    probMap[e.problem_name].verdict.push(e.verdict);
    });
    const filteredProblemData: unsolved_problem = Object.entries(probMap)
    .filter(([_, details]) => !details.verdict.some(verdict => verdict === "OK")) 
    .reduce((acc, [problemName, details]) => {
      acc[problemName] = details;
      return acc;
    }, {} as unsolved_problem);
  
     setunsolved(filteredProblemData);
    setMyMap2(map2);
    setMyMap(map);
    setVerdictCounts(map3);
    setLangCounts(map4);
    setTagCounts(tagMap);
    console.log("Map after parsing:", map);
  }, [parsedData]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const excludedLabels = ['B1', 'B2', 'C1', 'C2', 'D1', 'E1'];

  const label1 = Array.from(myMap.keys())
    .filter(label => !excludedLabels.includes(label))
    .sort((a, b) => b.localeCompare(a)); 
  
  const data1 = label1.map(label => myMap.get(label));
  
  const chartdata = {
    labels: label1.map(String),
    datasets: [
      {
        label: `Levels of ${user_id} `,
        data: data1,
        backgroundColor: ['#3187A2'],
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 1,
      },
    ],
  };

  const labels = Array.from(myMap2.keys()).sort((a, b) => b - a);
  const data = labels.map((label) => myMap2.get(label));
  const chartdata2 = {
    labels: labels.map(String),
    datasets: [
      {
        label: `Problem solved of ${user_id} `,
        data: data,
        backgroundColor: "#3187A2",
        borderColor: "rgba(0, 0, 0, 1)",
        borderWidth: 1,
      },
    ],
  };
 
  const pieData = {
    labels: Array.from(verdictCounts.keys()),
    datasets: [
      {
        data: convertToPercentage(Array.from(verdictCounts.values())),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',    
          'rgba(54, 162, 235, 0.7)',    
          'rgba(75, 192, 192, 0.7)',    
          'rgba(255, 206, 86, 0.7)',   
          'rgba(153, 102, 255, 0.7)',   
          'rgba(255, 159, 64, 0.7)',    
          'rgba(201, 203, 207, 0.7)',   
          'rgba(100, 181, 246, 0.7)'    
        ],
        borderWidth: 1,
      },
    ],
  };

  const langData = {
    labels: Array.from(langCounts.keys()),
    datasets: [
      {
        data: convertToPercentage( Array.from(langCounts.values())),
        backgroundColor: [
        'rgba(255, 99, 132, 0.7)',   
  'rgba(54, 162, 235, 0.7)',    
  'rgba(75, 192, 192, 0.7)',    
  'rgba(255, 206, 86, 0.7)',
  'rgba(153, 102, 255, 0.7)',   
  'rgba(255, 159, 64, 0.7)',    
  'rgba(201, 203, 207, 0.7)',   
        ],
        borderWidth: 1,
      },
    ],
  };

  const donutData = {
    labels: Array.from(tagCounts.keys()),
    datasets: [
      {
        data: convertToPercentage(Array.from(tagCounts.values())),
        backgroundColor: [
          'rgba(70, 130, 180, 0.8)',
          'rgba(0, 102, 204, 0.8)',
          'rgba(34, 139, 34, 0.8)',
          'rgba(210, 105, 30, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(255, 69, 0, 0.8)',
          'rgba(128, 0, 128, 0.8)',
          'rgba(255, 20, 147, 0.8)',
          'rgba(100, 149, 237, 0.8)',
          'rgba(60, 179, 113, 0.8)',
          'rgba(139, 69, 19, 0.8)',
          'rgba(255, 228, 196, 0.8)',
          'rgba(0, 191, 255, 0.8)',
          'rgba(238, 130, 238, 0.8)',
          'rgba(144, 238, 144, 0.8)',
          'rgba(255, 192, 203, 0.8)',
          'rgba(25, 25, 112, 0.8)',
          'rgba(147, 112, 219, 0.8)',
          'rgba(100, 100, 100, 0.8)',
          'rgba(255, 0, 255, 0.8)',
          'rgba(135, 206, 250, 0.8)',
          'rgba(205, 133, 63, 0.8)',
          'rgba(46, 139, 87, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(255, 140, 0, 0.8)',
          'rgba(64, 224, 208, 0.8)',
          'rgba(100, 149, 237, 0.8)',
          'rgba(192, 192, 192, 0.8)',
          'rgba(0, 139, 139, 0.8)',
          'rgba(75, 0, 130, 0.8)',
        ],        
        borderWidth: 1,
      },
    ],
  }; 
  const pieOptions = {
    plugins: {
      datalabels: {
        display: false
      },
     
    },
  
  } as const;  
  return (
    
    <div className="bg-slate-100 flex flex-col justify-center items-center py-10 space-y-6">
      <div className="flex flex-row space-x-6">
        <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600" style={{ width: '500px', height: '550px' }}>
        <h1>Submissions of {user_id}</h1>
          <Pie data={pieData} options={pieOptions} plugins={[ChartDataLabels as Plugin<"pie">]} />
        </div>

        <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600 " style={{ width: '500px', height: '550px' }}>
          <h1>Languages of {user_id}</h1>
          <Pie data={langData} options={pieOptions} plugins={[ChartDataLabels as Plugin<"pie">]} />
        </div>
      </div>

      <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600" style={{ width: '500px', height: '550px' }}>
      <h1>Tags of {user_id}</h1>
        <Doughnut data={donutData} options={{ plugins: { datalabels: { display: false } } }} />
      </div>

      <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600" style={{ width: '1000px', height: '500px' }}>
        <Bar data={chartdata} />
      </div>

      <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600" style={{ width: '1000px', height: '500px' }}>
        <Bar data={chartdata2} />
      </div>
      <div className="bg-dark-700 p-4 rounded-lg shadow-lg border border-gray-600" style={{ width: '1000px', height: '500px' }}>
        <div className="flex flex-wrap gap:2px">
        {Object.entries(unsolved || {}).map(([problemName, details]) => (
          <div key = {problemName} className="flex text-center ">
        <a  href={`https://codeforces.com/contest/${details.contest_id}/problem/${details.problem_level}`} target="_blank" >
          {details.contest_id}{details.problem_level}
        </a>
        </div>
        ))}
      </div>
      </div>
      
    </div>
  );
};

export default Page;
