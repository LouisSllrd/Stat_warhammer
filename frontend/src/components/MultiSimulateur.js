import React, { useState } from "react";
import AttackProfileCard from "./AttackProfileCard";
import DefenderForm from "./DefenderForm";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const defaultAttackProfile = {
  Attacks: "12",
  CT: 2,
  Auto_hit: false,
  Strength: "8",
  PA: "2",
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
};

const defaultDefender = {
  Toughness: 12,
  Save: 2,
  Save_invu: false,
  Save_invu_X: 4,
  PV: 16,
  Nb_of_models: 1,
  Cover: false,
  Fnp: false,
  Fnp_X: 5,
  Halve_damage: false,
  Reduce_damage_1: false,
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

function MultiSimulateur() {
  const [numProfiles, setNumProfiles] = useState(2);
  const [attackProfiles, setAttackProfiles] = useState([
    { ...defaultAttackProfile },
    { ...defaultAttackProfile },
  ]);
  const [visibleProfiles, setVisibleProfiles] = useState(
    Array(numProfiles).fill(false)
  );
  
  const [defenderProfile, setDefenderProfile] = useState({ ...defaultDefender });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Met à jour un profil d'attaque à l'index donné
  const updateProfile = (index, newParams) => {
    setAttackProfiles((prev) => {
      const updated = [...prev];
      updated[index] = newParams;
      return updated;
    });
  };

  const toggleProfileVisibility = (index) => {
    setVisibleProfiles((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // Change le nombre de profils d'attaque et ajuste la liste en conséquence
  const handleNumProfilesChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumProfiles(count);
    setAttackProfiles((prev) => {
      const newProfiles = [...prev];
      while (newProfiles.length < count) {
        newProfiles.push({ ...defaultAttackProfile });
      }
      return newProfiles.slice(0, count);
    });

    
         
  
    // Met à jour aussi visibleProfiles
    setVisibleProfiles((prev) => {
      const newState = [...prev];
      while (newState.length < count) newState.push(false);
      return newState.slice(0, count);
    });
  };

  // Envoi la requête de simulation multiple
  const handleSubmit = async () => {
    setLoading(true);
    setResults(null);
  
    try {
      // Préparation des profils en parsant les champs numériques
      const parsedAttackProfiles = attackProfiles.map((params) => {
        const parsedParams = { ...params };
        Object.keys(parsedParams).forEach((key) => {
          if (
            key !== "Attacks" &&
            key !== "Strength" &&
            key !== "PA" &&
            key !== "Damage" &&
            typeof defaultAttackProfile[key] === "number"
          ) {
            parsedParams[key] = Number(parsedParams[key]);
          }
        });
        return parsedParams;
      });
  
      // Parse aussi le defenderProfile
      const parsedDefenderProfile = { ...defenderProfile };
      Object.keys(parsedDefenderProfile).forEach((key) => {
        if (
          typeof defaultDefender[key] === "number"
        ) {
          parsedDefenderProfile[key] = Number(parsedDefenderProfile[key]);
        }
      });
  
      const res = await axios.post("http://localhost:8000/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });
  
      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation multiple :", error);
      alert("Erreur lors de la simulation. Veuillez vérifier la console pour plus d'informations.");
    }
  
    setLoading(false);
  };
  

  return (
    <div style={{ padding: 24 }}>
      <h1>Simulateur Multi-Profils</h1>

      <label htmlFor="numProfiles">Nombre de profils d'attaque :</label>
      <select
        id="numProfiles"
        value={numProfiles}
        onChange={handleNumProfilesChange}
        style={{ marginLeft: 8 }}
      >
        {[1, 2, 3, 4, 5,6,7,8,9,10].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Profils d'attaque */}
        <div style={{ flex: 1, minWidth: 320 }}>
        <h2>Profils d'attaque</h2>
        {attackProfiles.map((profile, i) => (
            <div
            key={i}
            style={{
                border: "1px solid #ccc",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                backgroundColor: "#f9f9f9",
            }}
            >
            <button
                onClick={() => toggleProfileVisibility(i)}
                style={{
                marginBottom: 8,
                padding: "6px 12px",
                cursor: "pointer",
                backgroundColor: "#3182ce",
                color: "white",
                border: "none",
                borderRadius: 4,
                }}
            >
                {visibleProfiles[i] ? `Cacher Profil ${i + 1}` : `Afficher Profil ${i + 1}`}
            </button>
            {visibleProfiles[i] && (
                <AttackProfileCard
                index={i}
                profile={profile}
                onChange={(updatedProfile) => updateProfile(i, updatedProfile)}
                />
            )}
            </div>
        ))}
        </div>

        {/* Défenseur */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <h2>Défenseur</h2>
          <DefenderForm params={defenderProfile} setParams={setDefenderProfile} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 12, padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Calcul..." : "Lancer la Simulation"}
          </button>
        </div>

        {/* Résultats */}
        {results && (
          <div style={{ flex: 2, minWidth: 600 }}>
            <h2 style={{ fontSize: 22, fontWeight: "bold" }}>Résultats</h2>
            <p>Unité : {results.unit_descr}</p>
            <p>
              Moyenne : {results.mean.toFixed(1)} {results.unit}, soit{" "}
              {results.relative_damages.toFixed(0)}% de la force initiale de l'unité cible
            </p>
            <p>Écart-type : {results.std.toFixed(1)}</p>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 24,
                    marginTop: 24,
                    justifyContent: "center",
                    flexWrap: "nowrap", // Pour empêcher de passer à la ligne
                }}
                >
                <div style={{ flex: "1 1 0", maxWidth: 400 }}>
                    <h3 style={{ fontWeight: "bold" }}>Distribution</h3>
                    <BarChart
                    width={400}
                    height={300}
                    data={results.histogram_data}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                    <XAxis
                        dataKey="value"
                        tick={({ x, y, payload }) => {
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

                <div style={{ flex: "1 1 0", maxWidth: 400 }}>
                    <h3 style={{ fontWeight: "bold" }}>
                    Probabilité d'atteindre un seuil de dégâts
                    </h3>
                    <LineChart
                    width={400}
                    height={300}
                    data={results.cumulative_data}
                    margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                    >
                    <CartesianGrid stroke="#ccc" />
                    <XAxis
                        dataKey="value"
                        tick={({ x, y, payload }) => {
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


            {results.results_catalogue && (
              <div style={{ marginTop: 48 }}>
                <h3 style={{ fontWeight: "bold", fontSize: 18 }}>
                  Comparaison avec unités classiques
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 12,
                  }}
                >
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
                    {Object.entries(results.results_catalogue).map(([unitName, stats]) => (
                      <tr key={unitName}>
                        <td style={cellStyle}>
                          {unitName} {stats.unit ? `(en ${stats.unit})` : ""}
                        </td>
                        <td style={cellStyle}>{stats.mean.toFixed(1)}</td>
                        <td style={cellStyle}>{stats.std.toFixed(1)}</td>
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

export default MultiSimulateur;
