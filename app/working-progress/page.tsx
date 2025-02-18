import { Loader2 } from "lucide-react";

export default async function WorkingProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 ">Website Under Construction</h1>
      <Loader2 className="animate-spin h-12 w-12 mb-4 text-blue-500" />
      <p className="text-xl mb-2 text-gray-600">
        We're working hard to bring you something amazing!
      </p>
      <p className="text-lg text-gray-500">Please check back soon.</p>
    </div>
  );
}
