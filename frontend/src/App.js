import React, { useState, useEffect } from "react";
import Simulateur from "./components/Simulateur";
import SimulateurMobile from "./components_mobile/SimulateurMobile";

import MultiSimulateur from "./components/MultiSimulateur";
import MultiSimulateurMobile from "./components_mobile/MultiSimulateurMobile";

import Compare from "./components/Compare";
import CompareMobile from "./components_mobile/CompareMobile";

import MesListes from "./components/MesListes";
import MesListesMobile from "./components_mobile/MesListesMobileV2";

import SimulationEnJeu from "./components/Jeu";
import SimulationEnJeuMobile from "./components_mobile/JeuMobile";

import UnitesAdversesPage from "./components/ListeAdverse";
import UnitesAdversesPageMobile from "./components_mobile/ListeAdverseMobile";

import SimulationDatasheets from "./components/SimulationDatasheets"

import Accueil from "./components/Accueil";
import AccueilMobile from "./components_mobile/AccueilMobile";

import Login from "./components/Login";

import { ProfilesProvider } from "./components/ProfileContext";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useIsMobile } from "./hooks/useIsMobile";

import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [page, setPage] = useState("accueil");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false); // <- état pour ouvrir/fermer le menu mobile
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
const [hasShownWelcome, setHasShownWelcome] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
  
      // Affiche le message uniquement une fois par session après connexion
      if (currentUser && !hasShownWelcome) {
        setShowWelcomeModal(true);
        setHasShownWelcome(true);
      }
    });
    return () => unsubscribe();
  }, [hasShownWelcome]);
  

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
            position: "sticky" ,  // ← position sticky uniquement sur desktop
            top: 0,
            zIndex: 1000, // ← pour que ça reste au-dessus du contenu
          }}
        >


          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {/* BOUTON MENU MOBILE À GAUCHE */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  fontSize: 34,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginRight: 10,
                }}
              >
                ☰
              </button>

              {/* TITRE CENTRÉ */}
              <div style={{
                flex: 1,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 18,
                color: "#1a202c"
              }}>
                StatWarhammer40k
              </div>
            </div>
          ) : (

            <>
              {/* NAVIGATION CLASSIQUE */}
          <button onClick={() => setPage("accueil")}>Accueil</button>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <strong>Simulations génériques:</strong>
                <button onClick={() => setPage("simulateur")}>Unité Mono Profil</button>
                <button onClick={() => setPage("multi-profiles")}>Unité Multi Profils</button>
                <button onClick={() => setPage("compare")}>Comparateur</button>
                {/*<button onClick={() => setPage("simulateur-datasheets")}>Simulateur datasheets</button>*/}
              </div>

              {user && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong>Simulations personnalisées :</strong>
                  <button onClick={() => setPage("mes-listes")}>Mes Listes</button>
                  <button onClick={() => setPage("unites-adverses")}>Unités Adverses</button>
                  <button onClick={() => setPage("jeu")}>Calcul En Jeu</button>
                </div>
              )}
            </>
          )}

          {/* Connexion / Déconnexion */}
            {!isMobile && (
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
            )}

        </nav>
        <AnimatePresence>
        {isMobile && menuOpen && (
              <motion.div
              key="result-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                type: "spring",
                stiffness: 70,
              }}
              style={{
                position: "fixed", // ← pour qu'il flotte
                top: 60, // ← ajusté à la hauteur du bandeau sticky (si padding + hauteur ≈ 60px)
                left: 10,
                zIndex: 999, // ← inférieur ou égal à celui du bandeau
                display: "flex",
                flexDirection: "column",
                padding: 20,
                background: "#DDEBFF",
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                width: "80vw",
                maxWidth: 300,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                color: "#1a202c",
              }}
              
              >
                {/* Accueil */}
                  <button
                    onClick={() => {
                      setPage("accueil");
                      setMenuOpen(false);
                    }}
                    style={{
                      padding: "10px 15px",
                      marginBottom: 20,
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#4a90e2",
                      color: "white",
                      fontWeight: "600",
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#357ABD")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4a90e2")}
                  >
                    Accueil
                  </button>

                <strong style={{ marginBottom: 12, fontSize: 18, borderBottom: "2px solid #5577cc", paddingBottom: 4 }}>
                  Simulations génériques :
                </strong>

                {["simulateur", "multi-profiles", "compare"].map((page, idx) => {
                  const labels = {
                    simulateur: "Unité Mono Profil",
                    "multi-profiles": "Unité Multi Profils",
                    compare: "Comparateur",
                  };
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setPage(page);
                        setMenuOpen(false);
                      }}
                      style={{
                        padding: "10px 15px",
                        marginBottom: 10,
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#357ABD")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#4a90e2")}
                    >
                      {labels[page]}
                    </button>
                  );
                })}

                {user && (
                  <>
                    <strong
                      style={{
                        marginTop: 20,
                        marginBottom: 12,
                        fontSize: 18,
                        borderBottom: "2px solid #5577cc",
                        paddingBottom: 4,
                      }}
                    >
                      Simulations personnalisées :
                    </strong>

                    {["mes-listes", "unites-adverses", "jeu"].map((page) => {
                      const labels = {
                        "mes-listes": "Mes Listes",
                        "unites-adverses": "Unités Adverses",
                        jeu: "Calcul En Jeu",
                      };
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setPage(page);
                            setMenuOpen(false);
                          }}
                          style={{
                            padding: "10px 15px",
                            marginBottom: 10,
                            borderRadius: 6,
                            border: "none",
                            backgroundColor: "#4a90e2",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#357ABD")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#4a90e2")}
                        >
                          {labels[page]}
                        </button>
                      );
                    })}
                  </>
                )}
                {/* Connexion */}
<strong
  style={{
    marginTop: 20,
    marginBottom: 12,
    fontSize: 18,
    borderBottom: "2px solid #5577cc",
    paddingBottom: 4,
  }}
>
  Informations de connexion :
</strong>

{user ? (
  <>
    <p style={{ marginBottom: 10 }}>Connecté : <strong>{user.email}</strong></p>
    <button
      onClick={() => {
        signOut(auth);
        setMenuOpen(false);
      }}
      style={{
        padding: "10px 15px",
        marginBottom: 10,
        borderRadius: 6,
        border: "none",
        backgroundColor: "#e53e3e",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c53030")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e53e3e")}
    >
      Déconnexion
    </button>
  </>
) : (
  <button
    onClick={() => {
      setPage("login");
      setMenuOpen(false);
    }}
    style={{
      padding: "10px 15px",
      marginBottom: 10,
      borderRadius: 6,
      border: "none",
      backgroundColor: "#38a169",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2f855a")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#38a169")}
  >
    Connexion
  </button>
)}

              </motion.div>
            )}
          </AnimatePresence>


          {showWelcomeModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        maxWidth: 400,
        position: "relative",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        textAlign: "center",
      }}
    >
      {/* Bouton de fermeture en haut */}
      <button
        onClick={() => setShowWelcomeModal(false)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          border: "none",
          background: "transparent",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h2>Bienvenue !</h2>
      <p>Merci de t'être connecté sur <strong>StatWarhammer40k</strong> !</p>
      <p>⚠️ Ce site est entièrement <strong>gratuit</strong>, mais son hébergement a un coût pour son développeur.</p>
      <p>Ce projet <strong>ne peut vivre sans des dons</strong> de la communauté, et sera forcé de fermer sans un soutien régulier.</p>
      <p>Si tu veux soutenir le projet, tu peux faire un don ! </p>

      {/* Boutons côte à côte */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 10 }}>
        <a
          href="https://ko-fi.com/statwargame40k"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 20px",
            backgroundColor: "#89B5FF",
            color: "white",
            borderRadius: 5,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Faire un don
        </a>
        <button
          onClick={() => setShowWelcomeModal(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e0e0e0",
            color: "#333",
            border: "none",
            borderRadius: 5,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Continuer vers le site 
        </button>
      </div>
    </div>
  </div>
)}


        {/* CONTENU */}
        <div style={{ padding: 20 }}>
          {page === "accueil" && (isMobile ? <AccueilMobile /> : <Accueil />)}
          {page === "simulateur" && (isMobile ? <SimulateurMobile /> : <Simulateur />)}
          {page === "multi-profiles" && (isMobile ? <MultiSimulateurMobile /> : <MultiSimulateur />)}
          {page === "compare" && (isMobile ? <CompareMobile /> : <Compare />)}
          {/*{page === "simulateur-datasheets" && (isMobile ? <SimulationDatasheets /> : <SimulationDatasheets />)}*/}
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
