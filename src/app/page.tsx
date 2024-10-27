"use client";
import axios, { AxiosError } from "axios";
import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import Router, { useRouter } from "next/navigation";
interface cheat_data  {
 contest_id: number,
}
const Page: FC = () => {
  const [inputvalue, setinputvalue] = useState<string>("");
   const router = useRouter();
 const [show, setshow] = useState(false)
   const handleinputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setinputvalue(e.target.value);
    setshow(false);
  };

  const HandleCheat = async () => {
    try {

    const stat =   await axios.post("/api/getconteststats/route", {
        userId: inputvalue,
      }); 
      if (stat.status === 400 || stat.status === 500) {
        setshow(true);
        return;
      }
      setshow(false);
     
     router.push(`/Dashboard/cheated?user_id=${inputvalue}`);

    } catch (error) {
      setshow(true);
      console.error("Error occurred:", error);
      if (error instanceof AxiosError) {
        setshow(true);
         console.log("data not added to database")
      }
    }
  };

  const HandleUser_details = async () => {
    try {
      await axios.post("/api/getconteststats/route", {
        userId: inputvalue,
      });
      router.push(`/Dashboard/user_details?user_id=${inputvalue}`);
    } catch (error) {
      console.error("Error occurred:", error);
      if (error instanceof AxiosError) {
         console.log("data not added to database")
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950 ">
      <div className="flex justify-center lg:m-0 m-5">
        <div className="bg-white w-80 h-80 mt-12 ml-6 rounded-lg shadow-md shadow-gray-400 hover:shadow-gray-800 ">
          <img
            className="w-12 mx-auto mb-4 mt-10"
            src="data:image/webp;base64,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"
            alt="Codeforces Logo"
          ></img>
          <h1 className="text-2xl text-center font-bold mt-8">
            Codeforces Visualizer
          </h1>
          <div className="mt-7 flex justify-center">
            <input
              type="text"
              value={inputvalue}
              onChange={handleinputChange}
              className=" border-2 border-black rounded-md focus:ring-blue-500 focus:outline-none"
              placeholder="Enter User Id"
            />
          </div>
         
          <div className="flex flex-row justify-evenly mt-10">
           
            <button
              onClick={HandleCheat}
              className="py-2 px-4 rounded-md bg-blue-500  hover:bg-blue-600 focus:outline-none "
            >
              Cheated?
            </button>
        
            <button
              onClick={HandleUser_details}
              className="py-2 px-4 rounded-md bg-blue-500  hover:bg-blue-600 focus:outline-none "
            >
              user_details
            </button>
           
          </div>
          {show && (
            <div className="mt-4 text-red-600 text-center">
              invalid user id
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Page;