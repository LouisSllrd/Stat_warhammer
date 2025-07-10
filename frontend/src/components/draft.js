return (
    <div
      style={{
        padding: 24,
        backgroundColor: "#f7f7f7",
        borderRadius: 12,
        maxWidth: 1000,
        margin: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>📋 Mes Listes</h2>
  
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => {
            setTempListe({ nom: "", unites: [] });
            setShowCreationModal(true);
            setShowEditUnitModal(false);
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#38a169",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ➕ Créer une nouvelle liste
        </button>
  
        <select
          onChange={(e) => {
            setSelectedListeId(e.target.value);
            fetchListe(e.target.value);
          }}
          value={selectedListeId}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            flex: 1,
          }}
        >
          <option value="">-- Sélectionner une liste --</option>
          {listes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
            </option>
          ))}
        </select>
      </div>
  
      {selectedListe && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>
            📦 Contenu de la liste <span style={{ fontWeight: "bold" }}>{selectedListe.nom}</span>
          </h3>
  
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 16,
              backgroundColor: "white",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <thead style={{ backgroundColor: "#edf2f7" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "left" }}>Unité</th>
                <th style={{ padding: 12, textAlign: "left" }}>Profils</th>
                <th colSpan={2} style={{ padding: 12, textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(selectedListe.unites) && selectedListe.unites.length > 0 ? (
                selectedListe.unites.map((u, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 12 }}>{u.nom}</td>
                    <td style={{ padding: 12 }}>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {u.profils?.length > 0 ? (
                          u.profils.map((p, i) => (
                            <li key={i}>
                              {`${p.nom || `Profil ${i + 1}`} (Att: ${p.Attacks ?? "?"}, CC/CT: ${
                                p.CT ?? "?"
                              }+, F: ${p.Strength ?? "?"}, PA: ${p.PA ?? "?"}, D: ${
                                p.Damage ?? "?"
                              })`}
                            </li>
                          ))
                        ) : (
                          <li>Aucun profil</li>
                        )}
                      </ul>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleEditUnit(idx)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#3182ce",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Modifier
                      </button>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleDeleteUnit(idx)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#e53e3e",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: 12, textAlign: "center" }}>
                    Aucune unité disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
  
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleAddUnit}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2b6cb0",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ➕ Ajouter une unité
            </button>
  
            <button
              onClick={handleDeleteListe}
              style={{
                padding: "8px 16px",
                backgroundColor: "#c53030",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              🗑️ Supprimer la liste
            </button>
          </div>
        </div>
      )}
  
      {/* Les modales n'ont pas besoin d'être modifiées ici */}
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
  