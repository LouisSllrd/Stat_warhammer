import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Auth() {
  const { t } = useTranslation();
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
        alert(t("auth.alerts.account_created"));
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert(t("auth.alerts.logged_in"));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: "Segoe UI, sans-serif", background: "#DCFEFF", minHeight: "100vh" }}>
    <div style={{
      maxWidth: 400,
      margin: "40px auto",
      padding: 30,
      borderRadius: 12,
      boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#333" }}>
        {isRegister ? t("auth.title_register") : t("auth.title_login")}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t("auth.email_placeholder")}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "92%",
            padding: "12px 14px",
            marginBottom: 16,
            borderRadius: 6,
            border: "1.5px solid #ccc",
            fontSize: 16,
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
        <input
          type="password"
          placeholder={t("auth.password_placeholder")}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "92%",
            padding: "12px 14px",
            marginBottom: 16,
            borderRadius: 6,
            border: "1.5px solid #ccc",
            fontSize: 16,
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
        {error && (
          <p style={{
            color: "red",
            marginBottom: 16,
            fontWeight: "600",
            textAlign: "center"
          }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: isRegister ? "#28a745" : "#007bff",
            color: "white",
            fontSize: 18,
            fontWeight: "600",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isRegister ? "#218838" : "#0056b3"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = isRegister ? "#28a745" : "#007bff"}
        >
          {isRegister ? t("auth.button_register") : t("auth.button_login")}
        </button>
      </form>
      <p style={{
        marginTop: 20,
        textAlign: "center",
        fontSize: 15,
        color: "#555",
        userSelect: "none"
      }}>
        {isRegister ? t("auth.toggle_to_login") : t("auth.toggle_to_register")}{" "}
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{
            color: "#007bff",
            cursor: "pointer",
            background: "none",
            border: "none",
            fontWeight: "600",
            fontSize: 15,
            textDecoration: "underline",
            padding: 0,
            marginLeft: 4,
            userSelect: "text",
          }}
        >
          {isRegister ?  t("auth.switch_to_login") : t("auth.switch_to_register")}
        </button>
      </p>
      <p style={{
        marginTop: 20,
        fontStyle: "italic",
        color: "#666",
        fontSize: 14,
        lineHeight: 1.4,
        textAlign: "center",
        userSelect: "none"
      }}>
        {isRegister
          ? t("auth.info_register")
          : t("auth.info_login")}
      </p>
    </div>
    </div>
  );
}
