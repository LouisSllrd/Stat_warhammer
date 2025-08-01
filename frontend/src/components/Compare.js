import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { motion, AnimatePresence } from "framer-motion";
/*import { useContext } from "react";
import { ProfilesContext } from "./ProfileContext";*/

import axios from "axios";

const defaultAttacker = {
  Nb_weapons: 1,
  Attacks: "12",
  CT: "2",
  Strength: "8",
  PA: "2",
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
};

const defender = {
  Toughness: 12,
  Save: 2,
  Save_invu: "N/A",
  PV: 16,
  Nb_of_models: 1,
  Cover: false,
  Fnp: "N/A",
  Modif_hit_def: 0,
  Modif_wound_def: "0",
  Halve_damage: false,
  Reduce_damage_1: false,
  Reduce_PA_1 : false,
};

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
    Reduce_PA_1: t("simulateur.defenseur.Reduce_PA_1")
  };
}


const attackerFields = Object.keys(defaultAttacker);

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const optionsMap = {
  Nb_weapons: Array.from({ length: 20 }, (_, i) => i + 1),
  CT: ["Torrent","2","3","4","5","6"],
  Strength: Array.from({ length: 24 }, (_, i) => i + 1),
  PA: [0, -1, -2, -3, -4, -5],
  Re_roll_hit: ["N/A", "Relance des 1", "Relance des touches ratées", "Relance des touches non critiques (pêcher)" ],
  Re_roll_wound: ["N/A", "Relance des 1", "Relance des blessures ratées", "Relance des blessures non critiques (pêcher)" ],
  Sustained_hit: ["N/A", "1", "2", "3", "D3", "D6"],
  Melta: [0,1,2,3,4,5,6],                              
  Modif_hit_att: [0, 1, 2],
  Modif_wound_att: [0, 1],
  Crit_on_X_to_hit: [2, 3, 4, 5, 6],
  Crit_on_X_to_wound: [2, 3, 4, 5, 6]
};

/*const saveOptions = [2, 3, 4, 5, 6, 7];*/



function Compare() {

  const { t } = useTranslation();
  const fieldLabels = useFieldLabels(t);
    /*const { attacker1, setAttacker1, attacker2, setAttacker2 } = useContext(ProfilesContext);
    console.log("ProfilesContext values:", { attacker1, attacker2 });*/
  const [attacker1, setAttacker1] = useState(defaultAttacker);
  const [attacker2, setAttacker2] = useState(defaultAttacker);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (key === "Re_roll_hit" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_hit");

    if (key === "Re_roll_wound" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_wound");
    return `${val}`;
  };

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
        "Modif_hit_att",
        "Modif_wound_att",
        "Crit_on_X_to_hit",
        "Crit_on_X_to_wound",
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
      setLoading(true);
      const prepared1 = prepareAttacker(attacker1);
      const prepared2 = prepareAttacker(attacker2);

      const payload1 = { ...prepared1, ...defender };
      const payload2 = { ...prepared2, ...defender };

      /*const [res1, res2] = await Promise.all([
        axios.post("https://statwarhammer-production.up.railway.app/simulate", payload1),
        axios.post("https://statwarhammer-production.up.railway.app/simulate", payload2),
      ]);*/
      payload1.Attacks = String(payload1.Attacks);
      payload1.CT = String(payload1.CT);
      payload1.Strength = String(payload1.Strength);
      payload1.PA = String(payload1.PA);
      payload1.Damage = String(payload1.Damage);
      payload1.Sustained_hit = String(payload1.Sustained_hit);
      payload2.Sustained_hit = String(payload2.Sustained_hit);
      payload2.Attacks = String(payload2.Attacks);
      payload2.Strength = String(payload2.Strength);
      payload2.PA = String(payload2.PA);
      payload2.Damage = String(payload2.Damage);
      payload2.CT = String(payload2.CT);


      payload1.Re_roll_hit = String(payload1.Re_roll_hit);
      payload2.Re_roll_hit = String(payload2.Re_roll_hit);

      payload1.Re_roll_wound = String(payload1.Re_roll_wound);
      payload2.Re_roll_wound = String(payload2.Re_roll_wound);


      console.log("Payload 1 :", payload1);
      console.log("Payload 2 :", payload2);
      
      const [res1, res2] = await Promise.all([
        
        axios.post("https://statwarhammer-production-871f.up.railway.app/simulate", payload1),
        axios.post("https://statwarhammer-production-871f.up.railway.app/simulate", payload2),
      ]);

      setResults({
        results1: res1.data.results_catalogue,
        results2: res2.data.results_catalogue,
      });
      setLoading(false);
    } catch (error) {
        if (error.response) {
          console.error("Erreur détaillée : ", error.response.data);
        } else {
          console.error("Erreur Axios sans réponse :", error);
        }
      }
      
  };

  return (
    <div
  style={{
    padding: 24,
    fontFamily: "Segoe UI, sans-serif",
    background: "#DCFEFF",
    minHeight: "100vh",
  }}
>
  <h1
    style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 32,
      textAlign: "center",
      color: "#2d3748",
    }}
  >
    {t("accueil.generic.comparateur_title")}
  </h1>

  <div
    style={{
      display: "flex",
      flexDirection: "row",
      gap: 24,
      // conteneur principal qui contient les 2 boîtes
      justifyContent: "center",
      alignItems: "flex-start",
    }}
  >
    {/* Boîte attaquants (gauche) */}
    <div
  style={{
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "row",
    gap: 40,
  }}
>
  <div
    style={{
      flex: 1,  // <== Remplit la moitié de la boîte parente
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h3
      style={{
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 8,
        color: "orange",
      }}
    >
      ⚔️ {t("simulateur.attacker")} 1
    </h3>
    {attackerFields.map((key) => renderField(key, attacker1, setAttacker1))}
  </div>

  <div
    style={{
      flex: 1,  // <== Remplit l'autre moitié
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h3
      style={{
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 8,
        color: "blue",
      }}
    >
      ⚔️ {t("simulateur.attacker")} 2
    </h3>
    {attackerFields.map((key) => renderField(key, attacker2, setAttacker2))}
  </div>
</div>

    {/* Boîte résultats + bouton (droite) */}
    <div
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minWidth: 400,
      }}
    >
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: loading ? "#a0aec0" : "#2b6cb0",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: 16,
          transition: "background-color 0.3s",
          marginBottom: 20,
        }}
      >
        {loading ? t("simulateur.simulation_en_cours") : t("compare.lancer_comparaison")}
      </button>

      <AnimatePresence>
        {results && (
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
              overflowY: "auto",
              maxHeight: "70vh",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                {t("compare.resultats")}
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "#fefefe",
                }}
              >
                <thead style={{ backgroundColor: "#ebf8ff" }}>
                  <tr>
                    <th style={cellStyle}>{t("simulateur.unit")}</th>
                    <th style={cellStyle}>{t("simulateur.moyenne")} {t("simulateur.attacker")} 1</th>
                    <th style={cellStyle}>{t("simulateur.moyenne")} {t("simulateur.attacker")}  2</th>
                    <th style={cellStyle}>{t("compare.arme_plus_efficace")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.results1).map(([unitName, stats]) => {
                    const mean1 = stats.mean;
                    const mean2 = results.results2[unitName]?.mean ?? 0;

                    const diff = mean2 - mean1;
                    const percentage =
                      mean1 !== 0 ? ((diff / mean1) * 100).toFixed(1) : "0";

                    return (
                      <tr key={unitName}>
                        <td style={cellStyle}>{unitName} {stats.unit ? `(${t("simulateur.en")} ${stats.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")})` : ""}
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
                            : `${diff > 0 ? `${t("simulateur.attacker")} 2` : `${t("simulateur.attacker")} 1`} +${Math.abs(
                                percentage
                              )}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</div>
);

}

export default Compare;
