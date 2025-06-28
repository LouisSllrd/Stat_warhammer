import React, { useState } from "react";

/*import { useContext } from "react";
import { ProfilesContext } from "./ProfileContext";*/

import axios from "axios";

const defaultAttacker = {
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

const defender = {
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
  Reduce_damage_1: false
};

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
};

const attackerFields = Object.keys(defaultAttacker);

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const optionsMap = {
  CT: [2, 3, 4, 5, 6],
  Strength: Array.from({ length: 24 }, (_, i) => i + 1),
  PA: [0, -1, -2, -3, -4, -5],
  Melta: [0,1,2,3,4,5,6],                              
  Modif_hit: [-2, -1, 0, 1, 2],
  Modif_wound: [-2, -1, 0, 1, 2],
  Crit_on_X_to_hit: [2, 3, 4, 5, 6],
  Crit_on_X_to_wound: [2, 3, 4, 5, 6],
  Toughness: Array.from({ length: 14 }, (_, i) => i + 1),
  Fnp_X: [4, 5, 6],
};

/*const saveOptions = [2, 3, 4, 5, 6, 7];*/

// Fonction utilitaire pour formater l'affichage des options
const optionLabel = (key, val) => {
  if (key === "PA") return val === 0 ? "0" : `${val}`; // on laisse -1, -2 etc.
  if (key === "Modif_hit" || key === "Modif_wound") return val > 0 ? `+${val}` : `${val}`;
  if (["CT", "Crit_on_X_to_hit", "Crit_on_X_to_wound", "Fnp_X"].includes(key)) return `${val}+`;
  return `${val}`;
};

function Compare() {

    /*const { attacker1, setAttacker1, attacker2, setAttacker2 } = useContext(ProfilesContext);
    console.log("ProfilesContext values:", { attacker1, attacker2 });*/
  const [attacker1, setAttacker1] = useState(defaultAttacker);
  const [attacker2, setAttacker2] = useState(defaultAttacker);
  const [results, setResults] = useState(null);

  // Fonction de changement qui cible le bon attaquant
  const handleChange = (e, setAttacker, attacker) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Conversion numérique pour certains champs
    if (
      [
        "Save",
        "Save_invu_X",
        "Strength",
        "PA",
        "Modif_hit",
        "Modif_wound",
        "Crit_on_X_to_hit",
        "Crit_on_X_to_wound",
        "Toughness",
        "Fnp_X",
        "CT",
        "Crit_on_X_to_hit",
        "Crit_on_X_to_wound",
      ].includes(name)
    ) {
      val = Number(val);
    }

    setAttacker({ ...attacker, [name]: val });
  };

  // Fonction de rendu d'un champ
  const renderField = (key, attacker, setAttacker) => {
    const def = defaultAttacker[key];
    const value = attacker[key];

    // Save et Save_invu_X spécial, ici dans defender uniquement, on ne les affiche pas dans attaquant
    if (key === "Save" || key === "Save_invu_X") {
      return null; // on ne gère pas ici
    }

    // Combo box si options définies
    if (optionsMap[key]) {
      return (
        <div key={key} style={{ marginBottom: 12 }}>
          <label
            htmlFor={key}
            style={{ fontWeight: "bold", marginBottom: 4, display: "block" }}
          >
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <select
            id={key}
            name={key}
            value={value}
            onChange={(e) => handleChange(e, setAttacker, attacker)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", width: "100%" }}
          >
            {optionsMap[key].map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(key, opt)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Checkbox pour booléens
    if (typeof def === "boolean") {
      return (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              id={key}
              name={key}
              checked={value}
              onChange={(e) => handleChange(e, setAttacker, attacker)}
            />
            <span style={{ fontWeight: "bold" }}>{fieldLabels[key] || key.replaceAll("_", " ")}</span>
          </label>
        </div>
      );
    }

    // Input texte par défaut
    return (
      <div key={key} style={{ marginBottom: 12 }}>
        <label
          htmlFor={key}
          style={{ fontWeight: "bold", marginBottom: 4, display: "block" }}
        >
          {fieldLabels[key] || key.replaceAll("_", " ")}
        </label>
        <input
          id={key}
          type="text"
          name={key}
          value={value}
          onChange={(e) => handleChange(e, setAttacker, attacker)}
          style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", width: "100%" }}
        />
      </div>
    );
  };

  // Prépare les données avant envoi en convertissant les nombres
  const prepareAttacker = (attacker) => {
    const parsed = { ...attacker };
    Object.keys(parsed).forEach((key) => {
      if (
        parsed[key] !== "" &&
        parsed[key] !== null &&
        parsed[key] !== undefined &&
        !isNaN(parsed[key]) &&
        typeof defaultAttacker[key] !== "boolean"
      ) {
        parsed[key] = Number(parsed[key]);
      }
    });
    return parsed;
  };

  // Envoi des données pour les deux attaquants
  const handleSubmit = async () => {
    try {
      const prepared1 = prepareAttacker(attacker1);
      const prepared2 = prepareAttacker(attacker2);

      const payload1 = { ...prepared1, ...defender };
      const payload2 = { ...prepared2, ...defender };

      /*const [res1, res2] = await Promise.all([
        axios.post("https://statwarhammer-production.up.railway.app/simulate", payload1),
        axios.post("https://statwarhammer-production.up.railway.app/simulate", payload2),
      ]);*/
      payload1.Attacks = String(payload1.Attacks);
      payload1.Strength = String(payload1.Strength);
      payload1.PA = String(payload1.PA);
      payload1.Damage = String(payload1.Damage);
      payload2.Attacks = String(payload2.Attacks);
      payload2.Strength = String(payload2.Strength);
      payload2.PA = String(payload2.PA);
      payload2.Damage = String(payload2.Damage);

      console.log("Payload 1 :", payload1);
      console.log("Payload 2 :", payload2);
      
      const [res1, res2] = await Promise.all([
        
        axios.post("http://localhost:8000/simulate", payload1),
        axios.post("http://localhost:8000/simulate", payload2),
      ]);

      setResults({
        results1: res1.data.results_catalogue,
        results2: res2.data.results_catalogue,
      });
    } catch (error) {
        if (error.response) {
          console.error("Erreur détaillée : ", error.response.data);
        } else {
          console.error("Erreur Axios sans réponse :", error);
        }
      }
      
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Comparateur de Profils</h2>
      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ display: "flex", flex: 2, gap: 40 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "orange" }}>Attaquant 1</h3>
            {attackerFields.map((key) => renderField(key, attacker1, setAttacker1))}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "blue" }}>Attaquant 2</h3>
            {attackerFields.map((key) => renderField(key, attacker2, setAttacker2))}
          </div>
        </div>

        <div style={{ flex: 2 }}>
          <button
            onClick={handleSubmit}
            style={{
              marginBottom: 20,
              padding: 10,
              background: "#3182ce",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Lancer la comparaison
          </button>

          {results && (
            <div style={{ marginTop: 48 }}>
              <h3 style={{ fontWeight: "bold", fontSize: 18 }}>
                Résultats sur des unités classiques
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Unité</th>
                    <th style={cellStyle}>Moyenne arme 1</th>
                    <th style={cellStyle}>Moyenne arme 2</th>
                    <th style={cellStyle}>Arme la plus efficace</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.results1).map(([unitName, stats]) => {
                    const mean1 = stats.mean;
                    const mean2 = results.results2[unitName]?.mean ?? 0;

                    const diff = mean2 - mean1;
                    const percentage = mean1 !== 0 ? ((diff / mean1) * 100).toFixed(1) : "0";

                    return (
                      <tr key={unitName}>
                        <td style={cellStyle}>
                          {unitName} {stats.unit ? `(en ${stats.unit})` : ""}
                        </td>
                        <td style={cellStyle}>{mean1.toFixed(1)}</td>
                        <td style={cellStyle}>{mean2.toFixed(1)}</td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: "center",
                            color: diff > 0 ? "blue" : diff < 0 ? "orange" : "gray",
                          }}
                        >
                          {diff === 0
                            ? "Identiques"
                            : `${diff > 0 ? "Attaquant 2" : "Attaquant 1"} +${Math.abs(
                                percentage
                              )}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Compare;
