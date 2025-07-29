import React from 'react';
import { useTranslation } from "react-i18next";

const optionsMap = {
  Toughness: Array.from({ length: 14 }, (_, i) => i + 1),
  Save: [2,3,4,5,6,7],
  Save_invu: ["N/A", "2", "3", "4", "5", "6"],
  PV: Array.from({ length: 30 }, (_, i) => i + 1),
  Nb_of_models: Array.from({ length: 20 }, (_, i) => i + 1),
  Fnp: ["N/A", "4", "5", "6"],
  Modif_hit_def: [0,-1,-2],
  Modif_wound_def: [0,-1],
};

const booleanFields = new Set([
   "Halve_damage", "Reduce_damage_1", "Cover"
]);

const defaultFieldsToEdit = [
  "Toughness", "Save", "Save_invu", "PV",
  "Nb_of_models", "Fnp",
  "Modif_hit_def",
  "Modif_wound_def", "Halve_damage", "Reduce_damage_1", "Cover"
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

const DefenseProfileCard = ({ profile, onChange, fieldsToEdit = defaultFieldsToEdit, title = "Profil Défensif" }) => {
  
  const { t } = useTranslation();
  const fieldLabels = useFieldLabels(t);
  
  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, type, checked, value } = e.target;
  
    let val;
    if (booleanFields.has(name)) {
      val = checked;
    } else if (optionsMap[name]) {
      // Si c'est "Save_invu" ET qu'on a "N/A", garde la string "N/A"
      if (value === "N/A") {
        val = "N/A";
      } else {
        val = Number(value);
      }
    } else {
      val = value;
    }
  
    const updatedProfile = { ...profile, [name]: val };
    onChange(updatedProfile);
  };
  

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 16,
      maxWidth: 400,
      margin: 8,
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {fieldsToEdit.map((key) => {
        const value = profile[key];

        if (booleanFields.has(key)) {
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  name={key}
                  checked={!!value}
                  onChange={handleChange}
                  style={{ marginRight: 6 }}
                />
                {fieldLabels[key]}
              </label>
            </div>
          );
        }

        if (optionsMap[key]) {
          return (
            <div key={key} style={{ marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4 }}>{fieldLabels[key]}</label>
              <select name={key} value={value} onChange={handleChange} style={{ border: "1px solid #ccc", padding: 6, borderRadius: 4, width: "100%" }}>
                {optionsMap[key].map((opt) => (
                  <option key={opt} value={opt}>
                    {(key === "Save_invu" && opt !== "N/A") || key === "Save" ? `${opt}+` : opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={key} style={{ marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 4 }}>{fieldLabels[key]}</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DefenseProfileCard;
