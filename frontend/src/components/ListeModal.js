import React, { useState } from "react";
import AttackProfileCard from "./AttackProfileCard";

export default function ListeModal({
  open,
  onClose,
  onSave,
  tempListe = { nom: "", unites: [] },
  setTempListe,
  onAddUnite,
  title
}) {
  const [unitName, setUnitName] = useState("");
  const [attackProfiles, setAttackProfiles] = useState([{}]);
  const [showAddUnit, setShowAddUnit] = useState(false);

  if (!open) return null;

  const handleAddUnit = () => {
    setUnitName("");
    setAttackProfiles([{ ...defaultProfile }]);
    setShowAddUnit(true);
  };

  const defaultProfile = {
    Attacks: "12",
    CT: 2,
    Auto_hit: false,
    Strength: "8",
    PA: "-2",
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
  

  const handleProfileChange = (index, newProfile) => {
    setAttackProfiles(prev => {
      const updated = [...prev];
      updated[index] = newProfile;
      return updated;
    });
  };
  

  const handleCreateUnit = () => {
    // On prépare une copie propre des profils avec tous les champs définis (si undefined, on met une valeur par défaut)
    const profilsComplets = attackProfiles.map(p => ({
        Attacks: p.Attacks ?? 0,
        CT: p.CT ?? 0,
        Auto_hit: p.Auto_hit ?? false,
        Strength: p.Strength ?? 0,
        PA: p.PA ?? 0,
        Damage: p.Damage ?? 0,
        Sustained_hit: p.Sustained_hit ?? 0,
        Sustained_X: p.Sustained_X ?? 0,
        Lethal_hit: p.Lethal_hit ?? 0,
        Deva_wound: p.Deva_wound ?? 0,
        Blast: p.Blast ?? false,
        Melta: p.Melta ?? 0,
        Modif_hit: p.Modif_hit ?? 0,
        Modif_wound: p.Modif_wound ?? 0,
        Re_roll_hit1: p.Re_roll_hit1 ?? false,
        Re_roll_hit: p.Re_roll_hit ?? false,
        Re_roll_wound1: p.Re_roll_wound1 ?? false,
        Re_roll_wound: p.Re_roll_wound ?? false,
        Crit_on_X_to_hit: p.Crit_on_X_to_hit ?? 0,
        Crit_on_X_to_wound: p.Crit_on_X_to_wound ?? 0,
      }));
      
  
    const newUnit = { nom: unitName, profils: profilsComplets };
    
    setTempListe(prev => ({
      ...prev,
      unites: [...prev.unites, newUnit]
    }));
  
    setShowAddUnit(false);
  };
  

  function cleanObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject);
    } else if (obj !== null && typeof obj === "object") {
      // Assure que ce n'est pas un tableau déguisé en objet
      // (par exemple un objet avec des clés numériques)
      const keys = Object.keys(obj);
      const allNumericKeys = keys.every(k => !isNaN(k));
  
      if (allNumericKeys) {
        // C'est un objet avec clés numériques -> on convertit en tableau
        return keys
          .sort((a, b) => a - b)
          .map(key => cleanObject(obj[key]));
      } else {
        // Objet normal
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObject(v)])
        );
      }
    }
    return obj;
  }

  const handleSaveList = () => {
    const cleanedListe = cleanObject(tempListe.unites);
    onSave(cleanedListe);
  };
  

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{title}</h2>

        {/* Nom de la liste */}
        <input
          type="text"
          placeholder="Nom de la liste"
          value={tempListe.nom}
          onChange={(e) =>
            setTempListe((prev) => ({ ...prev, nom: e.target.value }))
          }
          style={styles.input}
        />

        <button onClick={handleAddUnit}>Ajouter une unité</button>

        {/* Tableau des unités */}
        {tempListe.unites.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3>Unités ajoutées :</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Profils</th>
                </tr>
              </thead>
              <tbody>
                {tempListe.unites.map((unit, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{unit.nom}</td>
                    <td style={styles.td}>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {(Array.isArray(unit.profils) ? unit.profils : []).map(
                          (p, i) => (
                            <li key={i}>
                              {`Att: ${p.Attacks ?? "?"}, CC/CT: ${p.CT ?? "?"}+, F: ${p.Strength ?? "?"}, PA: ${p.PA ?? "?"}, D: ${p.Damage ?? "?"}`}
                            </li>
                          )
                        )}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={handleSaveList} style={{ marginTop: 20 }}>
          Valider la liste
        </button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Annuler
        </button>

        {/* Sous-modal pour créer une unité */}
        {showAddUnit && (
          <div style={styles.subModal}>
            <h3>Créer une unité</h3>
            <input
              type="text"
              placeholder="Nom de l'unité"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              style={styles.input}
            />

            {attackProfiles.map((profile, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <AttackProfileCard
                  profile={profile}
                  onChange={(newProfile) =>
                    handleProfileChange(index, newProfile)
                  }
                />
              </div>
            ))}

            <button onClick={handleCreateUnit}>Créer l'unité</button>
            <button onClick={() => setShowAddUnit(false)} style={{ marginLeft: 10 }}>
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxWidth: 600,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  subModal: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  input: {
    display: "block",
    width: "100%",
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  th: {
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: 8,
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: 8,
    verticalAlign: "top",
  },
};
