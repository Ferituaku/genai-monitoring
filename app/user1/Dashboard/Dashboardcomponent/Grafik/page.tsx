"use client";

import React from "react";
import Tokenusage from "./tokenusage"; // Pastikan path impor sesuai dengan lokasi file Tokenusage
import Requestpertime from "./requestpertime";

const Test = () => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Token Usage</h1>
        <Tokenusage />
      </div>
      <div className="mt-6">
        <h1 className="text-xl font-bold">Request</h1>
        <Requestpertime />
      </div>
    </div>
  );
};

export default Test;
