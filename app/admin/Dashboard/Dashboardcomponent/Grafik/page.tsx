"use client";

import React, { useState } from "react";
import Tokenusage from "./tokenusage";  // Pastikan path impor sesuai dengan lokasi file Tokenusage

const test = () => {
  return (
    <div>
      <h1>Token Usage</h1>
      {<Tokenusage/>}
    </div>
  );
};

export default test;
