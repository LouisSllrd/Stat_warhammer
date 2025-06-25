import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import ListeModal from "./ListeModal";

function MesListes() {
  const [listes, setListes] = useState([]);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [selectedListe, setSelectedListe] = useState(null);

  // Etat pour gérer la modale et la liste temporaire en création/édition
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempListe, setTempListe] = useState({ nom: "", unites: [] });

  // Charger les listes de l'utilisateur
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

  // Récupérer une liste précise par son id
  const fetchListe = async (id) => {
    const docRef = doc(db, "listes", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setSelectedListe({
        id,
        ...data,
        unites: Array.isArray(data.unites) ? data.unites : []
      });
    }
  };

  // Création d'une nouvelle liste dans Firestore
  const handleCreateListe = async (units) => {
    await addDoc(collection(db, "listes"), {
      nom: tempListe.nom,
      unites: units,
      userId: auth.currentUser.uid,
    });
    setShowCreationModal(false);
    setTempListe({ nom: "", unites: [] });
  };

  // Modification d'une liste existante dans Firestore
  const handleModifierListe = async (units) => {
    const docRef = doc(db, "listes", selectedListe.id);
    await updateDoc(docRef, {
      nom: tempListe.nom,
      unites: units,
    });
    setShowEditModal(false);
    setTempListe({ nom: "", unites: [] });
    fetchListe(selectedListe.id);
  };

  return (
    <div>
      <h2>Mes Listes</h2>

      <button
        onClick={() => {
          setTempListe({ nom: "", unites: [] });
          setShowCreationModal(true);
        }}
      >
        Créer une nouvelle liste
      </button>

      <select
        onChange={(e) => {
          setSelectedListeId(e.target.value);
          fetchListe(e.target.value);
        }}
        value={selectedListeId}
      >
        <option value="">-- Sélectionner une liste --</option>
        {listes.map((l) => (
          <option key={l.id} value={l.id}>
            {l.nom}
          </option>
        ))}
      </select>

      {selectedListe && (
        <div>
          <h3>Unités dans {selectedListe.nom}</h3>
          <table>
            <thead>
              <tr>
                <th>Unité</th>
                <th>Profils</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(selectedListe.unites) && selectedListe.unites.length > 0 ? (
                selectedListe.unites.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.nom}</td>
                    <td>
                      <ul>
                        {Array.isArray(u.profils) && u.profils.length > 0 ? (
                          u.profils.map((p, i) => (
                            <li key={i}>
                              {p.nom} (F{p.force}, A{p.attaques}, D{p.degats})
                            </li>
                          ))
                        ) : (
                          <li>Aucun profil</li>
                        )}
                      </ul>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>Aucune unité disponible</td>
                </tr>
              )}
            </tbody>
          </table>

          <button
            onClick={() => {
              setTempListe({
                nom: selectedListe.nom,
                unites: Array.isArray(selectedListe.unites) ? selectedListe.unites : []
              });
              setShowEditModal(true);
            }}
          >
            Modifier la liste
          </button>
        </div>
      )}

      {showCreationModal && (
        <ListeModal
          open={showCreationModal}
          onClose={() => setShowCreationModal(false)}
          onSave={handleCreateListe}
          tempListe={tempListe}
          setTempListe={setTempListe}
          title="Créer une nouvelle liste"
        />
      )}

      {showEditModal && (
        <ListeModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleModifierListe}
          tempListe={tempListe}
          setTempListe={setTempListe}
          title="Modifier la liste"
        />
      )}
    </div>
  );
}

export default MesListes;
