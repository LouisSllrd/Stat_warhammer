import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import AttackProfileCard from "./AttackProfileCard"; 
import { motion, AnimatePresence } from "framer-motion";



function MesListes() {

  const { t } = useTranslation();
  const [listes, setListes] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);

  const [loading, setLoading] = useState(false);

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

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
    
  };
  
  const [visibleProfiles, setVisibleProfiles] = useState(
    editAttackProfiles.map((_, i) => i) // tout visible par défaut
  );
  const toggleProfileVisibility = (index) => {
    setVisibleProfiles((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
    


  const defaultProfile = {
    Nb_weapons: 1,
    Attacks: "12",
    CT: 2,
    Auto_hit: false,
    Strength: "8",
    PA: "-2",
    Damage: "2",
    Sustained_hit: "N/A",
    Sustained_X: 1,
    Lethal_hit: false,
    Deva_wound: false,
    Modif_hit_att: 0,
    Modif_wound_att: 0,
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
    setLoading(true);
    if (!newListe || !newListe.nom || !Array.isArray(newListe.unites)) {
      console.error(t("mes_listes.errors.invalidList"), newListe);
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
      console.log(t("mes_listes.labels.listUpdated"));
    } catch (error) {
      console.error(t("mes_listes.labels.updateError"), error);
    }
    setLoading(false);
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
    setEditUnitIndex(null);
    setEditUnitName("");
    setEditAttackProfiles([defaultProfile]);
    setShowEditUnitModal(true);
  };
  

  const handleDeleteUnit = async (index) => {
    if (!selectedListe || !selectedListe.unites) return;
  
    // Fermer la modale si on supprime l’unité en cours d’édition
    if (editUnitIndex === index && showEditUnitModal) {
      setShowEditUnitModal(false);
      setEditUnitIndex(null);
    }
  
    const updatedUnits = selectedListe.unites.filter((_, i) => i !== index);
  
    setSelectedListe((prev) => ({ ...prev, unites: updatedUnits }));
    setTempListe((prev) => ({ ...prev, unites: updatedUnits }));
  
    try {
      const docRef = doc(db, "listes", selectedListe.id);
      await updateDoc(docRef, {
        unites: updatedUnits,
      });
      console.log(t("mes_listes.labels.unitDeleted"));
    } catch (error) {
      console.error(t("mes_listes.labels.deleteError"), error);
    }
  };
  
  
    // Supprimer une liste
  const handleDeleteListe = async () => {
    if (!selectedListe || !selectedListe.id) return;
  
    const confirmDelete = window.confirm(`${t("mes_listes.labels.confirmDeleteList")}${selectedListe.nom}" ?`);
    if (!confirmDelete) return;
  
    try {
      const docRef = doc(db, "listes", selectedListe.id);
      await deleteDoc(docRef);
      console.log("✅ Liste supprimée de Firestore");
  
      // Réinitialiser les états
      setSelectedListe(null);
      setSelectedListeId("");
      setShowEditUnitModal(false);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la liste :", error);
    }
  };
  

  // Sauvegarder l'unité éditée
  const handleSaveEditedUnit = async () => {
    setLoading(true);
    const newUnit = {
      nom: editUnitName,
      profils: editAttackProfiles.map((p) => ({
        nom: p.nom ?? "",
        Nb_weapons: p.Nb_weapons ?? 0,
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
        Modif_hit_att: p.Modif_hit_att ?? 0,
        Modif_wound_att: p.Modif_wound_att ?? 0,
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
    setLoading(false);
  };
  
  

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
        background: "#DCFEFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Titre centré */}
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#2d3748", margin: 0 }}>
          {t("mes_listes.titles.pageTitle")}
        </h1>
      </div>
  
      {/* Contenu en deux colonnes */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Colonne gauche */}
        <div style={{ width: "50%", padding: 32 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => {
            setTempListe({ nom: "", unites: [] });
            setShowCreationModal(true);
            setShowEditUnitModal(false);
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#38a169",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {t("mes_listes.buttons.createList")}
        </button>
  
        <select
          onChange={(e) => {
            const selectedId = e.target.value;
            setSelectedListeId(selectedId);

            if (selectedId) {
              fetchListe(selectedId);
            } else {
              // Si on revient à l'option "Sélectionner une liste", on vide l'affichage
              setSelectedListe(null);
            }
          }}
          value={selectedListeId}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "16px",
            color: "#333",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px 16px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            maxWidth: "100%",
          }}
        >
          <option value="">{t("mes_listes.placeholders.selectList")}</option>
          {listes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
            </option>
          ))}
        </select>

        </div>
        <AnimatePresence mode="wait">
        {selectedListe && (
        <motion.div 
        key={selectedListe.id} 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{
          duration: 0.1,
          ease: "easeInOut",
          type: "spring",
          stiffness: 70,
        }} style={{ marginTop: 24, flex: 1,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 16, }}>
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>
            {t("mes_listes.titles.listContent")} <span style={{ fontWeight: "bold" }}>{selectedListe.nom}</span>
          </h3>
  
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#fefefe",
            }}
          >
            <thead style={{ backgroundColor: "#ebf8ff" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>{t("mes_listes.labels.units")}</th>
                <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>{t("mes_listes.labels.profiles")}</th>
                <th colSpan={2} style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>
                  {t("mes_listes.labels.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(selectedListe.unites) && selectedListe.unites.length > 0 ? (
                selectedListe.unites.map((u, idx) => (
                  <tr key={idx}>
                    <td style={cellStyle}><strong>{u.nom}</strong></td>
                    <td style={cellStyle}>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {u.profils?.length > 0 ? (
                          <ol>
                          {u.profils.map((p, i) => (
                            <li key={i}>
                              <em>{p.nom || `${t("mes_listes.labels.profile")} ${i + 1}`}</em>{` (A: ${p.Attacks ?? "?"}, ${t("simulateur.attaquant.CT")}: ${p.CT ?? "?"}+, ${t("mes_listes.labels.F")}: ${p.Strength ?? "?"}, ${t("mes_listes.labels.PA")}: ${p.PA ?? "?"}, D: ${p.Damage ?? "?"})`}
                            </li>
                          ))}
                        </ol>
                        
                        ) : (
                          <li>{t("mes_listes.labels.noProfile")}</li>
                        )}
                      </ul>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleEditUnit(idx)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#3182ce",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        {t("mes_listes.buttons.edit")}
                      </button>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleDeleteUnit(idx)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#e53e3e",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        {t("mes_listes.buttons.delete")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: 12, textAlign: "center" }}>
                    {t("mes_listes.labels.noUnits")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
  
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleAddUnit}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2b6cb0",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {t("mes_listes.buttons.addUnit")}
            </button>
  
            <button
              onClick={handleDeleteListe}
              style={{
                padding: "8px 16px",
                backgroundColor: "#c53030",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {t("mes_listes.buttons.deleteList")}
            </button>
          </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      
    {/* Colonne droite */}
    <div
        style={{
          width: "50%",
          padding: 32,
          overflowY: "auto",
        }}
      >
    {/* Modales création et édition liste */}
    <AnimatePresence mode="wait">
    {showCreationModal && (
      
      <ListeModal
        open={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onSave={handleCreateListe}
        tempListe={tempListe}
        setTempListe={setTempListe}
        title={t("mes_listes.titles.createList")}
      />
    )}

    {showEditModal && (
      <ListeModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleModifierListe}
        tempListe={tempListe}
        setTempListe={setTempListe}
        title={t("mes_listes.titles.editList")}
      />
    )}

    {/* Modal d'édition d'une unité */}
    {showEditUnitModal ? (
      <motion.div
      key="result-block"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 70,
      }} style={{
        flex: 1, display: "flex", flexDirection: "column", gap: 16,
        backgroundColor: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>{isEditMode ? t("mes_listes.titles.editUnit") : t("mes_listes.titles.createUnit")}</h3>

        <input
          type="text"
          value={editUnitName}
          onChange={(e) => setEditUnitName(e.target.value)}
          placeholder={t("mes_listes.placeholders.unitName")}
          style={styles.input}
        />

        {editAttackProfiles.map((profile, index) => (
          <div
            key={index}
            style={styles.profileCard}
          >
            <button
              onClick={() => toggleProfileVisibility(index)}
              style={styles.buttonToggle}
            >
              {visibleProfiles.includes(index)
                ? `${t("mes_listes.labels.hideProfile")} ${profile.nom || `${t("mes_listes.labels.profile")} ${index + 1}`}`
                : `${t("mes_listes.labels.showProfile")} ${profile.nom || `${t("mes_listes.labels.profile")} ${index + 1}`}`}
            </button>

            {editAttackProfiles.length > 1 && (
              <button
                onClick={() => {
                  const filtered = editAttackProfiles.filter((_, i) => i !== index);
                  setEditAttackProfiles(filtered);
                  setVisibleProfiles((prev) => prev.filter((i) => i !== index));
                }}
                style={{... styles.buttonDelete, marginLeft: 10}}
              >
                {t("mes_listes.buttons.deleteProfile")}
              </button>
            )}

            {visibleProfiles.includes(index) && (
              <>
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
                  placeholder={`${t("mes_listes.placeholders.profileName")} ${index + 1}`}
                  style={styles.input}
                />

                <AttackProfileCard
                  profile={profile}
                  onChange={(newProfile) => {
                    const updatedProfiles = [...editAttackProfiles];
                    updatedProfiles[index] = {
                      ...newProfile,
                      nom: profile.nom,
                    };
                    setEditAttackProfiles(updatedProfiles);
                  }}
                />
              </>
            )}

            
          </div>
        ))}

        <button
          onClick={() =>
            setEditAttackProfiles((prev) => [...prev, { ...defaultProfile }])
          }
          style={styles.buttonPrimary}
        >
          {t("mes_listes.buttons.addAttackProfile")}
        </button>

        <div>
          <button onClick={handleSaveEditedUnit} style={styles.buttonSecondary}> 
          {loading ? t("mes_listes.buttons.saving") : t("mes_listes.buttons.save")}
          </button>
          <button
            onClick={() => setShowEditUnitModal(false)}
            style={{... styles.buttonSecondary, marginLeft: 10}}
          >
            {t("mes_listes.buttons.cancel")}
          </button>
        </div>
        </motion.div>
      ) : (
        <div style={{ height: "100%", border: "2px dashed #ccc", borderRadius: 8, padding: 20, color: "#aaa" }}>
          {t("mes_listes.titles.editOrAddUnit")}
        </div>
    )}
    </AnimatePresence>
  </div>
</div>

</div>
  );
}

export default MesListes;



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
    width: "97%",
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
