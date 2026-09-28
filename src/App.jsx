import { useState } from "react";
import "./styles.css";

const BORDEREAU_URL =
  import.meta.env.VITE_N8N_BORDEREAU_URL ||
  "https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion";

const RELEVE_URL =
  import.meta.env.VITE_N8N_RELEVE_URL ||
  "https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire";

function UploadForm({ title, accept, url } ) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setMessage("Sélectionne un fichier.");
      return;
    }

    setLoading(true);
    setMessage("Envoi en cours...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${result}`);
      }

      setMessage("Fichier envoyé avec succès.");
    } catch (error) {
      setMessage(error.message || "Erreur pendant l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>

      <input
        type="file"
        accept={accept}
        onChange={(event) => setFile(event.target.files?.[0] || null)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer"}
      </button>

      <p>{message}</p>
    </form>
  );
}

export default function App() {
  return (
    <main>
      <h1>Kajiflow</h1>
      <p>Gestion des bordereaux et relevés bancaires</p>

      <UploadForm
        title="Envoyer un bordereau"
        accept="image/*"
        url={BORDEREAU_URL}
      />

      <UploadForm
        title="Envoyer un relevé bancaire"
        accept=".xlsx,.xls,.csv"
        url={RELEVE_URL}
      />
    </main>
  );
}
