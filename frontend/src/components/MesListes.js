import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import ListeModal from "./ListeModal";
import AttackProfileCard from "./AttackProfileCard"; // J'imagine que tu as ce composant


function MesListes() {
  const [listes, setListes] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);

  // Etat pour gérer la modale et la liste temporaire en création/édition
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempListe, setTempListe] = useState({ nom: "", unites: [] });

  // États pour édition unité
  const [editUnitIndex, setEditUnitIndex] = useState(null);
  const [editUnitName, setEditUnitName] = useState("");
  const [editAttackProfiles, setEditAttackProfiles] = useState([]);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);

  const [isEditMode, setIsEditMode] = useState(true); // true pour édition, false pour création

  
  
  const [visibleProfiles, setVisibleProfiles] = useState(
    editAttackProfiles.map((_, i) => i) // tout visible par défaut
  );
  const toggleProfileVisibility = (index) => {
    setVisibleProfiles((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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
  

  // Charger les listes de l'utilisateur
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "listes"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // Récupérer une liste précise par son id
  const fetchListe = async (id) => {
    const docRef = doc(db, "listes", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setSelectedListe({
        id,
        ...data,
        unites: Array.isArray(data.unites) ? data.unites : [],
      });
    }
  };

  // Création d'une nouvelle liste dans Firestore
  const handleCreateListe = async (units) => {
    await addDoc(collection(db, "listes"), {
      nom: tempListe.nom,
      unites: units,
      userId: auth.currentUser.uid,
    });
    setShowCreationModal(false);
    setTempListe({ nom: "", unites: [] });
  };

  // Modification d'une liste existante dans Firestore
  const handleModifierListe = async (newListe) => {
    if (!newListe || !newListe.nom || !Array.isArray(newListe.unites)) {
      console.error("❌ Liste invalide :", newListe);
      return;
    }
  
    const docRef = doc(db, "listes", selectedListe.id);
    try {
      await updateDoc(docRef, {
        nom: newListe.nom,
        unites: newListe.unites,
      });
  
      setShowEditModal(false);
      setTempListe({ nom: "", unites: [] });
  
      fetchListe(selectedListe.id);
      console.log("✅ Liste mise à jour dans Firestore");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour Firestore :", error);
    }
  };
  

  // Ouvrir la modale d'édition d'une unité
  const handleEditUnit = (index) => {
    setIsEditMode(true);
    const unitToEdit = selectedListe.unites[index];
    setEditUnitIndex(index);
    setEditUnitName(unitToEdit.nom);
    setEditAttackProfiles(unitToEdit.profils);
    setShowEditUnitModal(true);
  };

  const handleAddUnit = () => {
    setIsEditMode(false);
    setEditUnitName("");
    setEditAttackProfiles([defaultProfile]);
    setShowEditUnitModal(true);
  };
  

  // Supprimer une unité
  const handleDeleteUnit = async (index) => {
    if (!selectedListe || !selectedListe.unites) return;
  
    // 1. Crée une copie mise à jour sans l’unité à l’index donné
    const updatedUnits = selectedListe.unites.filter((_, i) => i !== index);
  
    // 2. Mets à jour localement
    setSelectedListe((prev) => ({ ...prev, unites: updatedUnits }));
    setTempListe((prev) => ({ ...prev, unites: updatedUnits }));
  
    // 3. Mets à jour dans Firestore
    try {
      const docRef = doc(db, "listes", selectedListe.id);
      await updateDoc(docRef, {
        unites: updatedUnits,
      });
      console.log("✅ Unité supprimée dans Firestore");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression dans Firestore :", error);
    }
  };
  
    // Supprimer une liste
  const handleDeleteListe = async () => {
    if (!selectedListe || !selectedListe.id) return;
  
    const confirmDelete = window.confirm(`Supprimer la liste "${selectedListe.nom}" ?`);
    if (!confirmDelete) return;
  
    try {
      const docRef = doc(db, "listes", selectedListe.id);
      await deleteDoc(docRef);
      console.log("✅ Liste supprimée de Firestore");
  
      // Réinitialiser les états
      setSelectedListe(null);
      setSelectedListeId("");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la liste :", error);
    }
  };
  

  // Sauvegarder l'unité éditée
  const handleSaveEditedUnit = async () => {
    const newUnit = {
      nom: editUnitName,
      profils: editAttackProfiles.map((p) => ({
        nom: p.nom ?? "",
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
      })),
    };
  
    let updatedUnits;
    if (editUnitIndex === null) {
      // Création
      updatedUnits = [...(selectedListe?.unites ?? []), newUnit];
    } else {
      // Édition
      updatedUnits = [...selectedListe.unites];
      updatedUnits[editUnitIndex] = newUnit;
    }
  
    // Mise à jour localement
    setTempListe((prev) => ({ ...prev, unites: updatedUnits }));
    setSelectedListe((prev) => ({ ...prev, unites: updatedUnits }));
  
    // Mise à jour Firestore
    if (selectedListe?.id) {
      try {
        const docRef = doc(db, "listes", selectedListe.id);
        await updateDoc(docRef, { unites: updatedUnits });
        console.log("✅ Unité ajoutée/modifiée dans Firestore");
      } catch (error) {
        console.error("❌ Erreur lors de la mise à jour :", error);
      }
    }
  
    setShowEditUnitModal(false);
  };
  
  

  return (
    <div>
      <h2>Mes Listes</h2>

      <button
        onClick={() => {
          setTempListe({ nom: "", unites: [] });
          setShowCreationModal(true);
        }}
      >
        Créer une nouvelle liste
      </button>

      <select
        onChange={(e) => {
          setSelectedListeId(e.target.value);
          fetchListe(e.target.value);
        }}
        value={selectedListeId}
      >
        <option value="">-- Sélectionner une liste --</option>
        {listes.map((l) => (
          <option key={l.id} value={l.id}>
            {l.nom}
          </option>
        ))}
      </select>

      {selectedListe && (
        <div>
          <h3>Contenu de la liste {selectedListe.nom}</h3>
          <table>
            <thead>
              <tr>
                <th>Unité</th>
                <th>Profils</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(selectedListe.unites) &&
              selectedListe.unites.length > 0 ? (
                selectedListe.unites.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.nom}</td>
                    <td>
                      <ul>
                        {Array.isArray(u.profils) && u.profils.length > 0 ? (
                          u.profils.map((p, i) => (
                            <li key={i}>{`${p.nom ?? `Profil ${i + 1}` } (Att: ${
                              p.Attacks ?? "?"
                            }, CC/CT: ${p.CT ?? "?"}+, F: ${
                              p.Strength ?? "?"
                            }, PA: ${p.PA ?? "?"}, D: ${p.Damage ?? "?"})`}</li>
                          ))
                        ) : (
                          <li>Aucun profil</li>
                        )}
                      </ul>
                    </td>
                    {/* Modifier */}
                    <td>
                      <button onClick={() => handleEditUnit(idx)}>Modifier</button>
                    </td>
                    {/* Supprimer */}
                    <td>
                      <button onClick={() => handleDeleteUnit(idx)}>Supprimer</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Aucune unité disponible</td>
                </tr>
              )}
            </tbody>
          </table>

          <button
            onClick={handleAddUnit}
            /*style={{ backgroundColor: "green", color: "white", marginTop: 10 }}*/
            >
            Ajouter une unité
            </button>

          <button
            /*style={{ marginLeft: 10, backgroundColor: "red", color: "white" }}*/
            onClick={handleDeleteListe}
            >
            Supprimer la liste
            </button>

        </div>
      )}

      {/* Modales création et édition liste */}
      {showCreationModal && (
        <ListeModal
          open={showCreationModal}
          onClose={() => setShowCreationModal(false)}
          onSave={handleCreateListe}
          tempListe={tempListe}
          setTempListe={setTempListe}
          title="Créer une nouvelle liste"
        />
      )}

      {showEditModal && (
        <ListeModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleModifierListe}
          tempListe={tempListe}
          setTempListe={setTempListe}
          title="Modifier la liste"
        />
      )}

      {/* Modal d'édition d'une unité */}
      {showEditUnitModal && (
        <div style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: 20,
          zIndex: 1000,
          width: 400,
          maxHeight: "80vh",
          overflowY: "auto",
        }}>
          <h3>{isEditMode ? "Modifier l'unité" : "Créer une nouvelle unité"}</h3>


          <input
            type="text"
            value={editUnitName}
            onChange={(e) => setEditUnitName(e.target.value)}
            placeholder="Nom de l'unité"
            style={{ width: "100%", marginBottom: 10, padding: 5 }}
          />

          {editAttackProfiles.map((profile, index) => (
            <div
              key={index}
              style={{
                marginBottom: 10,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: "#f9f9f9",
              }}
            >
              <button
                onClick={() => toggleProfileVisibility(index)}
                style={{
                  marginBottom: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  backgroundColor: "#3182ce",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                {visibleProfiles.includes(index)
                ? `Cacher ${profile.nom || `Profil ${index + 1}`}`
                : `Afficher ${profile.nom || `Profil ${index + 1}`}`}
              </button>

              {visibleProfiles.includes(index) && (
                <>
                  {/* Champ pour le nom du profil */}
                  <input
                    type="text"
                    value={profile.nom || ""}
                    onChange={(e) => {
                      const updatedProfiles = [...editAttackProfiles];
                      updatedProfiles[index] = {
                        ...profile,
                        nom: e.target.value,
                      };
                      setEditAttackProfiles(updatedProfiles);
                    }}
                    placeholder={`Nom du profil ${index + 1}`}
                    style={{
                      width: "100%",
                      marginBottom: 8,
                      padding: 6,
                    }}
                  />

                  {/* Carte du profil */}
                  <AttackProfileCard
                    profile={profile}
                    onChange={(newProfile) => {
                      const updatedProfiles = [...editAttackProfiles];
                      updatedProfiles[index] = {
                        ...newProfile,
                        nom: profile.nom, // garder le nom en dehors d'AttackProfileCard
                      };
                      setEditAttackProfiles(updatedProfiles);
                    }}
                  />
                </>
              )}

              {editAttackProfiles.length > 1 && (
                <button
                  onClick={() => {
                    const filtered = editAttackProfiles.filter((_, i) => i !== index);
                    setEditAttackProfiles(filtered);
                    setVisibleProfiles((prev) => prev.filter((i) => i !== index));
                  }}
                  style={{ marginTop: 5, backgroundColor: "#fdd", color: "#900" }}
                >
                  Supprimer ce profil
                </button>
              )}
            </div>
          ))}


          <button
            onClick={() =>
              setEditAttackProfiles((prev) => [...prev, { ...defaultProfile }])
            }
            style={{ marginBottom: 10 }}
          >
            + Ajouter un profil d'attaque
          </button>


          <button onClick={handleSaveEditedUnit}>Sauvegarder</button>
          <button
            onClick={() => setShowEditUnitModal(false)}
            style={{ marginLeft: 10 }}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

export default MesListes;
