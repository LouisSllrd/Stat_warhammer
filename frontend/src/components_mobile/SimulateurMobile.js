import React, { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

/*import { useContext } from "react";
import { ProfilesContext } from "./ProfileContext";*/

const defaultParams = {
  // Attaquant
  Nb_weapons: 1,
  Attacks: "12",
  CT: "2",
  Strength: "8",
  PA: "-2",
  Damage: "2",
  Sustained_hit: "N/A",
  Lethal_hit: false,
  Deva_wound: false,
  Modif_hit_att: 0,
  Modif_wound_att: 0,
  Blast: false,
  Melta: 0,
  Re_roll_hit: "N/A",
  Re_roll_wound: "N/A",
  Crit_on_X_to_hit: 6,
  Crit_on_X_to_wound: 6,

  // Défenseur
  Toughness: 4,
  Save: 3,
  Save_invu: "N/A",
  PV: 2,
  Nb_of_models: 10,
  Cover: false,
  Fnp: "N/A",
  Modif_hit_def: 0,
  Modif_wound_def: 0,
  Halve_damage: false,
  Reduce_damage_1: false
};

const attackerFields = [
  "Nb_weapons","Attacks", "CT", "Strength", "PA", "Damage",
  "Sustained_hit", "Lethal_hit", "Deva_wound", 'Blast', 'Melta',
  "Modif_hit_att", "Modif_wound_att",
  "Re_roll_hit", "Re_roll_wound",
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
];

const defenderFields = [
  "Toughness", "Save", "Save_invu",
  "PV", "Nb_of_models", "Cover", "Fnp","Modif_hit_def", "Modif_wound_def", "Halve_damage", "Reduce_damage_1"
];

const fieldLabels = {
  Nb_weapons: "Nombre d'armes",
  Attacks: "Attaques",
  CT: "CC/CT",
  Strength: "Force",
  PA: "Pénétration d'armure (PA)",
  Damage: "Dégâts",
  Sustained_hit: "Touches soutenues",
  Lethal_hit: "Touches fatales",
  Deva_wound: "Blessures dévastatrices",
  Blast: "Déflagration",
  Melta: "Melta X",
  Modif_hit_att: "Modificateur de touche",
  Modif_wound_att: "Modificateur de blessure",
  Re_roll_hit: "Relance des touches",
  Re_roll_wound: "Relance des blessures",
  Crit_on_X_to_hit: "Critique sur X+ en touche",
  Crit_on_X_to_wound: "Critique sur X+ en blessure",

  Toughness: "Endurance",
  Save: "Sauvegarde d'armure",
  Save_invu: "Sauvegarde invulnérable",
  PV: "PV par figurine",
  Nb_of_models: "Nombre de figurines",
  Cover: "Couvert",
  Fnp: "Insensible à la douleur (FNP)",
  Modif_hit_def: "Modificateur de touche",
  Modif_wound_def: "Modificateur de blessure",
  Halve_damage: "Divise les dégâts par 2",
  Reduce_damage_1: "Réduit les dégâts de 1"
};


function SimulateurMobile() {
  const [params, setParams] = useState(defaultParams);
  /*const { params, setParams } = useContext(ProfilesContext);*/

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

const [showFullResults, setShowFullResults] = useState(false);

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    let val = type === "checkbox" ? checked : value;
  
    // Convertir les valeurs select en nombre
    if (
      ["Save", "Strength", "PA", "Melta", "Modif_hit_att", "Modif_wound_att",
        "Crit_on_X_to_hit", "Crit_on_X_to_wound", "Toughness", "Modif_hit_def", "Modif_wound_def",
      ].includes(name)
    ) {
      val = Number(val);
    }
  
    setParams({ ...params, [name]: val });
  };
  
  

  const handleSubmit = async () => {
    setLoading(true);
    const parsedParams = { ...params };
    

    Object.keys(parsedParams).forEach((key) => {
      if (
        key !== "Attacks" &&
        key !== "Strength" &&
        key !== "PA" &&
        key !== "Damage" &&
        key !== "Sustained_hit" &&
        key !== "CT" &&
        key !== "Re_roll_hit" &&
        key !== "Re_roll_wound" &&
        key !== "Save_invu" &&
        key !== "Fnp" &&
        typeof defaultParams[key] === "number"
      ) {
        parsedParams[key] = Number(parsedParams[key]);
      }
    });
    parsedParams.PA = String(parsedParams.PA);
    parsedParams.Damage = String(parsedParams.Damage);
    parsedParams.Strength = String(parsedParams.Strength);
    parsedParams.Attacks = String(parsedParams.Attacks);
    parsedParams.Sustained_hit = String(parsedParams.Sustained_hit);
    parsedParams.CT = String(parsedParams.CT);
    parsedParams.Re_roll_hit = String(parsedParams.Re_roll_hit);
    parsedParams.Re_roll_wound = String(parsedParams.Re_roll_wound);
    parsedParams.Save_invu = String(parsedParams.Save_invu);
    parsedParams.Fnp = String(parsedParams.Fnp);

    console.log("FNP : ",parsedParams.Fnp )

    try {
      /*const res = await axios.post(
        "https://statwarhammer-production.up.railway.app/simulate",
        parsedParams
      );*/
      
      const res = await axios.post("https://statwarhammer-production-871f.up.railway.app/simulate", parsedParams);
      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation :", error);
    }
    setLoading(false);
  };

  // Options des différents champs
  const optionsMap = {
    Nb_weapons: Array.from({ length: 20 }, (_, i) => i + 1),
    CT: ["Torrent","2","3","4","5","6"],
    Strength: Array.from({ length: 24 }, (_, i) => i + 1),               // 1 à 24
    PA: [0, -1, -2, -3, -4, -5],                                       // 0 à -5
    Sustained_hit: ["N/A", "1", "2", "3", "D3", "D6"],
    Melta: [0,1,2,3,4,5,6],                                           // 0 à 6
    Re_roll_hit: ["N/A", "Relance des 1", "Relance des touches ratées", "Relance des touches non critiques (pêcher)" ],
    Re_roll_wound: ["N/A", "Relance des 1", "Relance des blessures ratées", "Relance des blessures non critiques (pêcher)" ],
    Modif_hit_att: [0, 1, 2],                                      
    Modif_wound_att: [0, 1],                                  
    Crit_on_X_to_hit: [2, 3, 4, 5, 6],                                 // 2+ à 6+
    Crit_on_X_to_wound: [2, 3, 4, 5, 6],                               // 2+ à 6+
    Toughness: Array.from({ length: 14 }, (_, i) => i + 1),             // 1 à 14
    PV: Array.from({ length: 30 }, (_, i) => i + 1),
    Nb_of_models: Array.from({ length: 20 }, (_, i) => i + 1),
    Fnp: ["N/A", "4", "5", "6"],                                                  // 4+ à 6+
    Modif_hit_def: [0, -1, -2],                                      
    Modif_wound_def: [0, -1],                                  
    Save_invu: ["N/A", "2", "3", "4", "5", "6"]
  };

  // Fonction utilitaire pour afficher l'option textuel
  const optionLabel = (key, val) => {
    if (key === "PA") return val === 0 ? "0" : `${val}`;               // On laisse tel quel (ex: -1)
    if (
      key === "Modif_hit_att" || key === "Modif_wound_att" || key === "Modif_hit_def" || key === "Modif_wound_def"
    ) return val > 0 ? `+${val}` : `${val}`;
    if (
      key === "CT" && val != "Torrent" ||
      key === "Crit_on_X_to_hit" ||
      key === "Crit_on_X_to_wound" ||
      key === "Save_invu" && val != "N/A" ||
      key === "Fnp" && val != "N/A"
    ) return `${val}+`;
    return `${val}`;
  };

  const renderField = (key) => {
    const def = defaultParams[key];

    // Combo box pour Save (2+ à 7+)
    if (key === "Save" ) {
      const saveOptions = [2, 3, 4, 5, 6, 7];
      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <select
            name={key}
            value={params[key]}
            onChange={handleChange}
            style={{ border: "1px solid #ccc", padding: 6, borderRadius: 4, width: "100%" }}
          >
            {saveOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}+
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Combo box pour les champs définis dans optionsMap
    if (Object.keys(optionsMap).includes(key)) {
      const opts = optionsMap[key];
      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <select
            name={key}
            value={params[key]}
            onChange={handleChange}
            style={{ border: "1px solid #ccc", padding: 6, borderRadius: 4, width: "100%" }}
          >
            {opts.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(key, opt)}
              </option>
            ))}
          </select>
        </div>
      );
    }
    // Checkbox pour les booléens
    if (typeof def === "boolean") {
      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <input
            type="checkbox"
            name={key}
            checked={params[key]}
            onChange={handleChange}
          />
        </div>
      );
    }

    // Input texte par défaut
    return (
      <div key={key} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
          {fieldLabels[key] || key.replaceAll("_", " ")}
        </label>
        <input
          type="text"
          name={key}
          value={params[key]}
          onChange={handleChange}
          style={{
            border: "1px solid #ccc",
            padding: 6,
            borderRadius: 4,
            width: "100%"
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: 32, fontFamily: "Segoe UI, sans-serif", background: "#DCFEFF", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center", color: "#2d3748" }}>
        Simulateur Mono-Profil
      </h1>
  
      <div
  style={{
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "center",
  }}
>

        {/* Attaquant */}
        <div
  style={{
    flex: "1 1 320px",
    minWidth: 300,
    maxWidth: 600,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>

          <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>⚔️ Attaquant</h3>
          {attackerFields.map(renderField)}
        </div>
  
        {/* Défenseur + bouton */}
        <div
  style={{
    flex: "1 1 320px",
    minWidth: 300,
    maxWidth: 600,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>

          <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>🛡️ Défenseur</h3>
          {defenderFields.map(renderField)}
  
          {/* Bouton ici */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              backgroundColor: loading ? "#a0aec0" : "#2b6cb0",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: 16,
              transition: "background-color 0.3s"
            }}
          >
            {loading ? "Simulation en cours..." : "🚀 Lancer la Simulation"}
          </button>
        </div>
  
        {/* Résultats à droite avec animation */}
        <AnimatePresence>
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
            <button
              onClick={() => setShowFullResults(!showFullResults)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#3182ce",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {showFullResults ? "➖ Afficher Moins" : "➕ Afficher Plus"}
            </button>
        
        
            {/* Affichage complet */}
            {showFullResults && (
              <div>
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
        </AnimatePresence>

      </div>
    </div>
  );
}

export default SimulateurMobile;
