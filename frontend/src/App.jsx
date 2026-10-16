import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("/api/v1/health/")
      .then((response) => response.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("unreachable"));
  }, []);

  return (
    <main>
      <h1>⚽ Football Team Manager</h1>
      <p>
        Backend status: <strong>{status}</strong>
      </p>
    </main>
  );
}

export default App;