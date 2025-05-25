import React, { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";

const defaultParams = {
  // Attaquant
  Attacks: "12",
  CT: 2,
  Strength: "8",
  PA: "2",
  Damage: "2",
  Sustained_hit: false,
  Sustained_X: 1,
  Lethal_hit: false,
  Deva_wound: false,
  Modif_hit: 0,
  Modif_wound: 0,
  Auto_hit: false,
  Re_roll_hit1: false,
  Re_roll_hit: false,
  Re_roll_wound1: false,
  Re_roll_wound: false,
  Crit_on_X_to_hit: 6,
  Crit_on_X_to_wound: 6,

  // Défenseur
  Toughness: 12,
  Save: 2,
  Save_invu: false,
  Save_invu_X: 4,
  PV: 16,
  Nb_of_models: 1,
  Cover: false,
  Fnp: false,
  Fnp_X: 5
};

const attackerFields = [
  "Attacks", "CT", "Strength", "PA", "Damage",
  "Sustained_hit", "Sustained_X", "Lethal_hit", "Deva_wound",
  "Modif_hit", "Modif_wound", "Auto_hit", "Re_roll_hit1",
  "Re_roll_hit", "Re_roll_wound1", "Re_roll_wound",
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
];

const defenderFields = [
  "Toughness", "Save", "Save_invu", "Save_invu_X",
  "PV", "Nb_of_models", "Cover", "Fnp", "Fnp_X"
];

const fieldLabels = {
  Attacks: "Attaques",
  CT: "CC/CT",
  Strength: "Force",
  PA: "Pénétration d'armure (PA)",
  Damage: "Dégâts",
  Sustained_hit: "Touches soutenus",
  Sustained_X: "Touches soutenus X",
  Lethal_hit: "Touches létales",
  Deva_wound: "Blessures dévastatrices",
  Modif_hit: "Modificateur de touche",
  Modif_wound: "Modificateur de blessure",
  Auto_hit: "Touches auto",
  Re_roll_hit1: "Relance des touches de 1",
  Re_roll_hit: "Relance des touches",
  Re_roll_wound1: "Relance des blessures de 1",
  Re_roll_wound: "Relance des blessures",
  Crit_on_X_to_hit: "Critique sur X+ en touche",
  Crit_on_X_to_wound: "Critique sur X+ en blessure",

  Toughness: "Endurance",
  Save: "Sauvegarde d'armure",
  Save_invu: "Sauvegarde invulnérable",
  Save_invu_X: "Invulnérable à X",
  PV: "PV par figurine",
  Nb_of_models: "Nombre de figurines",
  Cover: "Couvert",
  Fnp: "Insensible à la douleur (FNP)",
  Fnp_X: "FNP à X+"
};


function App() {
  const [params, setParams] = useState(defaultParams);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParams({ ...params, [name]: type === "checkbox" ? checked : value });
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

    try {
      const res = await axios.post(
        /*"https://statwarhammer-production.up.railway.app/simulate"*/"http://localhost:8001/simulate",
        parsedParams
      );
      
      /*const res = await axios.post("http://localhost:8000/simulate", parsedParams);*/
      setResult(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation :", error);
    }
    setLoading(false);
  };

  const renderField = (key) => {
    const def = defaultParams[key];
    return (
      <div key={key} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
          {fieldLabels[key] || key.replaceAll("_", " ")}
        </label>
        {typeof def === "boolean" ? (
          <input
            type="checkbox"
            name={key}
            checked={params[key]}
            onChange={handleChange}
          />
        ) : (
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
        )}
      </div>
    );
  };

  
  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>Simulateur de Dégâts Warhammer 40k</h1>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Attaquant */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontWeight: "bold" }}>Attaquant</h3>
          {attackerFields.map(renderField)}
        </div>

        {/* Défenseur + bouton */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontWeight: "bold" }}>Défenseur</h3>
          {defenderFields.map(renderField)}

          {/* Bouton ici */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: "10px 20px",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {loading ? "Simulation en cours..." : "Lancer la Simulation"}
          </button>
        </div>


        {/* Résultats à droite */}
        {result && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: "bold" }}>Résultats</h2>
            <p>Unité : {result.unit_descr}</p>
            <p>
              Moyenne : {result.mean.toFixed(2)} {result.unit} ,soit{" "}
              {result.relative_damages.toFixed(0)}% de la force initiale de l'unité cible
            </p>
            <p>Écart-type : {result.std.toFixed(2)}</p>

            {/* Graphiques côte à côte */}
            <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
              <div>
                <h3 style={{ fontWeight: "bold" }}>Distribution</h3>
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
                <h3 style={{ fontWeight: "bold" }}>Probabilité d'atteindre un seuil de dégâts</h3>
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
                          {payload.value}
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

            {/* Tableau en dessous */}
            {result.results_catalogue && (
              <div style={{ marginTop: 48 }}>
                <h3 style={{ fontWeight: "bold", fontSize: 18 }}>
                  Comparaison avec unités classiques
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th style={cellStyle}>Unité</th>
                      <th style={cellStyle}>Moyenne</th>
                      <th style={cellStyle}>Écart-type</th>
                      <th style={cellStyle}>Force initiale</th>
                      <th style={cellStyle}>Dégâts relatifs à la force initiale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.results_catalogue).map(([unitName, stats]) => (
                      <tr key={unitName}>
                        <td style={cellStyle}>{unitName} {stats.unit ? `(en ${stats.unit})` : ""}</td>
                        <td style={cellStyle}>{stats.mean.toFixed(2)}</td>
                        <td style={cellStyle}>{stats.std.toFixed(2)}</td>
                        <td style={cellStyle}>{stats.initial_force}</td>
                        <td style={cellStyle}>{stats.relative_damages.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
