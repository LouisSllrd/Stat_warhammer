import React, { useState, useEffect } from "react";
import Simulateur from "./components/Simulateur";
import Compare from "./components/Compare";
import MultiSimulateur from "./components/MultiSimulateur";
import Login from "./components/Login";
import MesListes from "./components/MesListes";
import { ProfilesProvider } from "./components/ProfileContext";

import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

function App() {
  const [page, setPage] = useState("simulateur");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Écoute la connexion/déconnexion Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingUser) return <p>Chargement utilisateur...</p>;

  return (
    <ProfilesProvider>
      <div>
        <nav style={{ marginBottom: 20 }}>
          <button onClick={() => setPage("simulateur")}>Simulation Mono Profile</button>
          <button onClick={() => setPage("multi-profiles")}>Simulation Multi Profiles</button>
          <button onClick={() => setPage("compare")}>Comparateur de profils</button>

          {/* Si user connecté, bouton déconnexion, sinon bouton connexion */}
          {user ? (
            <>
              <button onClick={() => setPage("mes-listes")}>Mes listes</button>
              <button onClick={() => signOut(auth)}>Déconnexion</button>
              <span style={{ marginLeft: 10 }}>Connecté : {user.email}</span>
            </>
          ) : (
            <button onClick={() => setPage("login")}>Connexion</button>
          )}
        </nav>

        {/* Contenu selon page choisie */}
        {page === "simulateur" && <Simulateur />}
        {page === "multi-profiles" && <MultiSimulateur />}
        {page === "compare" && <Compare />}
        {page === "login" && !user && <Login onLoginSuccess={() => setPage("simulateur")} />}
        {page === "mes-listes" && user && <MesListes user={user} />}
        {/* Si user non connecté et essaie d'accéder à mes-listes, on affiche un message */}
        {page === "mes-listes" && !user && (
          <p>Veuillez vous connecter pour accéder à vos listes.</p>
        )}
      </div>
    </ProfilesProvider>
  );
}

export default App;
