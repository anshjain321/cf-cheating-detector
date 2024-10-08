'use client'
import { FC, useState } from "react";
import { useSearchParams } from "next/navigation";

interface dataprops {
  contest_id: number;
  contest_name: string;
}

const Page: FC = () => {
  const [view, setView] = useState<boolean>(false);
  const handleView = () => {
    setView(!view);
  };

  const params = useSearchParams();
  const data = params?.get("data");
  const user_id = params?.get("user_id");
  const parsedData: dataprops[] = data ? JSON.parse(decodeURIComponent(data as string)) : [];

  return (
    <>
      <div className="bg-slate-900 min-h-screen flex justify-center items-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
          <p className="text-2xl text-center text-gray-800 font-semibold mb-4">
            {user_id} has cheated in {parsedData.length} contests
          </p>

          <button
            onClick={handleView}
            className="w-full px-4 py-3 mb-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {view ? 'Hide' : 'View'} Contest Details
          </button>

          {view && (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse rounded-lg shadow-lg bg-gray-100">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="p-3 text-left">Contest ID</th>
                    <th className="p-3 text-left">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map(({ contest_id }, index) => (
                    <tr key={contest_id} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
                      <td className="p-3">{contest_id}</td>
                      <td className="p-3">
                        <a
                          href={`https://codeforces.com/submissions/${user_id}/contest/${contest_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View contest
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
