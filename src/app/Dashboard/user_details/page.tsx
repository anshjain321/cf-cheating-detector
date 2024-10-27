'use client';
import { FC, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import dynamic from "next/dynamic";
import "chart.js/auto";
import { Chart as ChartJS, Plugin } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });

interface DataProps {
  lang: string;
  verdict: string;
  tags: string[];
  rating: number;
  problem_level: string;
}

const Page: FC = () => {
  const [parsedData, setParsedData] = useState<DataProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myMap, setMyMap] = useState<Map<string, number>>(new Map());
  const [myMap2, setMyMap2] = useState<Map<number, number>>(new Map());
  const [verdictCounts, setVerdictCounts] = useState<Map<string, number>>(new Map());
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
    const map2 = new Map<number ,number>();
    const map3 =  new Map<string,number>();
    parsedData.forEach((e) => {
      if(e.verdict === 'OK'){
      if (map.has(e.problem_level)) {
        map.set(e.problem_level, map.get(e.problem_level)! + 1);
      } else {
        map.set(e.problem_level, 1);
      }
      if (map2.has(e.rating)) {
        map2.set(e.rating, map2.get(e.rating)! + 1);
      } else {
        map2.set(e.rating, 1);
      }
    }
      if (map3.has(e.verdict)) {
        map3.set(e.verdict, map3.get(e.verdict)! + 1);
      } else {
        map3.set(e.verdict, 1);
      }
    });
    setMyMap2(map2);
    setMyMap(map);
    setVerdictCounts(map3);
    console.log("Map after parsing:", map); 
  }, [parsedData]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  console.log(myMap.get('A'));
  const chartdata = {
    labels: ['K', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
    datasets: [
      {
        label: `Levels of ${user_id} `,
        data: [
          myMap.get('K') ,
          myMap.get('H') ,
          myMap.get('G') ,
          myMap.get('F') ,
          myMap.get('E') ,
          myMap.get('D') ,
          myMap.get('C') ,
          myMap.get('B')  ,
          myMap.get('A') ,
        ],
        backgroundColor: [
          'rgba(0,0,0,0.8)'
        ],
        borderColor: [

        ],
        borderWidth: 1,
      },
    ],
  };
  const labels = Array.from(myMap2.keys()).sort((a, b) => b-a); 
  const data = labels.map((label) => myMap2.get(label));
  const chartdata2 = {
    labels: labels.map(String), 
    datasets: [
      {
        label: `Problem solved of ${user_id} `,
        data: data,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(0, 0, 0, 1)",
        borderWidth: 1,
      },
    ],
  };
   const pieData = {
 labels: [], 
    datasets: [
      {
        data: Array.from(verdictCounts.values()),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
  } as const;

  return (
    <div className="bg-slate-100 flex flex-col justify-center items-center py-10 space-y-6">

       <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200" style={{ width: '1000px', height: '500px' }}>
      <div className="w-full h-full">
        <Pie data={pieData} options={pieOptions} plugins={[ ChartDataLabels as Plugin<"pie">]} />
      </div>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200" style={{ width: '1000px', height: '500px' }}>
      <div className="w-full h-full">
        <Bar data={chartdata} />
      </div>
    </div>
  
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200" style={{ width: '1000px', height: '500px' }}>
      <div className="w-full h-full">
        <Bar data={chartdata2} />
      </div>
    </div>
  </div>
  
  );
};

export default Page;
