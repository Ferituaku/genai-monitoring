"use client";

import React from "react";

const ApiKeys = () => {
  return (
    <div className="flex fixed flex-col ml-60 pt-32 min-h-screen">
      {/* Card Section */}
      <div className="w-full p-6 bg-gradient-to-b from-slate-900 to-slate-700 rounded-2xl shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Generate Prompt Tokens
          </h2>
        </div>
      </div>

      {/* Button Section */}
      <button className="mt-6 px-6 py-2 left-0 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md">
        Generate Tokens
      </button>
    </div>
  );
};

export default ApiKeys;
