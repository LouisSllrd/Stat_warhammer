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
  Attacks: "12",
  CT: 2,
  Auto_hit: false,
  Strength: "8",
  PA: "-2",
  Damage: "2",
  Sustained_hit: false,
  Sustained_X: 1,
  Lethal_hit: false,
  Deva_wound: false,
  Modif_hit: 0,
  Modif_wound: 0,
  Blast: false,
  Melta: 0,
  Re_roll_hit1: false,
  Re_roll_hit: false,
  Re_roll_wound1: false,
  Re_roll_wound: false,
  Crit_on_X_to_hit: 6,
  Crit_on_X_to_wound: 6,

  // Défenseur
  Toughness: 4,
  Save: 3,
  Save_invu: false,
  Save_invu_X: 4,
  PV: 2,
  Nb_of_models: 10,
  Cover: false,
  Fnp: false,
  Fnp_X: 5,
  Halve_damage: false,
  Reduce_damage_1: false
};

const attackerFields = [
  "Attacks", "CT", "Auto_hit", "Strength", "PA", "Damage",
  "Sustained_hit", "Sustained_X", "Lethal_hit", "Deva_wound", 'Blast', 'Melta',
  "Modif_hit", "Modif_wound", "Re_roll_hit1",
  "Re_roll_hit", "Re_roll_wound1", "Re_roll_wound",
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
];

const defenderFields = [
  "Toughness", "Save", "Save_invu", "Save_invu_X",
  "PV", "Nb_of_models", "Cover", "Fnp", "Fnp_X", "Halve_damage", "Reduce_damage_1"
];

const fieldLabels = {
  Attacks: "Attaques",
  CT: "CC/CT",
  Auto_hit: "Touches auto",
  Strength: "Force",
  PA: "Pénétration d'armure (PA)",
  Damage: "Dégâts",
  Sustained_hit: "Touches soutenues",
  Sustained_X: "Touches soutenues X",
  Lethal_hit: "Touches fatales",
  Deva_wound: "Blessures dévastatrices",
  Blast: "Déflagration",
  Melta: "Melta X",
  Modif_hit: "Modificateur de touche",
  Modif_wound: "Modificateur de blessure",
  Re_roll_hit1: "Relance des touches de 1",
  Re_roll_hit: "Relance des touches",
  Re_roll_wound1: "Relance des blessures de 1",
  Re_roll_wound: "Relance des blessures",
  Crit_on_X_to_hit: "Critique sur X+ en touche",
  Crit_on_X_to_wound: "Critique sur X+ en blessure",

  Toughness: "Endurance",
  Save: "Sauvegarde d'armure",
  Save_invu: "Sauvegarde invulnérable",
  Save_invu_X: "Invulnérable à X+",
  PV: "PV par figurine",
  Nb_of_models: "Nombre de figurines",
  Cover: "Couvert",
  Fnp: "Insensible à la douleur (FNP)",
  Fnp_X: "FNP à X+",
  Halve_damage: "Divise les dégâts par 2",
  Reduce_damage_1: "Réduit les dégâts de 1"
};


function Simulateur() {
  const [params, setParams] = useState(defaultParams);
  /*const { params, setParams } = useContext(ProfilesContext);*/

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    let val = type === "checkbox" ? checked : value;
  
    // Convertir les valeurs select en nombre
    if (
      ["Save", "Save_invu_X", "Strength", "PA", "Melta", "Modif_hit", "Modif_wound",
        "Crit_on_X_to_hit", "Crit_on_X_to_wound", "Toughness", "Fnp_X"
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
        typeof defaultParams[key] === "number"
      ) {
        parsedParams[key] = Number(parsedParams[key]);
      }
    });
    parsedParams.PA = String(parsedParams.PA);
    parsedParams.Damage = String(parsedParams.Damage);
    parsedParams.Strength = String(parsedParams.Strength);
    parsedParams.Attacks = String(parsedParams.Attacks);

    console.log("Valeur de PA envoyée :", parsedParams.PA); 
    console.log("Valeur de strength envoyée :", parsedParams.Strength); 

    try {
      /*const res = await axios.post(
        "https://statwarhammer-production.up.railway.app/simulate",
        parsedParams
      );*/
      
      const res = await axios.post("http://localhost:8000/simulate", parsedParams);
      setResult(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation :", error);
    }
    setLoading(false);
  };

  // Options des différents champs
  const optionsMap = {
    CT: [2,3,4,5,6],
    Strength: Array.from({ length: 24 }, (_, i) => i + 1),               // 1 à 24
    PA: [0, -1, -2, -3, -4, -5],                                       // 0 à -5
    Melta: [0,1,2,3,4,5,6],                                           // 0 à 6
    Modif_hit: [-2, -1, 0, 1, 2],                                      // -2 à +2
    Modif_wound: [-2, -1, 0, 1, 2],                                    // -2 à +2
    Crit_on_X_to_hit: [2, 3, 4, 5, 6],                                 // 2+ à 6+
    Crit_on_X_to_wound: [2, 3, 4, 5, 6],                               // 2+ à 6+
    Toughness: Array.from({ length: 14 }, (_, i) => i + 1),             // 1 à 14
    PV: Array.from({ length: 30 }, (_, i) => i + 1),
    Nb_of_models: Array.from({ length: 20 }, (_, i) => i + 1),
    Fnp_X: [4, 5, 6],                                                  // 4+ à 6+
  };

  // Fonction utilitaire pour afficher l'option textuel
  const optionLabel = (key, val) => {
    if (key === "PA") return val === 0 ? "0" : `${val}`;               // On laisse tel quel (ex: -1)
    if (
      key === "Modif_hit" || key === "Modif_wound"
    ) return val > 0 ? `+${val}` : `${val}`;
    if (
      key === "CT" ||
      key === "Crit_on_X_to_hit" ||
      key === "Crit_on_X_to_wound" ||
      key === "Fnp_X"
    ) return `${val}+`;
    return `${val}`;
  };

  const renderField = (key) => {
    const def = defaultParams[key];

    // Combo box pour Save et Save_invu_X (2+ à 7+)
    if (key === "Save" || key === "Save_invu_X") {
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
  
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Attaquant */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>⚔️ Attaquant</h3>
          {attackerFields.map(renderField)}
        </div>
  
        {/* Défenseur + bouton */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
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
          {result && (
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
                flex: 1,
                backgroundColor: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: "bold", color: "#2d3748" }}>
                📊 Résultats
              </h2>
              <p style={{ marginBottom: 4 }}>
                <strong>Unité de mesure :</strong> {result.unit_descr}
              </p>
              <p style={{ marginBottom: 4 }}>
                <strong>Moyenne :</strong> <strong>{result.mean.toFixed(1)}</strong> {result.unit}, soit{" "}
                {result.relative_damages.toFixed(0)}% de la force initiale
              </p>
              <p>
                <strong>Écart-type :</strong> {result.std.toFixed(1)}
              </p>

              {/* Graphiques */}
              <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                <div>
                  <h3 style={{ fontWeight: "bold", marginBottom: 12 }}>
                    Distribution
                  </h3>
                  <BarChart width={400} height={300} data={result.histogram_data}>
                    <XAxis
                      dataKey="value"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isTarget = payload.value === result.initial_force;
                        const color = isTarget
                          ? result.mean >= result.initial_force
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
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3182ce" />
                  </BarChart>
                </div>

                <div>
                  <h3 style={{ fontWeight: "bold", marginBottom: 12 }}>
                    Probabilité d'atteindre un seuil de dégâts
                  </h3>
                  <LineChart width={400} height={300} data={result.cumulative_data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis
                      dataKey="value"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isTarget = payload.value === result.initial_force;
                        const color = isTarget
                          ? result.mean >= result.initial_force
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
                    <Line
                      type="monotone"
                      dataKey="cumulative_percent"
                      stroke="#2b6cb0"
                    />
                  </LineChart>
                </div>
              </div>

              {/* Tableau */}
              {result.results_catalogue && (
                <div style={{ marginTop: 48 }}>
                  <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                    Comparaison avec unités classiques
                  </h3>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: 12,
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "#fefefe",
                    }}
                  >
                    <thead style={{ backgroundColor: "#ebf8ff" }}>
                      <tr>
                        <th style={cellStyle}>Unité</th>
                        <th style={cellStyle}>Moyenne</th>
                        <th style={cellStyle}>Écart-type</th>
                        <th style={cellStyle}>Force initiale</th>
                        <th style={cellStyle}>Dégâts relatifs à la force initiale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.results_catalogue).map(
                        ([unitName, stats]) => (
                          <tr key={unitName}>
                            <td style={cellStyle}>
                              {unitName}{" "}
                              {stats.unit ? `(en ${stats.unit})` : ""}
                            </td>
                            <td style={cellStyle}>{stats.mean.toFixed(1)}</td>
                            <td style={cellStyle}>{stats.std.toFixed(1)}</td>
                            <td style={cellStyle}>{stats.initial_force}</td>
                            <td style={cellStyle}>
                              {stats.relative_damages.toFixed(0)}%
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default Simulateur;
