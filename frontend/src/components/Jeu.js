import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import AttackProfileCard from "./AttackProfileCard";
import DefenseProfileCard from "./DefenseProfileCard";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";


function SimulationEnJeu() {
  const [listes, setListes] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);
  const [selectedUniteNom, setSelectedUniteNom] = useState("");
  const [selectedUnite, setSelectedUnite] = useState(null);

  const [enemyUnitName, setEnemyUnitName] = useState("");
  const [enemyUnit, setEnemyUnit] = useState(null);

  // Nouveau state : params modifiables du défenseur
  const [defenderParams, setDefenderParams] = useState(null);
  const [defenderUnits, setDefenderUnits] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(null);


  const [visibleProfiles, setVisibleProfiles] = useState({});
const [selectedProfiles, setSelectedProfiles] = useState({});
const [visibleDefenseProfile, setVisibleDefenseProfile] = useState(false);

const [showFullResults, setShowFullResults] = useState(false);

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};


  const handleAttackProfileChange = (updatedProfile, index) => {
    // Mets à jour selectedUnite.profils[index] avec updatedProfile
    const updatedProfils = [...selectedUnite.profils];
    updatedProfils[index] = updatedProfile;
  
    setSelectedUnite({ ...selectedUnite, profils: updatedProfils });
  };
  // Charger les unités défenseurs depuis Firestore
  useEffect(() => {
    const q = query(collection(db, "unités_adverses")); // adapte le nom de la collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unitsFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDefenderUnits(unitsFromDb);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUnite) return;
  
    // On ne réinitialise que si le nombre de profils change
    setVisibleProfiles(prev => {
      // Si le nombre de profils est différent, réinitialiser
      if (Object.keys(prev).length !== selectedUnite.profils.length) {
        const initVisible = {};
        selectedUnite.profils.forEach((_, i) => {
          initVisible[i] = false; // caché par défaut
        });
        return initVisible;
      }
      return prev; // sinon garder l’état actuel
    });
  
    setSelectedProfiles(prev => {
      if (Object.keys(prev).length !== selectedUnite.profils.length) {
        const initSelected = {};
        selectedUnite.profils.forEach((_, i) => {
          initSelected[i] = true; // sélectionné par défaut
        });
        return initSelected;
      }
      return prev;
    });
  
  }, [selectedUnite]);
  
  

  // Lorsque enemyUnitName change, trouver l'unité dans la liste Firestore
  useEffect(() => {
    if (!enemyUnitName) {
      setEnemyUnit(null);
      setDefenderParams(null);
      return;
    }

    const unitFromDb = defenderUnits.find(u => u.nom === enemyUnitName);
    if (unitFromDb) {
      setEnemyUnit(unitFromDb);
      setDefenderParams(JSON.parse(JSON.stringify(unitFromDb))); // ou adapte selon la structure exacte
    } else {
      setEnemyUnit(null);
      setDefenderParams(null);
    }
  }, [enemyUnitName, defenderUnits]);
  

  const handleSubmit = async () => {
    setResults(null);
  
    try {
      setLoading(true);
      const profilsToSend = selectedUnite.profils.filter((_, i) => selectedProfiles[i]);
  
      const parsedAttackProfiles = profilsToSend.map((params) => {
        const parsedParams = { ...params };
        Object.keys(parsedParams).forEach((key) => {
          if (key !== "Attacks" && key !== "Strength" && key !== "PA" && key !== "Damage"&& key !== "Sustained_hit"&& key !== "CT"&& key !== "Re_roll_hit"&& key !== "Re_roll_wound") {
            parsedParams[key] = Number(parsedParams[key]);
          }
        });
        parsedParams.Sustained_hit = String(parsedParams.Sustained_hit);
        parsedParams.Re_roll_hit = String(parsedParams.Re_roll_hit);
        parsedParams.Re_roll_wound = String(parsedParams.Re_roll_wound);
        parsedParams.CT = String(parsedParams.CT);
        console.log("CT : ",parsedParams.CT)
        console.log("Re_roll_hit : ",parsedParams.Re_roll_hit)
        console.log("Sustained_hit : ",parsedParams.Sustained_hit)
        return parsedParams;
      });
  
      const parsedDefenderProfile = { ...defenderParams.profils[0] };
      Object.keys(parsedDefenderProfile).forEach((key) => {
        
        parsedDefenderProfile.Save_invu = String(parsedDefenderProfile.Save_invu)
        parsedDefenderProfile.Fnp = String(parsedDefenderProfile.Fnp)
        console.log("Fnp: ", parsedDefenderProfile.Fnp)
      });
  
      const res = await axios.post("http://localhost:8000/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });
  
      setResults(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la simulation multiple :", error);
      alert("Erreur lors de la simulation. Veuillez vérifier la console pour plus d'informations.");
    }
  };
  

  // Récupère les listes personnelles
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "listes"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // Charge une liste spécifique
  const fetchListe = async (id) => {
    const docRef = doc(db, "listes", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setSelectedListe({ id, ...data });
      setSelectedUniteNom("");
      setSelectedUnite(null);
    }
  };

  // Lors du choix d'une unité de la liste
  useEffect(() => {
    if (!selectedListe || !selectedUniteNom) return;
    const unit = selectedListe.unites.find((u) => u.nom === selectedUniteNom);
    setSelectedUnite(unit);
  }, [selectedUniteNom, selectedListe]);



  // Gestion des changements dans le formulaire défenseur
  const handleDefenderChange = (newProfile) => {
    setDefenderParams({ ...defenderParams, ...newProfile });
  };
  
  const Modal = ({ children, onClose }) => {
    return (
      <AnimatePresence>
      <motion.div
      key="modal-overlay"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration: 0.1,
        ease: "easeOut",
        type: "spring",
        stiffness: 70,
      }}
         style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 12,
          maxWidth: 800,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#999"
            }}
          >
            &times;
          </button>
          {children}
        </div>
        </motion.div>
      </AnimatePresence>
    );
  };
  

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
      background: "#DCFEFF",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Titre centré */}
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#2d3748", margin: 0 }}>
          Calculateur En Jeu
        </h1>
      </div>

      {/* Contenu en deux colonnes */}
      <div style={{  display: "flex", 
          gap: 40, 
          padding: "0 20px", }}>


      {/* Colonne gauche : Attaquant */}
      <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
        <h2 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>⚔️ Attaquant</h2>

        <label>Choisir une liste :</label>
        <select
          value={selectedListeId}
          onChange={(e) => {
            setSelectedListeId(e.target.value);
            fetchListe(e.target.value);
          }}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "16px",
            color: "#333",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px 16px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            maxWidth: "100%",
          }}
        >
          <option value="">-- Sélectionner --</option>
          {listes.map((liste) => (
            <option key={liste.id} value={liste.id}>
              {liste.nom}
            </option>
          ))}
        </select>

        <AnimatePresence mode="wait">
          {selectedListe && (
            <motion.div
              key="unit-select"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                type: "spring",
                stiffness: 70,
              }}
            >
            <br />
            <label>Choisir une unité :</label>
            <select
              value={selectedUniteNom}
              onChange={(e) => setSelectedUniteNom(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
                fontSize: "16px",
                color: "#333",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage:
                  "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "16px 16px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                maxWidth: "100%",
                marginBottom: "16px",

              }}
            >
              <option value="">-- Sélectionner une unité --</option>
              {selectedListe.unites.map((u, idx) => (
                <option key={idx} value={u.nom}>
                  {u.nom}
                </option>
              ))}
            </select>

            {selectedUnite && (
              <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                type: "spring",
                stiffness: 70,
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {selectedUnite.profils.map((profil, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 70,
                  }}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        onClick={() =>
                          setVisibleProfiles((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#2b6cb0",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        {visibleProfiles[i]
                          ? `Cacher ${profil.nom || `Profil ${i + 1}`}`
                          : `Afficher ${profil.nom || `Profil ${i + 1}`}`}
                      </button>

                      <label style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={selectedProfiles[i] || false}
                          onChange={(e) =>
                            setSelectedProfiles((prev) => ({
                              ...prev,
                              [i]: e.target.checked,
                            }))
                          }
                          style={{ transform: "scale(2)", marginRight: 8 }}
                        />
                        Inclure dans le calcul
                      </label>
                    </div>
                  </div>

                  {visibleProfiles[i] && (
                    <div style={{ marginTop: 8 }}>
                      <AttackProfileCard
                        profile={profil}
                        onChange={(updatedProfile) =>
                          handleAttackProfileChange(updatedProfile, i)
                        }
                      />
                    </div>
                  )}
                </motion.div>
              ))}

            </motion.div>
            
            )}
          </motion.div>
          )}
        </AnimatePresence>
      </div>

      
    {/* Colonne droite : Défenseur */}
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", gap: 16,
      backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
  <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>🛡️ Défenseur</h3>

  <label>Choisir une unité cible :</label>
  <select
    value={enemyUnitName}
    style={{
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      fontSize: "16px",
      color: "#333",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      backgroundImage:
        "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      backgroundSize: "16px 16px",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      maxWidth: "100%",
    }}
    onChange={(e) => setEnemyUnitName(e.target.value)}
  >
    <option value="">-- Sélectionner une cible --</option>
    {defenderUnits.map((unit) => (
      <option key={unit.id} value={unit.nom}>
        {unit.nom}
      </option>
    ))}
  </select>

  <AnimatePresence>
  {defenderParams && (
  <motion.div
  key="results-block"
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
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: 16,
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.04)",
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <button
      onClick={() => setVisibleDefenseProfile((prev) => !prev)}
      style={{
        padding: "8px 16px",
        backgroundColor: "#2b6cb0",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.3s",
        fontSize: 14,
        alignSelf: "flex-start",  
      }}
    >
      {visibleDefenseProfile ? "Cacher Profil Défensif" : "Afficher Profil Défensif"}
    </button>

    {visibleDefenseProfile && (
      <DefenseProfileCard
        profile={defenderParams.profils[0]}
        onChange={(newProfile) => {
          const newParams = { ...defenderParams };
          newParams.profils[0] = newProfile;
          setDefenderParams(newParams);
        }}
      />
    )}
    </motion.div>
)}
</AnimatePresence>

<div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
  <button onClick={handleSubmit} 
    style={{
      padding: "12px 20px",
      backgroundColor:"#2b6cb0",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontWeight: "bold",
      fontSize: 16,
      transition: "background-color 0.3s"
    }}>
    {loading ? "Simulation en cours..." : "🚀 Lancer la Simulation"}
  </button>

  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <input
      type="checkbox"
      checked={showFullResults}
      onChange={() => setShowFullResults(!showFullResults)}
    />
    Affichage complet
  </label>
</div>

</div>



      {/* Résultats */}
    
      {results && (
  <Modal onClose={() => setResults(null)}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: "bold" }}>📊 Résultats :</h2>
    </div>

    {/* Résumé */}
    <div style={{ marginBottom: 24 }}>
      <p>
        ➢ En moyenne : <strong>{results.mean.toFixed(1)}</strong> {"(±"} {results.std.toFixed(0)} {")"} {results.unit} , soit {results.relative_damages.toFixed(0)}% de la force initiale
      </p>
      <p>
        ➢ <strong style={{
          color:
            results.proba_unit_killed < 30 ? "red" :
            results.proba_unit_killed < 60 ? "orange" :
            results.proba_unit_killed < 80 ? "gold" :
            "green"
        }}>
          {results.proba_unit_killed.toFixed(0)}%
        </strong> {"de chance de tuer l'unité ennemie"} 
      </p>
    </div>
    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={showFullResults}
          onChange={() => setShowFullResults(!showFullResults)}
        />
        Affichage complet
      </label>

    {/* Affichage complet */}
    {showFullResults && (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        ➕ Détails supplémentaires
        </h3>
        <p>
          <strong>Unité de mesure :</strong> {results.unit_descr}
        </p>
        <p>
          <strong>Moyenne :</strong> <strong>{results.mean.toFixed(1)}</strong> {results.unit}
        </p>
        <p>
          <strong>Écart-type :</strong> {results.std.toFixed(1)}
        </p>

        {/* Graphiques */}
        <div style={{ display: "flex", gap: 32, marginTop: 24, flexWrap: "wrap" }}>
  
          {/* Distribution */}
          <div style={{ flex: "1 1 0", minWidth: 350 }}>
            <h4 style={{ fontWeight: "bold", marginBottom: 12 }}>
              Distribution
            </h4>
            <BarChart width={400} height={300} data={results.histogram_data}>
              <XAxis dataKey="value" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#3182ce" />
            </BarChart>
          </div>

          {/* Courbe cumulative */}
          <div style={{ flex: "1 1 0", minWidth: 350 }}>
            <h4 style={{ fontWeight: "bold", marginBottom: 12 }}>
              Probabilité d'atteindre un seuil
            </h4>
            <LineChart width={400} height={300} data={results.cumulative_data}>
              <CartesianGrid stroke="#ccc" />
              <XAxis
                      dataKey="value"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isTarget = payload.value === results.initial_force;
                        const color = isTarget
                          ? results.mean >= results.initial_force
                            ? "green"
                            : "red"
                          : "#666";
                        return (
                          <text
                            x={x}
                            y={y + 10}
                            textAnchor="middle"
                            fill={color}
                            fontWeight={isTarget ? "bold" : "normal"}
                          >
                            {payload.value}+
                          </text>
                        );
                      }}
                    />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative_percent" stroke="#2b6cb0" />
            </LineChart>
          </div>

        </div>


        {/* Tableau */}
        {results.results_catalogue && (
          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
              Comparaison avec unités classiques
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fefefe" }}>
              <thead style={{ backgroundColor: "#ebf8ff" }}>
                <tr>
                  <th style={cellStyle}>Unité</th>
                  <th style={cellStyle}>Moyenne</th>
                  <th style={cellStyle}>Écart-type</th>
                  <th style={cellStyle}>Force initiale</th>
                  <th style={cellStyle}>Dégâts relatifs</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.results_catalogue).map(([unitName, stats]) => (
                  <tr key={unitName}>
                    <td style={cellStyle}>{unitName} {stats.unit ? `(en ${stats.unit})` : ""}</td>
                    <td style={cellStyle}>{stats.mean.toFixed(1)}</td>
                    <td style={cellStyle}>{stats.std.toFixed(1)}</td>
                    <td style={cellStyle}>{stats.initial_force}</td>
                            <td style={cellStyle}>
                            <strong style={{
                              color:
                              stats.relative_damages < 30 ? "red" :
                              stats.relative_damages < 60 ? "orange" :
                              stats.relative_damages < 80 ? "gold" :
                                "green"
                            }}>{stats.relative_damages.toFixed(0)}% </strong>
                            </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </Modal>
)}


      
      </div>
    </div>
  );
}

export default SimulationEnJeu;
