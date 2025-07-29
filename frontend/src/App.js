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

import SimulationDatasheets from "./components/SimulationDatasheets";
import SimulationDatasheetsMobile from "./components_mobile/SimulationDatasheetsMobile";

import Accueil from "./components/Accueil";
import AccueilMobile from "./components_mobile/AccueilMobile";

import Login from "./components/Login";

import { ProfilesProvider } from "./components/ProfileContext";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useIsMobile } from "./hooks/useIsMobile";

import { motion, AnimatePresence } from "framer-motion";

import "./i18n";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState("accueil");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false); // <- état pour ouvrir/fermer le menu mobile
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
const [hasShownWelcome, setHasShownWelcome] = useState(false);

const { i18n } = useTranslation();

const toggleLang = () => {
  i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
};


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
  

  if (loadingUser) return <p>{t("app.loading.user")}</p>;

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
          <button onClick={() => setPage("accueil")}>{t("app.nav.accueil")}</button>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <strong>{t("app.nav.simulations_generiques")}</strong>
                <button onClick={() => setPage("simulateur")}>{t("app.nav.simulateur")}</button>
                <button onClick={() => setPage("multi-profiles")}>{t("app.nav.multi")}</button>
                <button onClick={() => setPage("compare")}>{t("app.nav.compare")}</button>
                <button onClick={() => setPage("simulateur-datasheets")}>{t("app.nav.datasheets")}</button>
              </div>

              {user && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong>{t("app.nav.simulations_perso")}</strong>
                  <button onClick={() => setPage("mes-listes")}>{t("app.nav.mes_listes")}</button>
                  <button onClick={() => setPage("unites-adverses")}>{t("app.nav.adversaires")}</button>
                  <button onClick={() => setPage("jeu")}>{t("app.nav.jeu")}</button>
                </div>
              )}
            </>
          )}

          {/* Connexion / Déconnexion */}
            {!isMobile && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {user ? (
                  <>
                    <strong>{t("app.nav.connecte_en_tant_que")} {user.email}</strong>
                    <button onClick={() => signOut(auth)}>{t("app.nav.deconnexion")}</button>
                  </>
                ) : (
                  <button onClick={() => setPage("login")}>{t("app.nav.connexion")}</button>
                )}
              </div>
            )}

            <button
            onClick={toggleLang}
            style={{
              marginLeft: 10,
              fontSize: "2rem",       // ↑ taille de la police
              padding: "8px 16px",      // ↑ taille du bouton
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor: "#89B5FF" 
            }}
          >
            {i18n.language === "fr" ? "🇬🇧" : "🇫🇷"}
          </button>

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
                    {t("app.nav.accueil")}
                  </button>

                <strong style={{ marginBottom: 12, fontSize: 18, borderBottom: "2px solid #5577cc", paddingBottom: 4 }}>
                  {t("app.nav.simulations_generiques")}
                </strong>

                {["simulateur", "multi-profiles", "compare", "simulateur-datasheets"].map((page, idx) => {
                  const labels = {
                    simulateur: t("app.nav.simulateur"),
                    "multi-profiles": t("app.nav.multi"),
                    compare: t("app.nav.compare"),
                    "simulateur-datasheets": t("app.nav.datasheets"),
                    
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
                      {t("app.nav.simulations_perso")}
                    </strong>

                    {["mes-listes", "unites-adverses", "jeu"].map((page) => {
                      const labels = {
                        "mes-listes": t("app.nav.mes_listes"),
                        "unites-adverses": t("app.nav.adversaires"),
                        jeu: t("app.nav.jeu"),
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
  {t("app.nav.infos_connexion")}
</strong>

{user ? (
  <>
    <p style={{ marginBottom: 10 }}>{t("app.nav.connecte_en_tant_que")} <strong>{user.email}</strong></p>
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
      {t("app.nav.deconnexion")}
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
    {t("app.nav.connexion")}
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

      <h2>{t("app.welcome.title")}</h2>
      <p>
            <Trans 
        i18nKey="app.welcome.subtitle" 
        components={[<></>, <strong />]} 
      />
      </p>
      <p>
            <Trans 
        i18nKey="app.welcome.free" 
        components={[<></>, <strong />]} 
      />
      </p>
      <p>
            <Trans 
        i18nKey="app.welcome.donation_important" 
        components={[<></>, <strong />]} 
      />
      </p>

      <p>{t("app.welcome.support")}</p>

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
          {t("app.welcome.donate")}
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
          {t("app.welcome.continue")}
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
          {page === "simulateur-datasheets" && (isMobile ? <SimulationDatasheetsMobile /> : <SimulationDatasheets />)}
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
