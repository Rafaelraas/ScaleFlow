"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Employees = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Employee Management</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Managers can invite, edit, and remove employees here.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          List of employees and invitation forms will be implemented.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Employees;