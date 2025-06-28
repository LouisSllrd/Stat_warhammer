import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import unitCatalogue from "../data/unit_catalogue.json"; // ⚠️ adapte le chemin
import AttackProfileCard from "./AttackProfileCard";
import DefenseProfileCard from "./DefenseProfileCard";
import axios from "axios";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
  } from "recharts";


function SimulationEnJeu() {
  const [listes, setListes] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);
  const [selectedUniteNom, setSelectedUniteNom] = useState("");
  const [selectedUnite, setSelectedUnite] = useState(null);

  const [enemyUnitName, setEnemyUnitName] = useState("");
  const [enemyUnit, setEnemyUnit] = useState(null);

  // Nouveau state : params modifiables du défenseur
  const [defenderParams, setDefenderParams] = useState(null);
  const [defenderUnits, setDefenderUnits] = useState([]);
  const [results, setResults] = useState(null);

  const handleAttackProfileChange = (updatedProfile, index) => {
    // Mets à jour selectedUnite.profils[index] avec updatedProfile
    const updatedProfils = [...selectedUnite.profils];
    updatedProfils[index] = updatedProfile;
  
    setSelectedUnite({ ...selectedUnite, profils: updatedProfils });
  };
  // Charger les unités défenseurs depuis Firestore
  useEffect(() => {
    const q = query(collection(db, "unités_adverses")); // adapte le nom de la collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unitsFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDefenderUnits(unitsFromDb);
    });

    return () => unsubscribe();
  }, []);

  // Lorsque enemyUnitName change, trouver l'unité dans la liste Firestore
  useEffect(() => {
    if (!enemyUnitName) {
      setEnemyUnit(null);
      setDefenderParams(null);
      return;
    }

    const unitFromDb = defenderUnits.find(u => u.nom === enemyUnitName);
    if (unitFromDb) {
      setEnemyUnit(unitFromDb);
      setDefenderParams(JSON.parse(JSON.stringify(unitFromDb))); // ou adapte selon la structure exacte
    } else {
      setEnemyUnit(null);
      setDefenderParams(null);
    }
  }, [enemyUnitName, defenderUnits]);
  

  const handleSubmit = async () => {
    setResults(null);
  
    try {
      // Préparation des profils en parsant les champs numériques
      const parsedAttackProfiles = selectedUnite.profils.map((params) => {
        const parsedParams = { ...params };
        Object.keys(parsedParams).forEach((key) => {
          if (
            key !== "Attacks" &&
            key !== "Strength" &&
            key !== "PA" &&
            key !== "Damage" 
          ) {
            parsedParams[key] = Number(parsedParams[key]);
          }
        });
        return parsedParams;
      });
  
      // Parse aussi le defenderProfile
      const parsedDefenderProfile = { ...defenderParams.profils[0] };

      
  
      const res = await axios.post("http://localhost:8000/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });
  
      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation multiple :", error);
      alert("Erreur lors de la simulation. Veuillez vérifier la console pour plus d'informations.");
    }
  
  };

  // Récupère les listes personnelles
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

  // Charge une liste spécifique
  const fetchListe = async (id) => {
    const docRef = doc(db, "listes", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setSelectedListe({ id, ...data });
      setSelectedUniteNom("");
      setSelectedUnite(null);
    }
  };

  // Lors du choix d'une unité de la liste
  useEffect(() => {
    if (!selectedListe || !selectedUniteNom) return;
    const unit = selectedListe.unites.find((u) => u.nom === selectedUniteNom);
    setSelectedUnite(unit);
  }, [selectedUniteNom, selectedListe]);



  // Gestion des changements dans le formulaire défenseur
  const handleDefenderChange = (newProfile) => {
    setDefenderParams({ ...defenderParams, ...newProfile });
  };
  
  

  return (
    <div style={{ display: "flex", gap: 30 }}>
      {/* Colonne gauche : Attaquant */}
      <div style={{ flex: 1 }}>
        <h2>Unité Attaquante</h2>

        <label>Choisir une liste :</label>
        <select
          value={selectedListeId}
          onChange={(e) => {
            setSelectedListeId(e.target.value);
            fetchListe(e.target.value);
          }}
        >
          <option value="">-- Sélectionner --</option>
          {listes.map((liste) => (
            <option key={liste.id} value={liste.id}>
              {liste.nom}
            </option>
          ))}
        </select>

        {selectedListe && (
          <>
            <br />
            <label>Choisir une unité :</label>
            <select
              value={selectedUniteNom}
              onChange={(e) => setSelectedUniteNom(e.target.value)}
            >
              <option value="">-- Sélectionner une unité --</option>
              {selectedListe.unites.map((u, idx) => (
                <option key={idx} value={u.nom}>
                  {u.nom}
                </option>
              ))}
            </select>

            {selectedUnite && (
              <div>
                {selectedUnite.profils.map((profil, i) => (
                  <AttackProfileCard
                  key={i}
                  profile={profil}
                  onChange={(updatedProfile) => handleAttackProfileChange(updatedProfile, i)}
                />
                ))}
              </div>
            )}
          </>
        )}
      </div>

    {/* Colonne droite : Défenseur */}
    <div style={{ flex: 1 }}>
        <h2>Unité Défenseur</h2>

        <label>Choisir une unité du catalogue Firestore :</label>
        <select
          value={enemyUnitName}
          onChange={(e) => setEnemyUnitName(e.target.value)}
        >
          <option value="">-- Sélectionner une cible --</option>
          {defenderUnits.map((unit) => (
            <option key={unit.id} value={unit.nom}>
              {unit.nom}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 20 }}>
          <div style={{ flex: 2, minWidth: 300 }}>
          {defenderParams && (
            <DefenseProfileCard
            profile={defenderParams?.profils?.[0]}
            onChange={(newProfile) => {
              const newParams = { ...defenderParams };
              newParams.profils[0] = newProfile;
              setDefenderParams(newParams);
            }}
          />
          
            )}

          </div>

    <button onClick={handleSubmit} style={{ flexShrink: 0, padding: "10px 20px" }}>
      Lancer la simulation
    </button>
  </div>
</div>

      {/* Résultats */}
        {results && (
          <div style={{ flex: 2, minWidth: 600 }}>
            <h2 style={{ fontSize: 22, fontWeight: "bold" }}>Résultats :</h2>
            <p>Unité : {results.unit_descr}</p>
            <p>
              Moyenne : {results.mean.toFixed(1)} {results.unit}, soit{" "}
              {results.relative_damages.toFixed(0)}% de la force initiale de l'unité cible
            </p>
            <p>Écart-type : {results.std.toFixed(1)}</p>
            <div style={{ flex: "1 1 0", maxWidth: 400 }}>
                    <h3 style={{ fontWeight: "bold" }}>
                    Probabilité d'atteindre un seuil de dégâts 
                    </h3>
                    <LineChart
                    width={400}
                    height={300}
                    data={results.cumulative_data}
                    margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                    >
                    <CartesianGrid stroke="#ccc" />
                    <XAxis
                        dataKey="value"
                        tick={({ x, y, payload }) => {
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
        )}
      
    </div>
  );
}

export default SimulationEnJeu;
