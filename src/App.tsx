import { useState } from "react";
import { Button } from "@/components/ui/button"; // ShadCN Button
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎉 Vite + React + Tailwind + ShadCN</h1>

      <div className="space-y-4 text-center">
        <p className="text-lg">Current Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Edit <code>src/App.tsx</code> to customize this page.
      </p>
    </div>
  );
}

export default App;
