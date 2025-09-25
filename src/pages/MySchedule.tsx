"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const MySchedule = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">My Personal Schedule</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Employees will view their assigned shifts on a calendar here.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          This will be a clean and simple calendar view.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default MySchedule;