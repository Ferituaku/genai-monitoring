"use client";
import React from "react";

const Request = () => {
  return (
    <>
      <div className="pt-20 fixed ml-60 inline-flex items-center text-xs font-small text-left gap-3">
        <div className="relative ">
          <input
            type="text"
            id="default_outlined"
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
          />
          <label
            htmlFor="default_outlined"
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-70 top-2 z-10 origin-[0] peer-focus:bg-white peer-focus:dark:bg-gray-900 rounded-xl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >
            Search project name
          </label>
        </div>
        <input
          type="date"
          placeholder="Select Date"
          className="input input-bordered bg-gray-800 "
        />
      </div>
      <div className="flex min-h-screen bg-gray-900 mt-3 ">
        <div className="overflow-auto pt-32 lg:overflow-visible w-full">
          <table className="table w-full text-gray-400 left-60 table-pin-rows">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-left text-sm font-semibold">Name</th>
                <th className="p-3 text-left text-sm font-semibold">
                  Provider
                </th>
                <th className="p-3 text-left text-sm font-semibold">Model</th>
                <th className="p-3 text-left text-sm font-semibold">
                  Prompt Tokens
                </th>
                <th className="p-3 text-left text-sm font-semibold">
                  Total Tokens
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 1</td>
                <td className="p-3">Provider 1</td>
                <td className="p-3">Model 1</td>
                <td className="p-3">1000</td>
                <td className="p-3">5000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 2</td>
                <td className="p-3">Provider 2</td>
                <td className="p-3">Model 2</td>
                <td className="p-3">2000</td>
                <td className="p-3">8000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
              <tr className="bg-gray hover:bg-gray-700 transition-colors">
                <td className="p-3">Project 3</td>
                <td className="p-3">Provider 3</td>
                <td className="p-3">Model 3</td>
                <td className="p-3">3000</td>
                <td className="p-3">12000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Request;
