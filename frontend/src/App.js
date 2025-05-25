import React, { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";

const defaultParams = {
  // Attaquant
  Attacks: "6",
  CT: 3,
  Strength: "4",
  PA: "0",
  Damage: "1",
  Sustained_hit: false,
  Sustained_X: 1,
  Lethal_hit: false,
  Deva_wound: false,
  Modif_hit: 0,
  Modif_wound: 0,
  Auto_hit: false,
  Re_roll_hit: false,
  Re_roll_wound: false,
  Crit_on_X_to_hit: 6,
  Crit_on_X_to_wound: 6,

  // Défenseur
  Toughness: 4,
  Save: 3,
  Save_invu: false,
  Save_invu_X: 4,
  PV: 1,
  Nb_of_models: 5,
  Cover: false,
  Fnp: false,
  Fnp_X: 5
};

const attackerFields = [
  "Attacks", "CT", "Strength", "PA", "Damage",
  "Sustained_hit", "Sustained_X", "Lethal_hit", "Deva_wound",
  "Modif_hit", "Modif_wound", "Auto_hit",
  "Re_roll_hit", "Re_roll_wound",
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
];

const defenderFields = [
  "Toughness", "Save", "Save_invu", "Save_invu_X",
  "PV", "Nb_of_models", "Cover", "Fnp", "Fnp_X"
];

function App() {
  const [params, setParams] = useState(defaultParams);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const res = await axios.post("http://statwarhammer-production.up.railway.app", parsedParams);
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
          {key.replaceAll("_", " ")}
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
            <p>Unité : {result.unit}</p>
            <p>Moyenne : {result.mean.toFixed(2)}</p>
            <p>Écart-type : {result.std.toFixed(2)}</p>

            <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
              <div>
                <h3 style={{ fontWeight: "bold" }}>Distribution</h3>
                <BarChart width={400} height={300} data={result.histogram_data}>
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#3182ce" />
                </BarChart>
              </div>

              <div>
                <h3 style={{ fontWeight: "bold" }}>Probabilité d'atteindre un seuil de dégâts</h3>
                <LineChart width={400} height={300} data={result.cumulative_data}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cumulative_percent" stroke="#2b6cb0" />
                </LineChart>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
