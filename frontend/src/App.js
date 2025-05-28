import React, { useState } from "react";
import Simulateur from "./components/Simulateur";
import Compare from "./components/Compare";
import ReactDOM from "react-dom/client";
import { ProfilesProvider } from "./components/ProfileContext";

function App() {
  const [page, setPage] = useState("simulateur");

  return (
    
    <div>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("simulateur")}>Simulateur</button>
        <button onClick={() => setPage("compare")}>Comparateur</button>
      </nav>

      {page === "simulateur" && <Simulateur />}
      {page === "compare" && <Compare />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProfilesProvider>
      <App />
    </ProfilesProvider>
  </React.StrictMode>
);

export default App;
