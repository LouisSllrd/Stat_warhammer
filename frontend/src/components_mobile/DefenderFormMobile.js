import React from "react";
import { useTranslation } from "react-i18next";

const defaultParams = {
  Toughness: 4,
  Save: 3,
  Save_invu: "N/A",
  PV: 2,
  Nb_of_models: 5,
  Cover: false,
  Fnp: "N/A",
  Modif_hit_def: 0,
  Modif_wound_def: "0",
  Halve_damage: false,
  Reduce_damage_1: false
};

// Ajout de Toughness dans optionsMap avec options 1 à 12
const optionsMap = {
  Toughness: Array.from({ length: 14 }, (_, i) => i + 1),
  PV: Array.from({ length: 30 }, (_, i) => i + 1),
  Nb_of_models: Array.from({ length: 20 }, (_, i) => i + 1),
  Save_invu: ["N/A", "2", "3", "4", "5", "6"],
  Fnp: ["N/A", "4", "5", "6"],
  Modif_hit_def: [0,-1,-2],
  Modif_wound_def: ["0", "-1", "-1 si F>E"],
};
function useFieldLabels(t) {
  return {
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


const DefenderForm = ({ params, setParams }) => {
  const { t } = useTranslation();
  const fieldLabels = useFieldLabels(t);
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    
    let val;
    if (type === "checkbox") {
      val = checked;
    } else if (["Save_invu", "Fnp"].includes(name) && value === "N/A") {
      val = "N/A";
    } else if (name === "Modif_wound_def") {
      val = value;
    } else {
      val = Number(value);
    }
  
    setParams({ ...params, [name]: val });
  };
  

  const optionLabel = (key, val) => {
    if (["Save", "Save_invu", "Fnp"].includes(key) && val != "N/A") {
      return `${val}+`;
    }
    if (key === "Modif_wound_def" && val === "-1 si F>E") return t("simulateur.defenseur.Minus_one_to_wound_if_SsE");
    return val;
  };

  const renderField = (key) => {
    const def = defaultParams[key];

    if (key === "Save"  ) {
      const saveOptions = [2, 3, 4, 5, 6, 7];

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
            style={{ marginRight: 6 }}
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
