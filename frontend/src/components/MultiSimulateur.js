import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AttackProfileCard from "./AttackProfileCard";
import DefenderForm from "./DefenderForm";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const defaultAttackProfile = {
  Nb_weapons: "1",
  Attacks: "12",
  CT:"2",
  Strength: "8",
  PA: "2",
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

const defaultDefender = {
  Toughness: 12,
  Save: 2,
  Save_invu: "N/A",
  PV: 16,
  Nb_of_models: 1,
  Cover: false,
  Fnp: "N/A",
  Modif_hit_def: 0,
  Modif_wound_def: "0",
  Halve_damage: false,
  Reduce_damage_1: false,
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

// Variants d'animation pour chaque profil
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1, // délai entre l'animation de chaque enfant (100ms)
    },
  },
};

const profileVariants = {
  initial: (customDelay = 0) => ({
    opacity: 0,
    y: 50,
    transition: { delay: customDelay },
  }),
  animate: (customDelay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: customDelay, duration: 0.4 },
  }),
  exit: (customDelay = 0) => ({
    opacity: 0,
    x: 100,
    height: 0,
    marginBottom: 0,
    padding: 0,
    overflow: "hidden",
    transition: { delay: customDelay, duration: 0.4 },
  }),
  
};




function MultiSimulateur() {
  const { t } = useTranslation();
  const [numProfiles, setNumProfiles] = useState(2);
  const [attackProfiles, setAttackProfiles] = useState([
    { id: crypto.randomUUID(), ...defaultAttackProfile },
    { id: crypto.randomUUID(), ...defaultAttackProfile },
  ]);
  
  const [visibleProfiles, setVisibleProfiles] = useState(
    Array(numProfiles).fill(false)
  );
  
  const [defenderProfile, setDefenderProfile] = useState({ ...defaultDefender });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Met à jour un profil d'attaque à l'index donné
  const updateProfile = (index, newParams) => {
    setAttackProfiles((prev) => {
      const updated = [...prev];
      updated[index] = newParams;
      return updated;
    });
  };

  const toggleProfileVisibility = (index) => {
    setVisibleProfiles((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };
  const [newProfiles, setNewProfiles] = useState([]);
  // Change le nombre de profils d'attaque et ajuste la liste en conséquence
  const handleNumProfilesChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumProfiles(count);
    setAttackProfiles((prev) => {
      const newProfiles = [...prev];
      while (newProfiles.length < count) {
        newProfiles.push({ id: crypto.randomUUID(), ...defaultAttackProfile });
      }
      
      return newProfiles.slice(0, count);
    });
  
    // Met à jour aussi visibleProfiles
    setVisibleProfiles((prev) => {
      const newState = [...prev];
      while (newState.length < count) newState.push(false);
      return newState.slice(0, count);
    });
  
    // Mise à jour de newProfiles pour les indices ajoutés
    setNewProfiles((prev) => {
      const addedIndices = [];
      for (let i = prev.length; i < count; i++) {
        addedIndices.push(i);
      }
      return addedIndices;
    });
  
    // Nettoyage automatique après animation (par ex. 700ms)
    setTimeout(() => {
      setNewProfiles([]);
    }, 700);
  }; 
  // Envoi la requête de simulation multiple
  const handleSubmit = async () => {
    setLoading(true);
    setResults(null);
  
    try {
      // Préparation des profils en parsant les champs numériques
      const parsedAttackProfiles = attackProfiles.map((params) => {
        const parsedParams = { ...params };
        Object.keys(parsedParams).forEach((key) => {
          if (
            key !== "Attacks" &&
            key !== "Strength" &&
            key !== "PA" &&
            key !== "Damage" &&
            key !== "Sustained_hit" &&
            key !== "CT" &&
            key !== "Re_roll_hit" &&
            key !== "Re_roll_wound" &&
            typeof defaultAttackProfile[key] === "number"
          ) {
            parsedParams[key] = Number(parsedParams[key]);
          }
        });
        parsedParams.Sustained_hit = String(parsedParams.Sustained_hit);
        parsedParams.CT = String(parsedParams.CT);
        parsedParams.Nb_weapons = Number(parsedParams.Nb_weapons);
        return parsedParams;
      });
  
      // Parse aussi le defenderProfile
      const parsedDefenderProfile = { ...defenderProfile };
      Object.keys(parsedDefenderProfile).forEach((key) => {
        if (
          key !== "Fnp" &&
          key !== "Save_invu" &&
          typeof defaultDefender[key] === "number") {
          parsedDefenderProfile[key] = Number(parsedDefenderProfile[key]);
        }
        
        parsedDefenderProfile.Save_invu = String(parsedDefenderProfile.Save_invu)
        parsedDefenderProfile.Fnp = String(parsedDefenderProfile.Fnp)
        parsedDefenderProfile.Modif_wound_def = String(parsedDefenderProfile.Modif_wound_def)
        console.log("Modif_wound_def : ", parsedDefenderProfile.Modif_wound_def);
      });
  
      const res = await axios.post("https://statwarhammer-production-871f.up.railway.app/multi_profile_simulate", {
        attackers_params: parsedAttackProfiles,
        defenser_params: parsedDefenderProfile,
      });
  
      setResults(res.data);
    } catch (error) {
      console.error("Erreur lors de la simulation multiple :", error);
      alert("Erreur lors de la simulation. Veuillez vérifier la console pour plus d'informations.");
    }
  
    setLoading(false);
  };
  

  return (
    <div style={{ padding: 32, fontFamily: "Segoe UI, sans-serif", background: "#DCFEFF", minHeight: "100vh" }}>
  <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center", color: "#2d3748" }}> {t("accueil.generic.multi_title")}</h1>

  <div style={{ marginBottom: 16 }}>
    <label htmlFor="numProfiles" style={{ fontWeight: 600 }}> {t("multi.nb_profils")} :</label>
    <select
      id="numProfiles"
      value={numProfiles}
      onChange={handleNumProfilesChange}
      style={{
        marginLeft: 12,
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ccc",
        fontSize: 14,
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  </div>

  <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 24, flexWrap: "wrap" }}>
    {/* Profils d'attaque */}
    <div style={{ flex: 1, minWidth: 320 }}>
  <h2 style={{ fontSize: 20, marginBottom: 12 }}>⚔️ {t("multi.attack_profiles")}</h2>
  
    
    <motion.div
    variants={containerVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <AnimatePresence mode="popLayout">
      {attackProfiles.map((profile, i) => {
      const isNew = newProfiles.includes(i);
      const delay = isNew ? newProfiles.indexOf(i) * 0.1 : 0;

      return (
        <motion.div
          key={profile.id}
          variants={profileVariants}
          custom={delay} // On passe le délai ici
          initial="initial"
          animate="animate"
          exit="exit"
          layout
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            padding: 16,
            marginBottom: 16,
            borderRadius: 12,
            backgroundColor: "#ffffff",
          }}
        >
          <button
            onClick={() => toggleProfileVisibility(i)}
            style={{
              marginBottom: 12,
              padding: "8px 14px",
              backgroundColor: "#2b6cb0",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2c5282")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2b6cb0")}
          >
            {visibleProfiles[i] ? `${t("multi.hide_profile")} ${i + 1}` : `${t("multi.show_profile")} ${i + 1}`}
          </button>
          {visibleProfiles[i] && (
            <AttackProfileCard
              index={i}
              profile={profile}
              onChange={(updatedProfile) => updateProfile(i, updatedProfile)}
            />
          )}
        </motion.div>
      );
    })}
    </AnimatePresence>

</motion.div>
</div>



    {/* Défenseur */}
    <div style={{ flex: 1, minWidth: 320 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>🛡️ {t("simulateur.defender")}</h2>
      <div
        style={{
          background: "#ffffff",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <DefenderForm params={defenderProfile} setParams={setDefenderProfile} />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            backgroundColor: loading ? "#a0aec0" : "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: 16,
            transition: "background-color 0.3s"
          }}
        >
          {loading ? t("simulateur.simulation_en_cours") : t("simulateur.lancer")}
        </button>
      </div>
    </div>

    {/* Résultats */}
    <AnimatePresence>
  {results && (
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
      style={{ flex: 2, minWidth: 600 }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginTop: 24,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>{t("simulateur.resultats")}</h2>
        <p><strong>{t("simulateur.unite_mesure")} :</strong> {results.unit_descr === "Nombre de PV perdus"
                                    ? t("simulateur.unit_PV")
                                    : t("simulateur.unit_figs")}
              </p>
        <p><strong>{t("simulateur.moyenne")} :</strong> <strong>{results.mean.toFixed(1)}</strong> {results.unit === "PV"
                                    ? t("simulateur.defenseur.PV")
                                    : t("simulateur.figs")}, {t("simulateur.soit")}{" "}
                {results.relative_damages.toFixed(0)}% {t("simulateur.de_force_init")}
              </p>
        <p><strong>{t("simulateur.ecart_type")} :</strong> {results.std.toFixed(1)}</p>
        <p> <strong>{t("simulateur.proba_tuer")} :</strong> <strong style={{
          color:
          results.proba_unit_killed < 30 ? "red" :
          results.proba_unit_killed < 60 ? "orange" :
          results.proba_unit_killed < 80 ? "gold" :
            "green"
        }}>
          {results.proba_unit_killed.toFixed(0)}%
        </strong>  </p>
        <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
          {/* Graphiques */}
          <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                <div>
                  <h3 style={{ fontWeight: "bold", marginBottom: 12 }}>
                  {t("simulateur.distribution")}
                  </h3>
                  <BarChart width={350} height={300} data={results.histogram_data}>
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
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3182ce" />
                  </BarChart>
                </div>

                <div>
                  <h3 style={{ fontWeight: "bold", marginBottom: 12 }}>
                  {t("simulateur.probabilite_seuil")}
                  </h3>
                  <LineChart width={350} height={300} data={results.cumulative_data}>
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
                    <Line
                      type="monotone"
                      dataKey="cumulative_percent"
                      stroke="#2b6cb0"
                    />
                  </LineChart>
                </div>
              </div>
        </div>

        {results.results_catalogue && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>{t("simulateur.comparaison_unites")}</h3>
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
    </motion.div>
  )}
</AnimatePresence>
  </div>
</div>
  );
}

export default MultiSimulateur;
