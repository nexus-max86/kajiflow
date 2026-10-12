# KajiFlow

Site statique (`public/index.html`) pour l'envoi des bordereaux et le rapprochement bancaire.
Aucun build : Vercel publie le dossier `public/`.

## Parcours sécurisé
1. Connexion par Supabase Auth (e-mail + mot de passe). Le rôle (`deposant`, `comptable`, `admin`)
   est lu dans la table `profils`, protégée par RLS.
2. Les fichiers partent vers la passerelle Supabase `kajiflow-envoi`, jamais directement vers n8n.
   Elle vérifie la session, le rôle et le format du fichier, limite le nombre d'envois et journalise
   chaque envoi dans `audit_log`.
3. La passerelle transmet à n8n avec l'en-tête `X-KajiFlow-Key` ; les webhooks n8n refusent
   toute requête sans cette clé.

La clé publique Supabase présente dans la page est conçue pour être visible.
Aucun secret (clé n8n, clé service_role, tokens) ne doit être ajouté à ce dépôt.
