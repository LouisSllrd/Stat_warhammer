import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  Modif_wound_def: "0",
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
function useFieldLabels(t) {
  return {
    Nb_weapons: t("simulateur.attaquant.nb_weapons"),
    Attacks: t("simulateur.attaquant.attacks"),
    CT: t("simulateur.attaquant.CT"),
    Strength: t("simulateur.attaquant.Strength"),
    PA: t("simulateur.attaquant.PA"),
    Damage: t("simulateur.attaquant.Damage"),
    Sustained_hit: t("simulateur.attaquant.Sustained_hit"),
    Lethal_hit: t("simulateur.attaquant.Lethal_hit"),
    Deva_wound: t("simulateur.attaquant.Deva_wound"),
    Blast: t("simulateur.attaquant.Blast"),
    Melta: t("simulateur.attaquant.Melta"),
    Modif_hit_att: t("simulateur.attaquant.Modif_hit_att"),
    Modif_wound_att: t("simulateur.attaquant.Modif_wound_att"),
    Re_roll_hit: t("simulateur.attaquant.Re_roll_hit"),
    Re_roll_wound: t("simulateur.attaquant.Re_roll_wound"),
    Crit_on_X_to_hit: t("simulateur.attaquant.Crit_on_X_to_hit"),
    Crit_on_X_to_wound: t("simulateur.attaquant.Crit_on_X_to_wound"),
  
    Toughness: t("simulateur.defenseur.Toughness"),
    Save: t("simulateur.defenseur.Save"),
    Save_invu: t("simulateur.defenseur.Save_invu"),
    PV: t("simulateur.defenseur.PV"),
    Nb_of_models: t("simulateur.defenseur.Nb_of_models"),
    Cover: t("simulateur.defenseur.Cover"),
    Fnp: t("simulateur.defenseur.Fnp"),
    Modif_hit_def: t("simulateur.defenseur.Modif_hit_def"),
    Modif_wound_def: t("simulateur.defenseur.Modif_wound_def"),
    Halve_damage: t("simulateur.defenseur.Halve_damage"),
    Reduce_damage_1: t("simulateur.defenseur.Reduce_damage_1"),
  };
}

function Simulateur() {

  const { t } = useTranslation();
  const fieldLabels = useFieldLabels(t);
  
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
      ["Save", "Strength", "PA", "Melta", "Modif_hit_att", "Modif_wound_att",
        "Crit_on_X_to_hit", "Crit_on_X_to_wound", "Toughness", "Modif_hit_def"
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
    parsedParams.Modif_wound_def = String(parsedParams.Modif_wound_def);

    console.log("Modif_wound_def : ",parsedParams.Modif_wound_def )

    try {
      /*const res = await axios.post(
        "https://statwarhammer-production-871f.up.railway.app/simulate",
        parsedParams
      );*/
      
      const res = await axios.post("https://statwarhammer-production-871f.up.railway.app/simulate", parsedParams);
      setResult(res.data);
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
    Modif_wound_def: ["0", "-1", "-1 si F>E"],                                  
    Save_invu: ["N/A", "2", "3", "4", "5", "6"]
  };

  // Fonction utilitaire pour afficher l'option textuel
  const optionLabel = (key, val) => {
    if (key === "PA") return val === 0 ? "0" : `${val}`;               // On laisse tel quel (ex: -1)
    if (
      key === "Modif_hit_att" || key === "Modif_wound_att" || key === "Modif_hit_def" 
    ) return val > 0 ? `+${val}` : `${val}`;
    if (
      key === "CT" && val != "Torrent" ||
      key === "Crit_on_X_to_hit" ||
      key === "Crit_on_X_to_wound" ||
      key === "Save_invu" && val != "N/A" ||
      key === "Fnp" && val != "N/A"
    ) return `${val}+`;
    if (key === "Re_roll_hit" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_hit");

    if (key === "Re_roll_wound" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_wound");

    if (key === "Modif_wound_def" && val === "-1 si F>E") return t("simulateur.defenseur.Minus_one_to_wound_if_SsE");
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
        {t("simulateur.titre")}
      </h1>
  
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Attaquant */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>⚔️ {t("simulateur.attacker")}</h3>
          {attackerFields.map(renderField)}
        </div>
  
        {/* Défenseur + bouton */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>🛡️ {t("simulateur.defender")}</h3>
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
            {loading ? t("simulateur.simulation_en_cours") : t("simulateur.lancer")}
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
                {t("simulateur.resultats")} :
              </h2>
              <p style={{ marginBottom: 4 }}>
                <strong>{t("simulateur.unite_mesure")} :</strong> {result.unit_descr === "Nombre de PV perdus"
                                    ? t("simulateur.unit_PV")
                                    : t("simulateur.unit_figs")}
              </p>
              <p style={{ marginBottom: 4 }}>
                <strong>{t("simulateur.moyenne")} :</strong> <strong>{result.mean.toFixed(1)}</strong> {result.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")}, {t("simulateur.soit")}{" "}
                {result.relative_damages.toFixed(0)}% {t("simulateur.de_force_init")}
              </p>
              <p>
                <strong>{t("simulateur.ecart_type")} :</strong> {result.std.toFixed(1)}
              </p>
              <p> <strong>{t("simulateur.proba_tuer")} :</strong> <strong style={{
          color:
          result.proba_unit_killed < 30 ? "red" :
          result.proba_unit_killed < 60 ? "orange" :
          result.proba_unit_killed < 80 ? "gold" :
            "green"
        }}>
          {result.proba_unit_killed.toFixed(0)}%
        </strong>  </p>

              {/* Graphiques */}
              <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                <div>
                  <h3 style={{ fontWeight: "bold", marginBottom: 12 }}>
                    {t("simulateur.distribution")}
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
                    {t("simulateur.probabilite_seuil")}
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
                    {t("simulateur.comparaison_unites")}
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
                        <th style={cellStyle}>{t("simulateur.unit")}</th>
                        <th style={cellStyle}>{t("simulateur.moyenne")}</th>
                        <th style={cellStyle}>{t("simulateur.ecart_type")}</th>
                        <th style={cellStyle}>{t("simulateur.force_initiale")}</th>
                        <th style={cellStyle}>{t("simulateur.degats_relatifs")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.results_catalogue).map(
                        ([unitName, stats]) => (
                          <tr key={unitName}>
                            <td style={cellStyle}>
                              {unitName}{" "}
                              {stats.unit ? `(${t("simulateur.en")} ${stats.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")})` : ""}
                            </td>
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
