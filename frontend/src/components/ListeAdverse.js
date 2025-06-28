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
      Save_invu: false,
      Save_invu_X: 6,
      PV: 1,
      Nb_of_models: 1,
      Fnp: false,
      Fnp_X: 6,
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
    <div style={{ padding: 20 }}>
      <h1>Unités adverses</h1>
      <button onClick={handleOpenCreateModal}>Ajouter une unité</button>

      {unites.length === 0 ? (
        <p>Aucune unité adverse pour l'instant.</p>
      ) : (
        <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Profils défensifs</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unites.map((unit) => (
              <tr key={unit.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={styles.td}>{unit.nom}</td>
                <td style={styles.td}>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {(unit.profils || []).map((p, i) => (
                      <li key={i}>
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
                  <button onClick={() => handleOpenEditModal(unit)}>Modifier</button>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    style={{ marginLeft: 8, color: "red" }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal création/édition unité */}
      {openModal && (
        <div style={styles.overlay}>
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

            <div>
              <button onClick={handleSaveUnit}>
                {editUnitId ? "Sauvegarder" : "Créer l'unité"}
              </button>
              <button onClick={() => setOpenModal(false)} style={{ marginLeft: 10 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: {
    textAlign: "left",
    padding: 8,
    borderBottom: "1px solid #ccc",
  },
  td: {
    padding: 8,
    verticalAlign: "top",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
};
