import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Composants externes (si tu les utilises encore)
import AttackProfileCard from "./AttackProfileCard";
import DefenseProfileCard from "./DefenseProfileCard";

function SimulationDatasheets() {
  const [availableDatasheets, setAvailableDatasheets] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);
  const [selectedUniteNom, setSelectedUniteNom] = useState("");
  const [selectedUnite, setSelectedUnite] = useState(null);

  const [enemyUnitName, setEnemyUnitName] = useState("");
  const [enemyUnit, setEnemyUnit] = useState(null);
  const [defenderParams, setDefenderParams] = useState(null);

  const [visibleProfiles, setVisibleProfiles] = useState({});
  const [selectedProfiles, setSelectedProfiles] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showFullResults, setShowFullResults] = useState(false);

  // Charger la liste des fichiers JSON disponibles (à adapter ou automatiser selon besoin)
  useEffect(() => {
    const files = [
      "Tyranids.json",
      "Chaos - Death Guard.json",
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
            profiles.push({
              section: sectionName,
              name: p.name || "",
              ...p.characteristics || {},
            });
          });
        });
  
        return {
          nom: unitName,
          profils: profiles
        };
      });
  
      setSelectedListe({ id: filename, unites: allUnits });
      setSelectedUniteNom("");
      setSelectedUnite(null);
    } catch (err) {
      console.error("Erreur chargement JSON :", err);
      alert("Erreur lors du chargement du fichier.");
    }
  };
  
  

  // Lorsqu’une unité est sélectionnée
  useEffect(() => {
    if (!selectedListe || !selectedUniteNom) return;
    const unit = selectedListe.unites.find((u) => u.nom === selectedUniteNom);
    setSelectedUnite(unit);
  }, [selectedUniteNom, selectedListe]);

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
  }, [selectedUnite]);

  const handleAttackProfileChange = (updatedProfile, index) => {
    const updatedProfils = [...selectedUnite.profils];
    updatedProfils[index] = updatedProfile;
    setSelectedUnite({ ...selectedUnite, profils: updatedProfils });
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

      const res = await axios.post("http://127.0.0.1:8000/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });

      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation :", error);
      alert("Erreur lors de la simulation. Vérifie la console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Simulation de Datasheets</h2>

      {/* Sélection du fichier JSON */}
      <label>Choisir une liste de datasheets :</label>
      <select
        value={selectedListeId}
        onChange={(e) => {
          const file = e.target.value;
          setSelectedListeId(file);
          fetchListeFromJson(file);
        }}
      >
        <option value="">-- Choisir une datasheet --</option>
        {availableDatasheets.map(file => (
          <option key={file} value={file}>
            {file.replace(".json", "")}
          </option>
        ))}
      </select>

      {/* Sélection d'une unité */}
      {selectedListe && (
        <>
          <label>Choisir une unité :</label>
          <select
            value={selectedUniteNom}
            onChange={(e) => setSelectedUniteNom(e.target.value)}
          >
            <option value="">-- Choisir une unité --</option>
            {selectedListe.unites.map((u, idx) => (
              <option key={idx} value={u.nom}>
                {u.nom}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Simulation UI (cartes, boutons, etc.) */}
      {selectedUnite && (
        <div>
          <h3>Profils d’attaque</h3>
          {selectedUnite.profils.map((profile, i) => (
            <AttackProfileCard
              key={i}
              profile={profile}
              index={i}
              visible={visibleProfiles[i]}
              selected={selectedProfiles[i]}
              onChange={(updatedProfile) => handleAttackProfileChange(updatedProfile, i)}
              onVisibilityToggle={() => setVisibleProfiles({ ...visibleProfiles, [i]: !visibleProfiles[i] })}
              onSelectToggle={() => setSelectedProfiles({ ...selectedProfiles, [i]: !selectedProfiles[i] })}
            />
          ))}

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Simulation en cours..." : "Lancer la simulation"}
          </button>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <div>
          <h3>Résultats :</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SimulationDatasheets;
