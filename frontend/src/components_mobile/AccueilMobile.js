import React from "react";

const AccueilMobile = () => {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}> Bienvenue sur la plateforme Simulateur de dégâts Warhammer 40k pour téléphone</h1>

      <p>
        Cette plateforme vous permet de réaliser des simulations de dégâts pour vos unités Warhammer 40k contre divers cibles. 
        Que vous soyez en train de construire votre liste d'armée ou en pleine partie, vous pouvez rapidement estimer les dégâts potentiels que peut infliger une unité contre une cible spécifique.
      </p>

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Préparer ma liste</h2>
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

      <h2 style={{ marginTop: 30, fontSize: 22 }}> Calculer en jeu (connexion requise)</h2>
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
        La connexion est requise pour sauvegarder vos listes personnelles et accéder au mode "Calcul En Jeu". Vous pouvez vous connecter avec un compte Google.
      </p>

      <p style={{ marginTop: 40 }}>
        Bon jeu et bonnes simulations !
      </p>
    </div>
  );
};

export default AccueilMobile;
