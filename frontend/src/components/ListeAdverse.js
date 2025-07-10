import React, { useEffect, useState } from "react";
import DefenseProfileCard from "./DefenseProfileCard";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // ton fichier firebase config
import { motion, AnimatePresence } from "framer-motion";

export default function UnitesAdversesPage() {
  const [unites, setUnites] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [profiles, setProfiles] = useState([getDefaultDefenseProfile()]);
  const [editUnitId, setEditUnitId] = useState(null); // Pour savoir si on édite

  useEffect(() => {
    const q = query(collection(db, "unités_adverses"), orderBy("nom"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unitsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUnites(unitsData);
    });
    return () => unsubscribe();
  }, []);

  function getDefaultDefenseProfile() {
    return {
      Toughness: 3,
      Save: 4,
      Save_invu: "N/A",
      PV: 1,
      Nb_of_models: 1,
      Fnp: "N/A",
      Modif_hit_def: 0,
      Modif_wound_def: 0,
      Halve_damage: false,
      Reduce_damage_1: false,
      Cover: false,
    };
  }

  const handleProfileChange = (index, newProfile) => {
    setProfiles((prev) => {
      const copy = [...prev];
      copy[index] = newProfile;
      return copy;
    });
  };
  
  

  // Ouvre la modale en mode création
  const handleOpenCreateModal = () => {
    setUnitName("");
    setProfiles([getDefaultDefenseProfile()]);
    setEditUnitId(null);
    setOpenModal(true);
  };

  // Ouvre la modale en mode édition
  const handleOpenEditModal = (unit) => {
    setUnitName(unit.nom);
    setProfiles(unit.profils.length > 0 ? unit.profils : [getDefaultDefenseProfile()]);
    setEditUnitId(unit.id);
    setOpenModal(true);
  };

  // Supprimer une unité
  const handleDeleteUnit = async (unitId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette unité ?")) {
      try {
        await deleteDoc(doc(db, "unités_adverses", unitId));
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Créer ou modifier une unité
  const handleSaveUnit = async () => {
    if (!unitName.trim()) {
      alert("Merci de saisir un nom d'unité.");
      return;
    }

    const unitData = {
      nom: unitName.trim(),
      profils: profiles,
    };

    try {
      if (editUnitId) {
        // Modification
        const unitRef = doc(db, "unités_adverses", editUnitId);
        await updateDoc(unitRef, unitData);
      } else {
        // Création
        await addDoc(collection(db, "unités_adverses"), unitData);
      }
      setOpenModal(false);
      setUnitName("");
      setProfiles([getDefaultDefenseProfile()]);
      setEditUnitId(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
      background: "#DCFEFF",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Titre centré */}
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#2d3748", margin: 0 }}>
          Unités cibles
        </h1>
      </div>

      <button onClick={handleOpenCreateModal} style={{
            padding: "8px 16px",
            backgroundColor: "#38a169",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            width: "15%",
            marginLeft: 40
          }}> ➕ Ajouter une unité</button>

      {unites.length === 0 ? (
        <p>Aucune unité adverse pour l'instant.</p>
      ) : (
        <table style={{
          width: "95%",
          borderCollapse: "collapse",
          marginTop: 12,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#fefefe",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <thead style={{ backgroundColor: "#FFECE6" }}>
            <tr>
              <th style={styles.th}>Unités</th>
              <th style={styles.th}>Profils défensifs</th>
              <th colSpan={2} style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unites.map((unit) => (
              <tr key={unit.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={styles.td}><strong>{unit.nom}</strong></td>
                <td style={styles.td}>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {(unit.profils || []).map((p, i) => (
                      <li key={i} style={{ listStyleType: "none" }}>
                        Endurance: {p.Toughness}, Save: {p.Save}+, PV: {p.PV}, Nb modèles:{" "}
                        {p.Nb_of_models}
                        {p.Save_invu ? `, Save invu: ${p.Save_invu_X}+` : ""}
                        {p.Fnp ? `, FNP: ${p.Fnp_X}+` : ""}
                        {p.Halve_damage ? ", Divise dégâts par 2" : ""}
                        {p.Reduce_damage_1 ? ", Réduit les dégâts de 1": ""}
                        {p.Cover ? ", Couvert" : ""}
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleOpenEditModal(unit)} style={{
                          padding: "6px 10px",
                          backgroundColor: "#3182ce",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}> ✏️ Modifier</button>
                  </td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#e53e3e",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal création/édition unité */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 70,
            }}
            style={styles.overlay}
          >
            <div style={styles.modal}>
              <h2>{editUnitId ? "Modifier l'unité adverse" : "Ajouter une unité adverse"}</h2>
              <input
                type="text"
                placeholder="Nom de l'unité"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                style={styles.input}
              />

              {profiles.map((profile, index) => (
                <DefenseProfileCard
                  key={index}
                  profile={profile}
                  onChange={(newProfile) => handleProfileChange(index, newProfile)}
                  title={`Profil défensif #${index + 1}`}
                />
              ))}

              <div style={{ marginTop: 20 }}>
                <button onClick={handleSaveUnit} style={styles.buttonSecondary}>
                  {editUnitId ? "✅ Sauvegarder" : "✅ Créer l'unité"}
                </button>
                <button
                  onClick={() => setOpenModal(false)}
                  style={{ ...styles.buttonSecondary, marginLeft: 10 }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  th: {
    textAlign: "center",
    border: "1px solid #ccc",
    padding: 12,
    borderBottom: "1px solid #ddd",
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  },
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
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  buttonSecondary: {
    backgroundColor: "#eee",
    color: "#333",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
