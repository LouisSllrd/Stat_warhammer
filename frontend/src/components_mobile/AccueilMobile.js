import React from "react";

const AccueilMobile = () => {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}> Bienvenue sur la plateforme StatWarhammer40k pour téléphone</h1>

      <p>
        Cette plateforme vous permet de réaliser des simulations de dégâts pour vos unités Warhammer 40k contre divers cibles. 
        Que vous soyez en train de construire votre liste d'armée ou en pleine partie, vous pouvez rapidement estimer les dégâts potentiels que peut infliger une unité contre une cible spécifique.
      </p>

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Simulations génériques </h2>
      <ul>
        <li>
          <strong>Unité Mono Profil :</strong> Simulez une attaque d'un profil d'attaque contre un profil de défense.
        </li>
        <li>
          <strong>Unité Multi Profils :</strong> Simulez une attaque d'une unité contenant plusieurs profils d'attaques différents(ex : leader et son unité garde du corps, une unité avec des armes spéciales, etc.).
        </li>
        <li>
          <strong>Comparateur :</strong> Comparez deux profils d'attaques sur une sélection variée de profils cibles afin de choisir le profil d'attaque qui correspond le mieux au rôle que vous souhaitez donner à votre unité (anti infanterie, anti char, etc.).
        </li>
      </ul>

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Simulations personnalisées (connexion requise)</h2>
      <ul>
        <li>
          <strong>Mes Listes :</strong> Enregistrez et gérez vos listes personnelles de profils d'attaque pour les retrouver rapidement lors d'une simulation de dégâts pendant vos parties. 
        </li>
        <li>
          <strong>Unités Adverses :</strong> Préparez des listes de profils ennemis courants afin de gagner du temps pendant la simulation de dégât lors de la partie.
        </li>
        <li>
          <strong>Calcul En Jeu :</strong> Simulez rapidement une attaque d'une unité d'une de vos liste contre une unité défensive prédéfinie. 
        </li>
      </ul>

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Connexion</h2>
      <p>
        La connexion est requise pour sauvegarder vos listes personnelles et accéder au mode "Simulations personnalisées". Vous pouvez vous connecter avec un compte Google.
      </p>

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Faire un don</h2>
      <p >
      Ce site est entièrement gratuit, mais son hébergement a un coût pour son développeur.
              Ce projet ne peut vivre sans des dons de la communauté, et sera forcé de fermer sans un soutien régulier.
              Si tu veux soutenir le projet, tu peux faire un don !
      </p>

      <a
                href="https://ko-fi.com/statwargame40k" // ← remplace par ton vrai lien
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "10px 20px",
                  backgroundColor: "#89B5FF",
                  color: "white",
                  borderRadius: 5,
                  textDecoration: "none",
                }}
              >
                Faire un don 
              </a>

              <form
  action="https://formspree.io/f/xkgznqao"
  method="POST"
  style={{
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }}
>
  <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#333" }}>
    Contacte le développeur
  </h2>

  <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
    Ton nom :
    <input
      type="text"
      name="name"
      required
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginTop: "0.5rem",
      }}
    />
  </label>

  <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
    Ton email :
    <input
      type="email"
      name="email"
      required
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginTop: "0.5rem",
      }}
    />
  </label>

  <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
    Message :
    <textarea
      name="message"
      required
      rows={5}
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginTop: "0.5rem",
        resize: "vertical",
      }}
    />
  </label>

  <button
    type="submit"
    style={{
      backgroundColor: "#2b6cb0",
      color: "#fff",
      padding: "12px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#2c5282")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#2b6cb0")}
  >
    Envoyer
  </button>
</form>

    </div>
  );
};

export default AccueilMobile;
