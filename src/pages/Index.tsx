import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ScaleFlow!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your SaaS Shift Scheduling & Management Platform.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          Navigate using the sidebar or login to get started.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;