import React from "react";
import { useTranslation } from "react-i18next";

const AccueilMobile = () => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>{t("title_welcome")}</h1>

      <p>{t("accueil.intro")}</p>

      <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_generic")}
      </h2>
      <ul>
        <li><strong>{t("accueil.generic.mono_title")}</strong> {t("accueil.generic.mono_text")}</li>
        <li><strong>{t("accueil.generic.multi_title")}</strong> {t("accueil.generic.multi_text")}</li>
        <li><strong>{t("accueil.generic.comparateur_title")}</strong> {t("accueil.generic.comparateur_text")}</li>
        <li>
          <strong>{t("accueil.generic.predef_title")}</strong> {t("accueil.generic.predef_text")} <a href="https://github.com/BSData/wh40k-10e" target="_blank" rel="noopener noreferrer">https://github.com/BSData/wh40k-10e</a>, {t("accueil.generic.license_text")}
        </li>
      </ul>

      <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_custom")}
      </h2>
      <ul>
        <li><strong>{t("accueil.custom.listes_title")}</strong> {t("accueil.custom.listes_text")}</li>
        <li><strong>{t("accueil.custom.adverses_title")}</strong> {t("accueil.custom.adverses_text")}</li>
        <li><strong>{t("accueil.custom.calcul_title")}</strong> {t("accueil.custom.calcul_text")}</li>
      </ul>

      <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_connexion")}
      </h2>
      <p>{t("accueil.connexion")}</p>

      <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_remarques")}
      </h2>
      <ul>
        <li>{t("accueil.remarque.formats")}</li>
        <li>{t("accueil.remarque.calcul")}</li>
      </ul>

      <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_don")}
      </h2>
      <p>{t("accueil.don_text")}</p>

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
        {t("accueil.don_button")}
              </a>

              <h2 style={{ marginTop: 30, fontSize: 22, color: "#FFB14F" }}>
        {t("accueil.section_contact")}
      </h2>
      <p>{t("accueil.contact_text")}</p>
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
    Contact
  </h2>

  <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
  {t("accueil.Name")} :
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
    Email :
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
    {t("accueil.Send")}
  </button>
</form>

    </div>
  );
};

export default AccueilMobile;
