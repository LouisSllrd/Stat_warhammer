import React, { useState, useEffect } from "react";
import Simulateur from "./components/Simulateur";
import SimulateurMobile from "./components_mobile/SimulateurMobile";

import MultiSimulateur from "./components/MultiSimulateur";
import MultiSimulateurMobile from "./components_mobile/MultiSimulateurMobile";

import Compare from "./components/Compare";
import CompareMobile from "./components_mobile/CompareMobile";

import MesListes from "./components/MesListes";
import MesListesMobile from "./components_mobile/MesListesMobile";

import SimulationEnJeu from "./components/Jeu";
import SimulationEnJeuMobile from "./components_mobile/JeuMobile";

import UnitesAdversesPage from "./components/ListeAdverse";
import UnitesAdversesPageMobile from "./components_mobile/ListeAdverseMobile";

import Accueil from "./components/Accueil";
import AccueilMobile from "./components_mobile/AccueilMobile";

import Login from "./components/Login";

import { ProfilesProvider } from "./components/ProfileContext";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useIsMobile } from "./hooks/useIsMobile";

function App() {
  const [page, setPage] = useState("accueil");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false); // <- état pour ouvrir/fermer le menu mobile

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
        {/* NAVIGATION */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#89B5FF",
            padding: "10px 20px",
            alignItems: "center",
          }}
        >
          <button onClick={() => setPage("accueil")}>Accueil</button>

          {isMobile ? (
            <>
              {/* BOUTON MENU MOBILE */}
              <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            </>
          ) : (
            <>
              {/* NAVIGATION CLASSIQUE */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <strong>Préparer ma liste:</strong>
                <button onClick={() => setPage("simulateur")}>Unité Mono Profil</button>
                <button onClick={() => setPage("multi-profiles")}>Unité Multi Profils</button>
                <button onClick={() => setPage("compare")}>Comparateur</button>
              </div>

              {user && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong>Calculer en jeu:</strong>
                  <button onClick={() => setPage("mes-listes")}>Mes Listes</button>
                  <button onClick={() => setPage("unites-adverses")}>Unités Adverses</button>
                  <button onClick={() => setPage("jeu")}>Calcul En Jeu</button>
                </div>
              )}
            </>
          )}

          {/* Connexion / Déconnexion */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user ? (
              <>
                <strong>Connecté : {user.email}</strong>
                <button onClick={() => signOut(auth)}>Déconnexion</button>
              </>
            ) : (
              <button onClick={() => setPage("login")}>Connexion</button>
            )}
          </div>
        </nav>

        {/* MENU MOBILE VERTICAL */}
        {isMobile && menuOpen && (
          <div style={{ display: "flex", flexDirection: "column", padding: 10, background: "#DDEBFF" }}>
            <strong>Préparer ma liste:</strong>
            <button onClick={() => { setPage("simulateur"); setMenuOpen(false); }}>Unité Mono Profil</button>
            <button onClick={() => { setPage("multi-profiles"); setMenuOpen(false); }}>Unité Multi Profils</button>
            <button onClick={() => { setPage("compare"); setMenuOpen(false); }}>Comparateur</button>

            {user && (
              <>
                <strong>Calculer en jeu:</strong>
                <button onClick={() => { setPage("mes-listes"); setMenuOpen(false); }}>Mes Listes</button>
                <button onClick={() => { setPage("unites-adverses"); setMenuOpen(false); }}>Unités Adverses</button>
                <button onClick={() => { setPage("jeu"); setMenuOpen(false); }}>Calcul En Jeu</button>
              </>
            )}
          </div>
        )}

        {/* CONTENU */}
        <div style={{ padding: 20 }}>
          {page === "accueil" && (isMobile ? <AccueilMobile /> : <Accueil />)}
          {page === "simulateur" && (isMobile ? <SimulateurMobile /> : <Simulateur />)}
          {page === "multi-profiles" && (isMobile ? <MultiSimulateurMobile /> : <MultiSimulateur />)}
          {page === "compare" && (isMobile ? <CompareMobile /> : <Compare />)}
          {page === "mes-listes" && user && (isMobile ? <MesListesMobile user={user} /> : <MesListes user={user} />)}
          {page === "unites-adverses" && user && (isMobile ? <UnitesAdversesPageMobile user={user} /> : <UnitesAdversesPage user={user} />)}
          {page === "jeu" && user && (isMobile ? <SimulationEnJeuMobile user={user} /> : <SimulationEnJeu user={user} />)}
          {page === "login" && !user && <Login onLoginSuccess={() => setPage("simulateur")} />}
        </div>
      </div>
    </ProfilesProvider>
  );
}


export default App;
