import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { auth } from "../firebaseConfig";
import { where } from "firebase/firestore";


export default function UnitesAdversesPage() {
  const { t } = useTranslation();
  const [unites, setUnites] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [profiles, setProfiles] = useState([getDefaultDefenseProfile()]);
  const [editUnitId, setEditUnitId] = useState(null); // Pour savoir si on édite

  const [openPredefinedModal, setOpenPredefinedModal] = useState(false);
const [availableDatasheets, setAvailableDatasheets] = useState([]);
const [selectedArmy, setSelectedArmy] = useState("");
const [unitOptions, setUnitOptions] = useState([]);
const [selectedUnits, setSelectedUnits] = useState([]);

const [selectedDefenseListe, setSelectedDefenseListe] = useState(null);
const [selectedDefenseUniteNom, setSelectedDefenseUniteNom] = useState("");
const [selectedDefenseUnite, setSelectedDefenseUnite] = useState(null);
const [defenderParams, setDefenderParams] = useState({ profils: [getDefaultDefenseProfile()] });


const loadUnitsFromArmy = async (fileName) => {
  try {
    const res = await fetch(`/output/${fileName}`);
    const data = await res.json();

    // Transformation pour récupérer un tableau d'unités
    const unites = Object.entries(data).map(([nom, details]) => ({
      nom,
      ...details
    }));

    setUnitOptions(unites);
  } catch (err) {
    console.error("Erreur chargement datasheet :", err);
    alert("Impossible de charger ce fichier.");
  }
};


const toggleSelectedUnit = (unitName) => {
  setSelectedUnits((prev) =>
    prev.includes(unitName)
      ? prev.filter((u) => u !== unitName)
      : [...prev, unitName]
  );
};

const handleAddPredefinedUnits = async () => {
  const unitsToAdd = unitOptions.filter((u) => selectedUnits.includes(u.nom));
  const invalidUnits = [];

  for (const unit of unitsToAdd) {
    if (!unit.profiles || typeof unit.profiles !== "object") {
      console.warn(`Unit ${unit.nom} has no valid profiles object`);
      invalidUnits.push(unit.nom);
      continue;
    }

    const profilesBySection = unit.profiles;

    // Récupérer les profils défensifs (section "Unit" ou "Defensive Profile")
    const defensiveSection = profilesBySection["Unit"] || profilesBySection["Defensive Profile"] || [];
    const defensiveProfile = defensiveSection[0] || {}; // On prend le premier s’il existe
    const defensiveChar = defensiveProfile.characteristics || {};

    // Récupérer les descriptions depuis la section "Abilities"
    const abilitiesSection = profilesBySection["Abilities"] || [];
    const descFromAbilities = abilitiesSection
      .map((a) => a.characteristics?.Description || "")
      .join(" ");

    // Tentative de trouver une invu dans les descriptions
    let invu = defensiveChar.Save_invu || null;
    if (!invu) {
      const match = descFromAbilities.match(/([23456]\+)\s+invulnerable save/i);
      if (match) invu = match[1];
    }

    // Vérifier si le profil défensif est valide
    if (
      !defensiveChar ||
      (typeof defensiveChar === "object" && Object.keys(defensiveChar).length === 0) ||
      defensiveChar.T === undefined ||
      defensiveChar.T === ""
    ) {
      console.log("❌ Profil défensif invalide (sécurisé) :", defensiveChar);
      invalidUnits.push(unit.nom);
      continue;
    }

    // Construction du profil défensif
    const profile = {
      Save: (defensiveChar.SV || defensiveChar.Save || "6+").replace("+", ""),
      Save_invu: (invu || "N/A").replace("+", ""),
      Toughness: defensiveChar.T || "4",
      PV: parseInt(defensiveChar.W, 10) || 1,
      Nb_of_models: 1,
      Cover: false,
      Fnp: "N/A",
      Modif_hit_def: 0,
      Modif_wound_def: "0",
      Halve_damage: false,
      Reduce_damage_1: false,
      Reduce_PA_1: false
    };

    await addDoc(collection(db, "unités_adverses"), {
      nom: unit.nom,
      profils: [profile],
      userId: auth.currentUser.uid,
    });
  }

  if (invalidUnits.length > 0) {
    alert(`${t("unites_adv.alerts.invalid_profile")} \n\n- ${invalidUnits.join("\n- ")}`);
  }

  setSelectedDefenseUnite(null);
  setDefenderParams(null);
  setOpenPredefinedModal(false);
  setSelectedUnits([]);
  setUnitOptions([]);
  setSelectedArmy("");
};





useEffect(() => {
  if (selectedArmy) {
    loadUnitsFromArmy(selectedArmy);
  } else {
    setUnitOptions([]); // vide la liste si aucune armée sélectionnée
  }
}, [selectedArmy]);


  useEffect(() => {
    if (!auth.currentUser) return;
  
    const q = query(
      collection(db, "unités_adverses"),
      where("userId", "==", auth.currentUser.uid)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unitsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUnites(unitsData);
    });
  
    return () => unsubscribe();
  }, []);

  // Charger la liste des fichiers JSON disponibles (à adapter ou automatiser selon besoin)
  useEffect(() => {
    console.log("listes chargées");
    const files = [
      "Aeldari - Aeldari Library.json",
      "Chaos - Chaos Daemons Library.json",
      "Chaos - Chaos Knights Library.json",
      "Chaos - Chaos Knights.json",
      "Chaos - Chaos Space Marines.json",
      "Chaos - Death Guard.json",
      "Chaos - Emperor's Children.json",
      "Chaos - Thousand Sons.json",
      "Chaos - World Eaters.json",
      "Genestealer Cults.json",
      "Imperium - Adepta Sororitas.json",
      "Imperium - Adeptus Custodes.json",
      "Imperium - Adeptus Mechanicus.json",
      "Imperium - Agents of the Imperium.json",
      "Imperium - Astra Militarum - Library.json",
      "Imperium - Black Templars.json",
      "Imperium - Blood Angels.json",
      "Imperium - Dark Angels.json",
      "Imperium - Deathwatch.json",
      "Imperium - Grey Knights.json",
      "Imperium - Imperial Fists.json",
      "Imperium - Imperial Knights - Library.json",
      "Imperium - Iron Hands.json",
      "Imperium - Raven Guard.json",
      "Imperium - Salamanders.json",
      "Imperium - Space Marines.json",
      "Imperium - Space Wolves.json",
      "Imperium - Ultramarines.json",
      "Imperium - White Scars.json",
      "Leagues of Votann.json",
      "Library - Astartes Heresy Legends.json",
      "Library - Titans.json",
      "Necrons.json",
      "Orks.json",
      "T'au Empire.json",
      "Tyranids.json",
      "Unaligned Forces.json"
    ];
    setAvailableDatasheets(files);
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
      Modif_wound_def: "0",
      Halve_damage: false,
      Reduce_damage_1: false,
      Reduce_PA_1: false,
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
      try {
        await deleteDoc(doc(db, "unités_adverses", unitId));
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression.");
      }
    
  };

  // Créer ou modifier une unité
  const handleSaveUnit = async () => {
    if (!unitName.trim()) {
      alert(t("unites_adv.alerts.missing_name"));
      return;
    }

    const unitData = {
      nom: unitName.trim(),
      profils: profiles,
      userId: auth.currentUser.uid,
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
      alert(t("unites_adv.alerts.save_error"));
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
          {t("unites_adv.title")}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
  <button
    onClick={handleOpenCreateModal}
    style={{
      padding: "8px 16px",
      backgroundColor: "#38a169",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      width: "15%",
      marginRight: 20,
    }}
  >
    {t("unites_adv.add_manual_unit")}
  </button>

  <button
    onClick={() => setOpenPredefinedModal(true)
    }
    style={{
      padding: "8px 16px",
      backgroundColor: "#4299e1",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      width: "20%",
    }}
  >
    {t("unites_adv.add_predefined_unit")}
  </button>
</div>

      {unites.length === 0 ? (
        <p>{t("unites_adv.no_units")}</p>
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
              <th style={styles.th}>{t("unites_adv.table.unit_name")}</th>
              <th style={styles.th}>{t("unites_adv.table.defense_profiles")}</th>
              <th colSpan={2} style={styles.th}>{t("unites_adv.table.actions")}</th>
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
                        {t("unites_adv.profile.toughness")}: {p.Toughness}, {t("unites_adv.profile.save")}: {p.Save}+, {t("unites_adv.profile.pv")}: {p.PV}, {t("unites_adv.profile.nb_models")}{": "}
                        {p.Nb_of_models}
                        {p.Save_invu && p.Save_invu !== "N/A" ? `, ${t("unites_adv.profile.invu_save")}: ${p.Save_invu}+` : ""}
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
                        }}> {t("unites_adv.table.edit")}</button>
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
                    {t("unites_adv.table.delete")}
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
              <h2>{editUnitId ? t("unites_adv.modal.edit_title") : t("unites_adv.modal.create_title")}</h2>
              <input
                type="text"
                placeholder={t("unites_adv.modal.unit_name_placeholder")}
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                style={styles.input}
              />

              {profiles.map((profile, index) => (
                <DefenseProfileCard
                  key={index}
                  profile={profile}
                  onChange={(newProfile) => handleProfileChange(index, newProfile)}
                  title={`${t("unites_adv.table.defense_profiles")} `}
                />
              ))}

              <div style={{ marginTop: 20 }}>
                <button onClick={handleSaveUnit} style={styles.buttonSecondary}>
                  {editUnitId ? t("unites_adv.modal.update") : t("unites_adv.modal.save")}
                </button>
                <button
                  onClick={() => setOpenModal(false)}
                  style={{ ...styles.buttonSecondary, marginLeft: 10 }}
                >
                  {t("unites_adv.modal.cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
  {openPredefinedModal && (
    <motion.div
      key="predefined-modal"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          {t("unites_adv.predefined_modal.title")}
        </h2>

        <select
          value={selectedArmy}
          onChange={(e) => {
            setSelectedArmy(e.target.value);
            loadUnitsFromArmy(e.target.value);
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">{t("unites_adv.predefined_modal.select_army")}</option>
          {availableDatasheets.map((file) => (
            <option key={file} value={file}>
              {file.replace(".json", "")}
            </option>
          ))}
        </select>

        <h3>{t("unites_adv.predefined_modal.available_units")}</h3>
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {unitOptions.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#777" }}>
              {t("unites_adv.predefined_modal.no_units_to_display")}
            </p>
          ) : (
            [...unitOptions]
              .sort((a, b) => a.nom.localeCompare(b.nom))
              .map((unit) => (
                <div key={unit.nom}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(unit.nom)}
                      onChange={() => toggleSelectedUnit(unit.nom)}
                      style={{ marginRight: "8px" }}
                    />
                    {unit.nom}
                  </label>
                </div>
              ))

          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleAddPredefinedUnits}
            style={{
              backgroundColor: "#38a169",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {t("unites_adv.predefined_modal.add_selected_units")}
          </button>
          <button
            onClick={() => {
              setOpenPredefinedModal(false);
              setSelectedArmy("");
              setUnitOptions([]);
              setSelectedUnits([]);
            }}
            style={{
              backgroundColor: "#e53e3e",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("unites_adv.predefined_modal.cancel")}
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
