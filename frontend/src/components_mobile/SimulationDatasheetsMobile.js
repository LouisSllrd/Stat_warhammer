import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Composants externes (si tu les utilises encore)
import AttackProfileCard from "./AttackProfileCardMobile";
import DefenseProfileCard from "./DefenseProfileCardMobile";

function SimulationDatasheetsMobile() {
  const { t } = useTranslation();
  const [availableDatasheets, setAvailableDatasheets] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);
  const [selectedUniteNom, setSelectedUniteNom] = useState("");
  const [selectedUnite, setSelectedUnite] = useState(null);

  const [selectedDefenseListeId, setSelectedDefenseListeId] = useState("");
const [selectedDefenseListe, setSelectedDefenseListe] = useState(null);
const [selectedDefenseUniteNom, setSelectedDefenseUniteNom] = useState("");
const [selectedDefenseUnite, setSelectedDefenseUnite] = useState(null);


  const [enemyUnitName, setEnemyUnitName] = useState("");
  const [enemyUnit, setEnemyUnit] = useState(null);
  const [defenderParams, setDefenderParams] = useState(null);

  const [visibleProfiles, setVisibleProfiles] = useState({});
  const [selectedProfiles, setSelectedProfiles] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showFullResults, setShowFullResults] = useState(false);
  const [visibleDefenseProfile, setVisibleDefenseProfile] = useState(false);
  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  };
  const [showWelcome, setShowWelcome] = useState(true);

  const Modal = ({ children, onClose }) => {
    return (
      <AnimatePresence>
      <motion.div
      key="modal-overlay"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration: 0.1,
        ease: "easeOut",
        type: "spring",
        stiffness: 70,
      }}
         style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 12,
          maxWidth: 800,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#999"
            }}
          >
            &times;
          </button>
          {children}
        </div>
        </motion.div>
      </AnimatePresence>
    );
  };


  // Charger la liste des fichiers JSON disponibles (à adapter ou automatiser selon besoin)
  useEffect(() => {
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

  // Charger une liste à partir du fichier JSON
  const fetchListeFromJson = async (filename) => {
    try {
      const res = await fetch(`/output/${filename}`);
      const data = await res.json();
  
      const allUnits = Object.entries(data).map(([unitName, unitData]) => {
        const profiles = [];

            const profileSections = unitData.profiles || {};

            Object.entries(profileSections).forEach(([sectionName, profileList]) => {
            profileList.forEach((p) => {
                // Correction robuste : certaines entrées ont characteristics, d'autres non
                let characteristics = {};
                if (p.characteristics) {
                characteristics = p.characteristics;
                } else {
                // On suppose que les clés sont directement dans p
                const { name, ...rest } = p;
                characteristics = rest;
                }

                profiles.push({
                section: sectionName,
                name: p.name || "",
                characteristics,
                });

            });
            });

  
        return {
          nom: unitName,
          profils: profiles
        };
      });
      allUnits.sort((a, b) => a.nom.localeCompare(b.nom, undefined, { sensitivity: 'base' }));
      setSelectedListe({ id: filename, unites: allUnits });
      setSelectedUniteNom("");
      setSelectedUnite(null);
    } catch (err) {
      console.error("Erreur chargement JSON :", err);
      alert("Erreur lors du chargement du fichier.");
    }
  };
  
  const fetchDefenseListeFromJson = async (filename) => {
    try {
      const res = await fetch(`/output/${filename}`);
      const data = await res.json();
  
      const allUnits = Object.entries(data).map(([unitName, unitData]) => {
        const profiles = [];
  
        const profileSections = unitData.profiles || {};
  
        Object.entries(profileSections).forEach(([sectionName, profileList]) => {
          profileList.forEach((p) => {
            let characteristics = {};
            if (p.characteristics) {
              characteristics = p.characteristics;
            } else {
              const { name, ...rest } = p;
              characteristics = rest;
            }
  
            profiles.push({
              section: sectionName,
              name: p.name || "",
              characteristics,
            });
          });
        });
  
        return {
          nom: unitName,
          profils: profiles
        };
      });
      allUnits.sort((a, b) => a.nom.localeCompare(b.nom, undefined, { sensitivity: 'base' }));
      setSelectedDefenseListe({ id: filename, unites: allUnits });
      setSelectedDefenseUniteNom("");
      setSelectedDefenseUnite(null);
    } catch (err) {
      console.error("Erreur chargement JSON défense :", err);
      alert("Erreur lors du chargement du fichier défenseur.");
    }
  };
  
  

  // Lorsqu’une unité est sélectionnée
  useEffect(() => {
    if (!selectedListe || !selectedUniteNom) return;
  
    const unit = selectedListe.unites.find((u) => u.nom === selectedUniteNom);
  
    if (!unit) {
      setSelectedUnite(null);
      return;
    }
  
    const weaponProfiles = unit.profils.filter(
      (p) => p.section === "Melee Weapons" || p.section === "Ranged Weapons"
    );
  
    if (weaponProfiles.length === 0) {
      alert(`${t("datasheets.alert_unit")} ${unit.nom}${t("datasheets.alert_no_weapon")}`);
    
      setSelectedUnite({
        ...unit,
        profils: [
          {
            name: t("datasheets.generic_attack"),
            Nb_weapons: 1,
            Attacks: "1",
            CT: "4",
            Strength: "4",
            PA: "0",
            Damage: "1",
            Sustained_hit: "0",
            Lethal_hit: false,
            Deva_wound: false,
            Modif_hit_att: 0,
            Modif_wound_att: 0,
            Re_roll_hit: "N/A",
            Re_roll_wound: "N/A",
            Blast: false,
            Melta: 0,
            Crit_on_X_to_hit: 6,
            Crit_on_X_to_wound: 6,
            isFallback: true, // <--- utile pour l’interface
          },
        ],
      });
      return;
    }
    
    
  
    const attackProfiles = weaponProfiles.map((p) => {
      const c = p.characteristics || {};
      const isMelee = p.section === "Melee Weapons";
      const keywords = (c.Keywords || "").toLowerCase();
  
      const sustainedMatch = (c.Keywords || "").match(/sustained hits\s+([^\s,]+)/i);
      const sustained = sustainedMatch ? sustainedMatch[1] : "0";
      const lethal = keywords.includes("lethal hits");
      const deva = keywords.includes("devastating wounds");
      const twin_linked = keywords.includes("twin-linked") ? "Relance des blessures ratées" : "N/A";
      const blast = keywords.includes("blast");
      const meltaMatch = (c.Keywords || "").match(/melta\s+([^\s,]+)/i);
      const melta = meltaMatch ? meltaMatch[1] : 0;
  
      return {
        name: p.name,
        Nb_weapons: 1,
        Attacks: c.A || "",
        CT: isMelee ? (c.WS || "Torrent").replace("+", "").replace("N/A", "Torrent") : (c.BS || "Torrent").replace("+", "").replace("N/A", "Torrent"),
        Strength: c.S || "",
        PA: c.AP || "",
        Damage: c.D || "",
        Sustained_hit: sustained,
        Lethal_hit: lethal,
        Deva_wound: deva,
        Modif_hit_att: 0,
        Modif_wound_att: 0,
        Re_roll_hit: "N/A",
        Re_roll_wound: twin_linked,
        Blast: blast,
        Melta: melta,
        Crit_on_X_to_hit: 6,
        Crit_on_X_to_wound: 6,
      };
    });
  
    setSelectedUnite({
      ...unit,
      profils: attackProfiles,
    });
  }, [selectedUniteNom, selectedListe]);
  
  useEffect(() => {
    if (!selectedDefenseListe || !selectedDefenseUniteNom) return;
  
    const unit = selectedDefenseListe.unites.find((u) => u.nom === selectedDefenseUniteNom);
    if (!unit) {
      setSelectedDefenseUnite(null);
      return;
    }
  
    const possibleDefensiveProfiles = unit.profils.filter(p =>
      ["Unit", "Defensive Profile"].includes(p.section)
    );
  
    if (possibleDefensiveProfiles.length === 0) {
      alert(`${t("datasheets.alert_unit")} ${unit.nom}${t("datasheets.alert_no_defense")}`);
    
      const profileFormatted = {
        Save: "4",
        Save_invu: "N/A",
        Toughness: "4",
        PV: 1,
        Nb_of_models: 1,
        Cover: false,
        Fnp: "N/A",
        Modif_hit_def: 0,
        Modif_wound_def: 0,
        Halve_damage: false,
        Reduce_damage_1: false,
        isFallback: true, // <--- utile pour l’interface
      };
    
      setSelectedDefenseUnite(unit);
      setDefenderParams({ profils: [profileFormatted] });
      return;
    }
    
    
  
    const defensiveProfile = possibleDefensiveProfiles[0];
    const defensiveChar = defensiveProfile?.characteristics || {};
  
    let invu = defensiveChar.Save_invu || null;
  
    if (!invu) {
      const abilityProfiles = unit.profils.filter(p => p.section === "Abilities");
      for (const ability of abilityProfiles) {
        const desc = ability.characteristics?.Description || "";
        const match = desc.match(/([23456]\+)\s+invulnerable save/i);
        if (match) {
          invu = match[1];
          break;
        }
      }
    }
  
    const profileFormatted = {
      Save: (defensiveChar.SV || defensiveChar.Save || "6+").replace("+", ""),
      Save_invu: (invu || "N/A").replace("+", ""),
      Toughness: defensiveChar.T || "4",
      PV: parseInt(defensiveChar.W, 10) || 1,
      Nb_of_models: 1,
      Cover: false,
      Fnp: "N/A",
      Modif_hit_def: 0,
      Modif_wound_def: 0,
      Halve_damage: false,
      Reduce_damage_1: false,
    };
  
    setSelectedDefenseUnite(unit);
    setDefenderParams({ profils: [profileFormatted] });
  }, [selectedDefenseUniteNom, selectedDefenseListe]);
  
  // Initialise les profils visibles et sélectionnés
  useEffect(() => {
    if (!selectedUnite) return;
  
    const initVisible = {};
    const initSelected = {};
  
    selectedUnite.profils.forEach((_, i) => {
      initVisible[i] = false;
      initSelected[i] = true;
    });
  
    setVisibleProfiles(initVisible);
    setSelectedProfiles(initSelected);
  }, [selectedUniteNom]); 
  

  const handleAttackProfileChange = (updatedProfile, index) => {
    const updatedProfils = [...selectedUnite.profils];
    updatedProfils[index] = updatedProfile;
  
    setSelectedUnite((prev) => ({
      ...prev,
      profils: updatedProfils,
    }));
  };
  

  const handleDefenderChange = (newProfile) => {
    setDefenderParams({ ...defenderParams, ...newProfile });
  };

  const handleSubmit = async () => {
    setResults(null);
    setLoading(true);

    try {
      const profilsToSend = selectedUnite.profils.filter((_, i) => selectedProfiles[i]);

      const parsedAttackProfiles = profilsToSend.map((params) => {
        const parsedParams = { ...params };
        Object.keys(parsedParams).forEach((key) => {
          if (!["Attacks", "Strength", "PA", "Damage", "Sustained_hit", "CT", "Re_roll_hit", "Re_roll_wound"].includes(key)) {
            parsedParams[key] = Number(parsedParams[key]);
          }
        });
        parsedParams.Sustained_hit = String(parsedParams.Sustained_hit);
        parsedParams.Re_roll_hit = String(parsedParams.Re_roll_hit);
        parsedParams.Re_roll_wound = String(parsedParams.Re_roll_wound);
        parsedParams.CT = String(parsedParams.CT);
        return parsedParams;
      });


      const parsedDefenderProfile = { ...defenderParams.profils[0] };
      parsedDefenderProfile.Save_invu = String(parsedDefenderProfile.Save_invu);
      parsedDefenderProfile.Fnp = String(parsedDefenderProfile.Fnp);

      const res = await axios.post("https://statwarhammer-production-871f.up.railway.app/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });

      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation :", error);
      console.log(error.response?.data)
      alert("Erreur lors de la simulation. Vérifie la console.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: 32, fontFamily: "Segoe UI, sans-serif", background: "#DCFEFF", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center", color: "#2d3748" }}> {t("accueil.generic.predef_title")}</h1>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 24, flexWrap: "wrap", flexDirection: "row" }}>
      
      {/* Profils d'attaque */}
      <div style={{ flex: 1, minWidth: 320 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>⚔️ {t("multi.attack_profiles")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
  {/* Sélection du fichier JSON */}
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontWeight: "bold", marginBottom: 4 }}>
    {t("datasheets.choose_faction")} :
    </label>
    <select
      value={selectedListeId}
      onChange={(e) => {
        const file = e.target.value;
        setSelectedListeId(file);
        fetchListeFromJson(file);
      }}
      style={{
        padding: "8px",
        borderRadius: 6,
        border: "1px solid #ccc",
        backgroundColor: "#fff"
      }}
    >
      <option value="">-- {t("datasheets.choose_faction")} --</option>
      {availableDatasheets.map((file) => (
        <option key={file} value={file}>
          {file.replace(".json", "")}
        </option>
      ))}
    </select>
  </div>

  {/* Sélection d'une unité */}
  {selectedListe && (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontWeight: "bold", marginBottom: 4 }}>
      {t("datasheets.choose_attacker_unit")} :
      </label>
      <select
        value={selectedUniteNom}
        onChange={(e) => setSelectedUniteNom(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: 6,
          border: "1px solid #ccc",
          backgroundColor: "#fff"
        }}
      >
        <option value="">-- {t("datasheets.choose_attacker_unit")} --</option>
        {selectedListe.unites.map((u, idx) => (
          <option key={idx} value={u.nom}>
            {u.nom}
          </option>
        ))}
      </select>
    </div>
  )}
</div>

      
      {selectedUnite && (
        <>
          
          <AnimatePresence mode="wait">
            {selectedUnite.profils.map((profil, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() =>
                      setVisibleProfiles(prev => ({ ...prev, [i]: !prev[i] }))
                    }
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#2b6cb0",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {visibleProfiles[i]
                      ? `${t("datasheets.hide")} ${profil.name || `${t("datasheets.profil")} ${i + 1}`}`
                      : `${t("datasheets.show")} ${profil.name || `${t("datasheets.profil")} ${i + 1}`}`}
                  </button>
  
                  <label style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={selectedProfiles[i] || false}
                      onChange={(e) =>
                        setSelectedProfiles((prev) => ({
                          ...prev,
                          [i]: e.target.checked,
                        }))
                      }
                      style={{ transform: "scale(2)", marginRight: 8 }}
                    />
                    {t("datasheets.include")}
                  </label>
                  </div>
                </div>
  
                {visibleProfiles[i] && (
                  <div style={{ marginTop: 12 }}>
                    <AttackProfileCard
                      profile={profil}
                      onChange={(updatedProfile) => handleAttackProfileChange(updatedProfile, i)}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
  
          
        </>
      )}
      </div>
      <div style={{ flex: 1, minWidth: 320 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>🛡️ {t("simulateur.defender")}</h2>
    
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
  {/* Sélection du fichier JSON pour le défenseur */}
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontWeight: "bold", marginBottom: 4 }}>
    {t("datasheets.choose_faction")} :
    </label>
    <select
      value={selectedDefenseListeId}
      onChange={(e) => {
        const file = e.target.value;
        setSelectedDefenseListeId(file);
        fetchDefenseListeFromJson(file);
      }}
      style={{
        padding: "8px",
        borderRadius: 6,
        border: "1px solid #ccc",
        backgroundColor: "#fff"
      }}
    >
      <option value="">-- {t("datasheets.choose_faction")}  --</option>
      {availableDatasheets.map((file) => (
        <option key={file} value={file}>
          {file.replace(".json", "")}
        </option>
      ))}
    </select>
  </div>

  {/* Choix de l’unité défenseur */}
  {selectedDefenseListe && (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontWeight: "bold", marginBottom: 4 }}>
      {t("datasheets.choose_defender_unit")} :
      </label>
      <select
        value={selectedDefenseUniteNom}
        onChange={(e) => setSelectedDefenseUniteNom(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: 6,
          border: "1px solid #ccc",
          backgroundColor: "#fff"
        }}
      >
        <option value="">-- {t("datasheets.choose_defender_unit")} --</option>
        {selectedDefenseListe.unites.map((u, idx) => (
          <option key={idx} value={u.nom}>
            {u.nom}
          </option>
        ))}
      </select>
    </div>
  )}
</div>

{defenderParams && (
  <>

  <motion.div
    key="results-block"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{
      duration: 0.7,
      ease: "easeOut",
      type: "spring",
      stiffness: 70,
    }}
    style={{
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: 16,
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.04)",
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <button
      onClick={() => setVisibleDefenseProfile((prev) => !prev)}
      style={{
        padding: "8px 16px",
        backgroundColor: "#2b6cb0",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.3s",
        fontSize: 14,
        alignSelf: "flex-start",
      }}
    >
    {visibleDefenseProfile ? t("datasheets.hide_defense_profile") : t("datasheets.show_defense_profile")}
  </button>

    {visibleDefenseProfile && (
      <DefenseProfileCard
        profile={defenderParams.profils[0]}
        onChange={(newProfile) => {
          const newParams = { ...defenderParams };
          newParams.profils[0] = newProfile;
          setDefenderParams(newParams);
        }}
      />
    )}


  </motion.div>
  </>
  
)}
<button
onClick={handleSubmit}
disabled={loading}
style={{
  marginTop: 24,
  padding: "10px 16px",
  fontSize: 16,
  backgroundColor: loading ? "#999" : "#2f855a",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
}}
>
{loading ? t("simulateur.simulation_en_cours") : t("simulateur.lancer")}
</button>
      </div>

  
      {/* Résultats */}
    <AnimatePresence>
  {results && (
    <Modal onClose={() => setResults(null)}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: "bold" }}> {t("simulateur.resultats")} :</h2>
    </div>

    {/* Résumé */}
    <div style={{ marginBottom: 24 }}>
              <p>
                ➢ {t("simulateur.moyenne")} : <strong>{results.mean.toFixed(1)}</strong> {"(±"} {results.std.toFixed(0)} {")"} {results.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")} , {t("simulateur.soit")} {results.relative_damages.toFixed(0)}% {t("simulateur.de_force_init")}
              </p>
              <p>
                ➢ <strong style={{
                  color:
                    results.proba_unit_killed < 30 ? "red" :
                    results.proba_unit_killed < 60 ? "orange" :
                    results.proba_unit_killed < 80 ? "gold" :
                    "green"
                }}>
                  {results.proba_unit_killed.toFixed(0)}%
                </strong> {t("simulateur.de_chance_tuer_ennemi")}
      </p>
    </div>
    <button
      onClick={() => setShowFullResults(!showFullResults)}
      style={{
        padding: "8px 12px",
        backgroundColor: "#3182ce",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
    {showFullResults ? t("simulateur.afficher_moins") : t("simulateur.afficher_plus")}
  </button>


    {/* Affichage complet */}
    {showFullResults && (
      <div>
        <p><strong>{t("simulateur.unite_mesure")} :</strong> {results.unit_descr === "Nombre de PV perdus"
                                    ? t("simulateur.unit_PV")
                                    : t("simulateur.unit_figs")}
              </p>
        <p><strong>{t("simulateur.moyenne")} :</strong> <strong>{results.mean.toFixed(1)}</strong> {results.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")}, {t("simulateur.soit")}{" "}
                {results.relative_damages.toFixed(0)}% {t("simulateur.de_force_init")}
              </p>
                <p>
                  <strong>{t("simulateur.ecart_type")} :</strong> {results.std.toFixed(1)}
                </p>

        {/* Graphiques */}
        <div style={{ display: "flex", gap: 32, marginTop: 24, flexWrap: "wrap" }}>
  
          {/* Distribution */}
          <div style={{ flex: "1 1 0", minWidth: 350 }}>
            <h4 style={{ fontWeight: "bold", marginBottom: 12 }}>
            {t("simulateur.distribution")}
            </h4>
            <BarChart width={400} height={300} data={results.histogram_data}>
              <XAxis dataKey="value" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#3182ce" />
            </BarChart>
          </div>

          {/* Courbe cumulative */}
          <div style={{ flex: "1 1 0", minWidth: 350 }}>
            <h4 style={{ fontWeight: "bold", marginBottom: 12 }}>
            {t("simulateur.probabilite_seuil")}
            </h4>
            <LineChart width={400} height={300} data={results.cumulative_data}>
              <CartesianGrid stroke="#ccc" />
              <XAxis
                      dataKey="value"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isTarget = payload.value === results.initial_force;
                        const color = isTarget
                          ? results.mean >= results.initial_force
                            ? "green"
                            : "red"
                          : "#666";
                        return (
                          <text
                            x={x}
                            y={y + 10}
                            textAnchor="middle"
                            fill={color}
                            fontWeight={isTarget ? "bold" : "normal"}
                          >
                            {payload.value}+
                          </text>
                        );
                      }}
                    />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative_percent" stroke="#2b6cb0" />
            </LineChart>
          </div>

        </div>


        {/* Tableau */}
                {results.results_catalogue && (
                  <div style={{ marginTop: 32 }}>
                    <h4 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
                    {t("simulateur.comparaison_unites")}
                    </h4>
                    <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fefefe" }}>
                      <thead style={{ backgroundColor: "#ebf8ff" }}>
                        <tr>
                        <th style={cellStyle}>{t("simulateur.unit")}</th>
                        <th style={cellStyle}>{t("simulateur.moyenne")}</th>
                        <th style={cellStyle}>{t("simulateur.ecart_type")}</th>
                        <th style={cellStyle}>{t("simulateur.force_initiale")}</th>
                        <th style={cellStyle}>{t("simulateur.degats_relatifs")}</th>
                      </tr>
              </thead>
              <tbody>
                {Object.entries(results.results_catalogue).map(([unitName, stats]) => (
                  <tr key={unitName}>
                    <td style={cellStyle}>{unitName} {stats.unit ? `(${t("simulateur.en")} ${stats.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")})` : ""}
                            </td>
                    <td style={cellStyle}>{stats.mean.toFixed(1)}</td>
                    <td style={cellStyle}>{stats.std.toFixed(1)}</td>
                    <td style={cellStyle}>{stats.initial_force}</td>
                            <td style={cellStyle}>
                            <strong style={{
                              color:
                              stats.relative_damages < 30 ? "red" :
                              stats.relative_damages < 60 ? "orange" :
                              stats.relative_damages < 80 ? "gold" :
                                "green"
                            }}>{stats.relative_damages.toFixed(0)}% </strong>
                            </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </Modal>
  )}
</AnimatePresence>

</div>{showWelcome && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "24px 32px",
        borderRadius: 12,
        maxWidth: 600,
        position: "relative",
        boxShadow: "0 0 20px rgba(0,0,0,0.25)",
        textAlign: "left",
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.6,
      }}
    >
      {/* Bouton de fermeture en haut */}
      <button
        onClick={() => setShowWelcome(false)}
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          border: "none",
          background: "transparent",
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h2 style={{ marginBottom: 12 }}>{t("datasheets.welcome.title")}</h2>

      <p>
        {t("datasheets.welcome.source_notice")}
        <br />
        <strong>{t("datasheets.welcome.source_name")}</strong> —&nbsp;
        <a
          href={t("datasheets.welcome.source_url")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("datasheets.welcome.source_url")}
        </a>
        , {t("datasheets.welcome.license")}
      </p>

      <p>
        <strong>{t("datasheets.welcome.incomplete_profiles")}</strong>
      </p>

      <p>
        <strong>{t("datasheets.welcome.attacker_preset")}</strong>
        <br />
        {t("datasheets.welcome.attacker_details")}
      </p>

      <p style={{ marginTop: 16 }}>
        <strong>{t("datasheets.welcome.defender_preset")}</strong>
        <br />
        {t("datasheets.welcome.defender_details")}
      </p>

      <button
        onClick={() => setShowWelcome(false)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#e0e0e0",
          color: "#333",
          border: "none",
          borderRadius: 5,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {t("datasheets.welcome.continue_button")}
      </button>
    </div>
  </div>
)}

    </div>
    
  );
  
  
  
}

export default SimulationDatasheetsMobile;
