import React from 'react';

const fieldLabels = {
  Attacks: "Attaques",
  CT: "CC/CT",
  Auto_hit: "Touches auto",
  Strength: "Force",
  PA: "PA",
  Damage: "Dégâts",
  Sustained_hit: "Touches soutenues",
  Sustained_X: "Touches soutenues X",
  Lethal_hit: "Touches fatales",
  Deva_wound: "Blessures dévastatrices",
  Blast: "Déflagration",
  Melta: "Melta X",
  Modif_hit: "Modif touche",
  Modif_wound: "Modif blessure",
  Re_roll_hit1: "Relance touches de 1",
  Re_roll_hit: "Relance toutes les touches",
  Re_roll_wound1: "Relance blessures de 1",
  Re_roll_wound: "Relance toutes les blessures",
  Crit_on_X_to_hit: "Critique en touche sur X+",
  Crit_on_X_to_wound: "Critique en blessure sur X+"
};

const optionsMap = {
  CT: [2, 3, 4, 5, 6],
  Strength: Array.from({ length: 24 }, (_, i) => i + 1),
  PA: [0, -1, -2, -3, -4, -5],
  Melta: [0, 1, 2, 3, 4, 5, 6],
  Modif_hit: [-2, -1, 0, 1, 2],
  Modif_wound: [-2, -1, 0, 1, 2],
  Crit_on_X_to_hit: [2, 3, 4, 5, 6],
  Crit_on_X_to_wound: [2, 3, 4, 5, 6],
};

const booleanFields = new Set([
  "Auto_hit", "Sustained_hit", "Lethal_hit", "Deva_wound",
  "Blast", "Re_roll_hit1", "Re_roll_hit",
  "Re_roll_wound1", "Re_roll_wound"
]);

const defaultFieldsToEdit = [
  "Attacks", "CT", "Auto_hit", "Strength", "PA", "Damage", 
  "Sustained_hit", "Sustained_X", "Lethal_hit", "Deva_wound", 
  "Modif_hit", "Modif_wound", "Blast", "Melta", 
  "Re_roll_hit1", "Re_roll_hit", "Re_roll_wound1", "Re_roll_wound", 
  "Crit_on_X_to_hit", "Crit_on_X_to_wound"
];

const EditableAttackProfileCard = ({ profile, onChange, fieldsToEdit = defaultFieldsToEdit, title = "Profil de l'attaque" }) => {
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Convert numerical values
    if (!booleanFields.has(name) && optionsMap[name]) {
        if (name === "Strength" || name === "PA") {
          val = String(val);
        } else {
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
    if (["Modif_hit", "Modif_wound"].includes(key)) return val > 0 ? `+${val}` : `${val}`;
    if (["CT", "Crit_on_X_to_hit", "Crit_on_X_to_wound"].includes(key)) return `${val}+`;
    return val;
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
              <select name={key} value={value} onChange={handleChange}>
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
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EditableAttackProfileCard;
