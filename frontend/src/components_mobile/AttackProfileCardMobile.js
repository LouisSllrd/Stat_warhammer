import React from 'react';
import { useTranslation } from "react-i18next";


const optionsMap = {
  Nb_weapons: Array.from({ length: 20 }, (_, i) => i + 1),
  CT: ["Torrent","2","3","4","5","6"],
  Strength: Array.from({ length: 24 }, (_, i) => i + 1),
  PA: [0, -1, -2, -3, -4, -5],
  Sustained_hit: ["N/A", "1", "2", "3", "D3", "D6"],
  Melta: [0, 1, 2, 3, 4, 5, 6],
  Re_roll_hit: ["N/A", "Relance des 1", "Relance des touches ratées", "Relance des touches non critiques (pêcher)" ],
  Re_roll_wound: ["N/A", "Relance des 1", "Relance des blessures ratées", "Relance des blessures non critiques (pêcher)" ],
  Modif_hit_att: [0, 1, 2],
  Modif_wound_att: [0, 1],
  Crit_on_X_to_hit: [2, 3, 4, 5, 6],
  Crit_on_X_to_wound: [2, 3, 4, 5, 6],
};

const booleanFields = new Set([
  "Lethal_hit", "Deva_wound",
  "Blast"
]);

const defaultFieldsToEdit = [
  "Nb_weapons","Attacks", "CT", "Strength", "PA", "Damage", 
  "Sustained_hit", "Lethal_hit", "Deva_wound", 
  "Modif_hit_att", "Modif_wound_att", "Blast", "Melta", "Re_roll_hit", "Re_roll_wound", 
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
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
  };
}
const EditableAttackProfileCard = ({ profile, onChange, fieldsToEdit = defaultFieldsToEdit }) => {
  const { t } = useTranslation();
  const fieldLabels = useFieldLabels(t);
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Convert numerical values
    if (!booleanFields.has(name) && optionsMap[name]) {
        if (name === "Strength" || name === "PA" || name === "Re_roll_hit" || name === "Re_roll_wound"|| name === "Sustained_hit" || name === "CT") {
          val = String(val);
        } else {
          console.log(val)
          val = Number(val);
        }
      }
      

    // Construire nouveau profil modifié
    const updatedProfile = { ...profile, [name]: val };

    // Appeler le callback onChange
    onChange(updatedProfile);
  };

  const optionLabel = (key, val) => {
    if (key === "PA") return val;
    if (["Modif_hit_att", "Modif_wound_att"].includes(key)) return val > 0 ? `+${val}` : `${val}`;
    if (
      key === "CT" && val != "Torrent" ||
      key === "Crit_on_X_to_hit" ||
      key === "Crit_on_X_to_wound" ||
      key === "Fnp_X"
    ) return `${val}+`;
    if (key === "Re_roll_hit" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_hit");
    if (key === "Re_roll_hit" && val === "Relance des touches non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_hit");

    if (key === "Re_roll_wound" && val === "Relance des 1") return t("simulateur.re_roll.Re_roll_1_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures ratées") return t("simulateur.re_roll.Re_roll_failed_roll_to_wound");
    if (key === "Re_roll_wound" && val === "Relance des blessures non critiques (pêcher)") return t("simulateur.re_roll.Re_roll_non_critical_roll_to_wound");
    return `${val}`;
  };
  

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 16,
      margin: 8,
      backgroundColor: '#f9f9f9',
      maxWidth: 400,
      width: '100%', // ➜ prend 100% de la largeur disponible
      boxSizing: 'border-box', // ➜ évite les débordements à cause du padding
    }}>
      <h3 style={{ marginBottom: 12 }}> {t("attack_profile.title")}</h3>
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
              <select
                name={key}
                value={value}
                onChange={handleChange}
                style={{
                  border: "1px solid #ccc",
                  padding: 6,
                  borderRadius: 4,
                  width: "100%",
                  boxSizing: 'border-box'
                }}
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
  
        return (
          <div key={key} style={{ marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 4 }}>{fieldLabels[key]}</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              style={{
                border: "1px solid #ccc",
                padding: 6,
                borderRadius: 4,
                width: "100%",
                boxSizing: 'border-box'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EditableAttackProfileCard;
