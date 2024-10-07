'use client'
import { FC } from "react";
import { useSearchParams } from "next/navigation";
interface dataprops {
  contest_id : number ,
  contest_name: string,
}
const page: FC = ()=>{
    const params= useSearchParams();
   const data = params?.get('data');
   const user_id = params?.get('user_id');
    const parsedData: dataprops[] = data ? JSON.parse(decodeURIComponent(data as string)):[]; 
    return (
       <>
   
       <div className="bg-slate-950 min-h-screen">
       <div className="flex justify-center items-center p-5">
          <table className="table-auto border-collapse bg-white rounded-xl w-64">
            <thead className="font-bold">
              <tr className="border-b border-gray-800">
                <th className="p-3">Contest ID</th>
                <th className="p-3">contest_name</th>
                <th className="p-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map(({contest_name, contest_id }) => (
                <tr key= "cheatedId" className="border-b border-gray-800">
                  <td className="p-3">{contest_id}</td>
                  <td className="p-3">{contest_name}</td>
                  <td className="p-3">
                    <a
                      href={`https://codeforces.com/submissions/${user_id}/contest/${contest_id}`}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      View contest
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>:<div></div>
        </div>
        </div>
      </>
    )   
}

export default page;