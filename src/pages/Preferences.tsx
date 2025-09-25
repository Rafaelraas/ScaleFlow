"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Preferences = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">My Work Preferences</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Employees can submit their availability and preferences for future shifts here.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          A form for date ranges and preference types will be implemented.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Preferences;