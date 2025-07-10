
import React, { createContext, useState, useEffect } from "react";

export const ProfilesContext = createContext();

export function ProfilesProvider({ children }) {
  const [attacker1, setAttacker1] = useState(() => {
    const saved = localStorage.getItem("attacker1");
    return saved ? JSON.parse(saved) : {
      Attacks: "12",
      CT: 2,
      Auto_hit: false,
      Strength: "8",
      PA: "2",
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
  });

  const [attacker2, setAttacker2] = useState(() => {
    const saved = localStorage.getItem("attacker2");
    return saved ? JSON.parse(saved) : {
      Attacks: "12",
      CT: 2,
      Auto_hit: false,
      Strength: "8",
      PA: "2",
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
  });

  // Sauvegarde automatique dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("attacker1", JSON.stringify(attacker1));
  }, [attacker1]);
  
  useEffect(() => {
    localStorage.setItem("attacker2", JSON.stringify(attacker2));
  }, [attacker2]);
  

  // Tu peux ajouter d'autres états ici (défenseur, résultats, etc.)

  return (
    <ProfilesContext.Provider
      value={{
        attacker1,
        setAttacker1,
        attacker2,
        setAttacker2,
        // Ajoute d'autres setters et états ici
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}
