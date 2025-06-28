import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Compte créé !");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Connecté !");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>{isRegister ? "Inscription" : "Connexion"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: 10, width: "100%" }}>
          {isRegister ? "Créer un compte" : "Se connecter"}
        </button>
      </form>
      <p style={{ marginTop: 12, textAlign: "center" }}>
        {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{ color: "blue", cursor: "pointer", background: "none", border: "none" }}
        >
          {isRegister ? "Connectez-vous" : "Inscrivez-vous"}
        </button>
      </p>
      {/* Texte explicatif */}
  <p style={{ marginBottom: 20, fontStyle: "italic", color: "#555" }}>
    {isRegister
      ? "Créer un compte vous permet d'accéder à toutes les fonctionnalités exclusives et de sauvegarder vos données en toute sécurité."
      : "Connectez-vous pour accéder à vos listes personnalisées et profiter d'une expérience personnalisée."}
  </p>
    </div>
    
  );
}
