import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HomePage() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎉 Vite + React + Tailwind + ShadCN</h1>

      <div className="space-y-4 text-center">
        <p className="text-lg">Current Count: {count}</p>
        <div className="space-x-2">
          <Button onClick={() => setCount(count + 1)}>Increment</Button>
          <Button variant="outline" onClick={handleLoginClick}>
            Go to Login
          </Button>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Edit <code>src/App.tsx</code> to customize this page.
      </p>
    </div>
  );
}

export default HomePage;