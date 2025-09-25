"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const SwapRequests = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Shift Swap Requests</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Employees can initiate and manage shift swap requests here.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          This page will show pending, approved, and denied swap requests.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SwapRequests;