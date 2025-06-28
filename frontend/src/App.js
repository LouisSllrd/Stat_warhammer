import React, { useState, useEffect } from "react";
import Simulateur from "./components/Simulateur";
import Compare from "./components/Compare";
import MultiSimulateur from "./components/MultiSimulateur";
import Login from "./components/Login";
import MesListes from "./components/MesListes";
import { ProfilesProvider } from "./components/ProfileContext";
import SimulationEnJeu from "./components/Jeu";
import UnitesAdversesPage from "./components/ListeAdverse";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

function App() {
  const [page, setPage] = useState("simulateur");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
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
        {/* BARRE DE NAVIGATION */}
        <nav style={{ display: "flex", justifyContent: "space-between", background: "#eee", padding: "10px 20px" }}>
          
          {/* Groupe 1 : Préparer ma liste */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <strong>Préparer ma liste:</strong>{" "}
            <button onClick={() => setPage("simulateur")}>Unité Mono Profile</button>
            <button onClick={() => setPage("multi-profiles")}>Unité Multi Profiles</button>
            <button onClick={() => setPage("compare")}>Comparateur</button>
          </div>

          {/* Groupe 2 : Calculer en jeu */}
          {user && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <strong>Calculer en jeu:</strong>{" "}
              <button onClick={() => setPage("mes-listes")}>Mes Listes</button>
              <button onClick={() => setPage("unites-adverses")}>Unités Adverses</button>
              <button onClick={() => setPage("jeu")}>Calcul En Jeu</button>
            </div>
          )}

          {/* Groupe 3 : Connexion */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user ? (
              <>
                <strong>Connecté : {user.email}</strong>{" "}
                <button onClick={() => signOut(auth)}>Déconnexion</button>
              </>
            ) : (
              <button onClick={() => setPage("login")}>Connexion</button>
            )}
          </div>
        </nav>

        {/* CONTENU SELON PAGE */}
        <div style={{ padding: 20 }}>
          {page === "simulateur" && <Simulateur />}
          {page === "multi-profiles" && <MultiSimulateur />}
          {page === "compare" && <Compare />}
          {page === "login" && !user && <Login onLoginSuccess={() => setPage("simulateur")} />}
          {page === "mes-listes" && user && <MesListes user={user} />}
          {page === "unites-adverses" && user && <UnitesAdversesPage user={user} />}
          {page === "jeu" && user && <SimulationEnJeu user={user} />}
          {page === "mes-listes" && !user && (
            <p>Veuillez vous connecter pour accéder à vos listes.</p>
          )}
        </div>
      </div>
    </ProfilesProvider>
  );
}

export default App;
