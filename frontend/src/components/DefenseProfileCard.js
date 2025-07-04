import React from 'react';

const fieldLabels = {
  Toughness: "Endurance",
  Save: "Save",
  Save_invu: "Sauvegarde invulnérable",
  PV: "PV par modèle",
  Nb_of_models: "Nombre de figurines",
  Fnp: "Insensible à la douleur (FNP)",
  Modif_hit_def: "Modificateur de touche",
  Modif_wound_def: "Modificateur de blessure",
  Halve_damage: "Divise les dégâts par 2",
  Reduce_damage_1: "Réduit les dégâts de 1",
  Cover: "Couvert"
};

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

const DefenseProfileCard = ({ profile, onChange, fieldsToEdit = defaultFieldsToEdit, title = "Profil Défensif" }) => {
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
