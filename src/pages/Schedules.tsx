"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Schedules = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Schedules Management</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          This is where managers will create, manage, and publish shifts.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          Visual schedule builder and shift details will go here.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Schedules;