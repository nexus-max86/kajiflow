# KajiFlow

Site web statique (un seul fichier : `public/index.html`) pour l'envoi des bordereaux
et le rapprochement bancaire. Aucun build : Vercel publie le dossier `public/`.

## Webhooks n8n utilisés
- Bordereau : `https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion`
- Relevé : `https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire`

Le serveur n8n doit autoriser le CORS (déjà activé via `N8N_CORS_ORIGIN`).

## Déploiement
Chaque push sur `main` redéploie automatiquement sur Vercel.
Les secrets (clés API, tokens) ne doivent jamais être ajoutés à ce dépôt.
