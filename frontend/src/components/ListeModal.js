import React, { useState } from "react";
import AttackProfileCard from "./AttackProfileCard";
import { motion, AnimatePresence } from "framer-motion";

// ... même imports
export default function ListeModal({
  open,
  onClose,
  onSave,
  tempListe = { nom: "", unites: [] },
  setTempListe,
  onAddUnite,
  title,
}) {
  const [unitName, setUnitName] = useState("");
  const [attackProfiles, setAttackProfiles] = useState([{}]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [visibleProfiles, setVisibleProfiles] = useState([0]);
 


  const handleAddUnit = () => {
    setUnitName("");
    setAttackProfiles([{ ...defaultProfile }]);
    setShowAddUnit(true);
  };

  const toggleProfileVisibility = (index) => {
    setVisibleProfiles((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };
  const [loading, setLoading] = useState(false);

  const defaultProfile = {
    nom: "",
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
  };

  const handleProfileChange = (index, newProfile) => {
    setAttackProfiles((prev) => {
      const updated = [...prev];
      updated[index] = newProfile;
      return updated;
    });
  };

  const handleCreateUnit = () => {
    const profilsComplets = attackProfiles.map((p) => ({
      nom: p.nom ?? "",
      Nb_weapons: p.Nb_weapons ?? 1,
      Attacks: p.Attacks ?? 0,
      CT: p.CT ?? "0",
      Strength: p.Strength ?? 0,
      PA: p.PA ?? 0,
      Damage: p.Damage ?? 0,
      Sustained_hit: p.Sustained_hit ?? "N/A",
      Lethal_hit: p.Lethal_hit ?? 0,
      Deva_wound: p.Deva_wound ?? 0,
      Blast: p.Blast ?? false,
      Melta: p.Melta ?? 0,
      Modif_hit_att: p.Modif_hit_att ?? 0,
      Modif_wound_att: p.Modif_wound_att ?? 0,
      Re_roll_hit: p.Re_roll_hit ?? "N/A",
      Re_roll_wound: p.Re_roll_wound ?? "N/A",
      Crit_on_X_to_hit: p.Crit_on_X_to_hit ?? 0,
      Crit_on_X_to_wound: p.Crit_on_X_to_wound ?? 0,
    }));

    const newUnit = { nom: unitName, profils: profilsComplets };
    setTempListe((prev) => ({
      ...prev,
      unites: [...prev.unites, newUnit],
    }));
    setShowAddUnit(false);
  };

  function cleanObject(obj) {
    if (Array.isArray(obj)) return obj.map(cleanObject);
    if (obj !== null && typeof obj === "object") {
      const keys = Object.keys(obj);
      const allNumericKeys = keys.every((k) => !isNaN(k));
      if (allNumericKeys) {
        return keys
          .sort((a, b) => a - b)
          .map((key) => cleanObject(obj[key]));
      } else {
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
    setLoading(true);
    const cleanedListe = cleanObject(tempListe.unites);
    onSave(cleanedListe);
    setLoading(false);
  };

  return (
    <AnimatePresence >
      {open && (
    <motion.div
      key="modal-overlay"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 70,
      }}  style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{title}</h2>

        <input
          type="text"
          placeholder="Nom de la liste"
          value={tempListe.nom}
          onChange={(e) =>
            setTempListe((prev) => ({ ...prev, nom: e.target.value }))
          }
          style={styles.input}
        />

        <button style={styles.buttonPrimary} onClick={handleAddUnit}>
          + Ajouter une unité
        </button>

        {tempListe.unites.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={styles.subtitle}>Unités ajoutées :</h3>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#fefefe",
            }}>
              <thead  style={{ backgroundColor: "#ebf8ff" }}>
                <tr>
                <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Unités</th>
                <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Profils</th>
                </tr>
              </thead>
              <tbody>
                {tempListe.unites.map((unit, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{unit.nom}</td>
                    <td style={styles.td}>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <ol>
                        {(Array.isArray(unit.profils) ? unit.profils : []).map(
                          (p, i) => (
                            <li key={i}>
                              <em>{p.nom || `Profil ${i + 1}`}</em>{` (A: ${p.Attacks ?? "?"}, CC/CT: ${p.CT ?? "?"}+, F: ${p.Strength ?? "?"}, PA: ${p.PA ?? "?"}, D: ${p.Damage ?? "?"})`}
                            </li>
                          )
                        )}
                        </ol>
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        
        <AnimatePresence mode = "wait">
        {showAddUnit && (
          <motion.div 
          key="sub-modal-create-unit"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.1,
            ease: "easeInOut",
            type: "spring",
            stiffness: 70,
          }} style={styles.subModal}>
            <h3 style={styles.subtitle}>Créer une unité</h3>
            <input
              type="text"
              placeholder="Nom de l'unité"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              style={styles.input}
            />

            {attackProfiles.map((profile, index) => (
              <div key={index} style={styles.profileCard}>
                <button
                  onClick={() => toggleProfileVisibility(index)}
                  style={styles.buttonToggle}
                >
                  {visibleProfiles.includes(index)
                    ? `Cacher ${profile.nom || `Profil ${index + 1}`}`
                    : `Afficher ${profile.nom || `Profil ${index + 1}`}`}
                </button>
                {attackProfiles.length > 1 && (
                  <button
                    onClick={() => {
                      setAttackProfiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                      setVisibleProfiles((prev) =>
                        prev.filter((i) => i !== index)
                      );
                    }}
                    style={{... styles.buttonDelete, marginLeft: 10}}
                  >
                    Supprimer ce profil
                  </button>
                )}

                {visibleProfiles.includes(index) && (
                  <>
                    <input
                      type="text"
                      placeholder={`Nom du profil ${index + 1}`}
                      value={profile.nom || ""}
                      onChange={(e) =>
                        handleProfileChange(index, {
                          ...profile,
                          nom: e.target.value,
                        })
                      }
                      style={styles.input}
                    />
                    <AttackProfileCard
                      profile={profile}
                      onChange={(newProfile) =>
                        handleProfileChange(index, {
                          ...newProfile,
                          nom: profile.nom,
                        })
                      }
                    />
                  </>
                )}

                
              </div>
            ))}

            <button
              onClick={() => {
                setAttackProfiles((prev) => [...prev, { ...defaultProfile }]);

              }}
              style={styles.buttonPrimary}
            >
              + Ajouter un profil d'attaque
            </button>

            <div style={{ marginTop: 16 }}>
              <button onClick={handleCreateUnit} style={styles.buttonSecondary}>
              {loading ? "Sauvegarde en cours..." : "✅ Sauvegarder"}
              </button>
              <button
                onClick={() => setShowAddUnit(false)}
                style={{... styles.buttonSecondary, marginLeft: 10}}
              >
                ❌ Annuler
              </button>
            </div>
            </motion.div>
        )}
    </AnimatePresence>

        <div style={{ marginTop: 20 }}>
          <button onClick={handleSaveList} style={styles.buttonSecondary}>
            ✅ Sauvegarder la liste
          </button>
          <button onClick={onClose} style={{... styles.buttonSecondary, marginLeft: 10}}>
            ❌ Annuler
          </button>
        </div>
      </div>
      </motion.div>
      )}
    </AnimatePresence>
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
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 700,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  subModal: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    border: "1px solid #ddd",
  },
  input: {
    display: "block",
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  th: {
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: 8,
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#3182ce",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 10,
  },
  buttonSecondary: {
    backgroundColor: "#eee",
    color: "#333",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  buttonDelete: {
    backgroundColor: "#fee",
    color: "#a00",
    border: "1px solid #faa",
    padding: "6px 12px",
    borderRadius: 6,
    marginTop: 8,
  },
  buttonToggle: {
    backgroundColor: "#ddd",
    padding: "6px 12px",
    marginBottom: 10,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  profileCard: {
    marginBottom: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
  },
};
