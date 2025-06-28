import React from "react";

const fieldLabels = {
  Toughness: "Endurance",
  Save: "Sauvegarde d'armure",
  Save_invu: "Sauvegarde invulnérable",
  Save_invu_X: "Invulnérable à X+",
  PV: "PV par figurine",
  Nb_of_models: "Nombre de figurines",
  Cover: "Couvert",
  Fnp: "Insensible à la douleur (FNP)",
  Fnp_X: "FNP à X+",
  Halve_damage: "Divise les dégâts par 2",
  Reduce_damage_1: "Dégâts les dégâts de 1"
};

const defaultParams = {
  Toughness: 4,
  Save: 3,
  Save_invu: false,
  Save_invu_X: 5,
  PV: 2,
  Nb_of_models: 5,
  Cover: false,
  Fnp: false,
  Fnp_X: 6,
  Halve_damage: false,
  Reduce_damage_1: false
};

// Si tu veux ajouter d'autres dropdown plus tard
const optionsMap = {
  // Exemple : Fnp_X pourrait être dans cette logique aussi
};

const DefenderForm = ({ params, setParams }) => {
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : Number(value);
    setParams({ ...params, [name]: val });
  };

  const optionLabel = (key, val) => {
    if (["Save", "Save_invu_X", "Fnp_X"].includes(key)) {
      return `${val}+`;
    }
    return val;
  };

  const renderField = (key) => {
    const def = defaultParams[key];

    if (key === "Save" || key === "Save_invu_X" || key === "Fnp_X") {
      const saveOptions = [2, 3, 4, 5, 6, 7];
      const isDisabled = key === "Fnp_X" && !params.Fnp;

      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", marginBottom: 4 }}>
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <select
            name={key}
            value={params[key]}
            onChange={handleChange}
            disabled={isDisabled}
            style={{
              border: "1px solid #ccc",
              padding: 6,
              borderRadius: 4,
              width: "100%"
            }}
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

    if (Object.keys(optionsMap).includes(key)) {
      const opts = optionsMap[key];
      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", marginBottom: 4 }}>
            {fieldLabels[key] || key.replaceAll("_", " ")}
          </label>
          <select
            name={key}
            value={params[key]}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: 6,
              borderRadius: 4,
              width: "100%"
            }}
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

    if (typeof def === "boolean") {
      return (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", marginBottom: 4 }}>
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

    return (
      <div key={key} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", marginBottom: 4 }}>
          {fieldLabels[key] || key.replaceAll("_", " ")}
        </label>
        <input
          type="number"
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
    <div style={{ display: "grid", gap: 12, maxWidth: 500 }}>
      {Object.keys(defaultParams).map(renderField)}
    </div>
  );
};

export default DefenderForm;
