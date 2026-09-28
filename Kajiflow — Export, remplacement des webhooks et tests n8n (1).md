# Kajiflow — Export, remplacement des webhooks et tests n8n

## Conclusion

Le code source complet du projet WebDev n’est pas récupérable depuis cette session, car le projet `fHGkYo9UjhVzgyL7wPoJNK` appartient à Nexus Agency’s et l’accès d’édition est refusé au compte courant. Le site publié seul ne permet pas d’exporter le code source.

La récupération doit donc être faite par le propriétaire du projet, ou par un agent ajouté comme membre **Éditeur**.

## 1. Informations du projet

- Projet : **Kajiflow — Gestion des bordereaux et matching**
- Identifiant : `fHGkYo9UjhVzgyL7wPoJNK`
- Site publié : `https://kajimatch-fhgkyo9u.manus.space`

## 2. Export vers un autre environnement

Effectuer ces opérations avec le compte propriétaire Nexus Agency’s :

1. Ouvrir le projet Kajiflow dans Manus.
2. Ouvrir le menu du projet, les paramètres ou la section de partage.
3. Utiliser, selon les options disponibles, **Exporter le projet**, **Télécharger le code**, **Dupliquer**, **Cloner** ou **Créer une copie**.
4. Si l’export ZIP est disponible, télécharger l’archive et la remettre à l’agent ou l’importer dans le nouvel espace.
5. Si seul le clonage est disponible, créer une copie dans l’espace du nouvel agent.
6. Ouvrir la copie en mode édition et vérifier que les fichiers source, le build et la publication sont accessibles.

Une copie du code ne transfère pas automatiquement les secrets, les variables d’environnement, la base Supabase ou les credentials n8n. Ces éléments doivent être reconfigurés séparément.

### Solution de partage si l’export n’existe pas

Le propriétaire peut ajouter le compte du nouvel agent dans **Partager → Collaborateurs** avec le rôle **Éditeur** ou **Administrateur**. Le compte doit être reconnu comme membre du projet, et pas seulement comme lecteur du site publié.

## 3. URLs de production

### Upload d’un bordereau ou d’une photo

```text
https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion
```

### Upload d’un relevé bancaire Excel

```text
https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire
```

Ne pas utiliser l’URL Excel pour l’envoi d’une photo. Les anciennes URLs présentes dans le code n’ont pas pu être confirmées depuis le projet privé ; elles doivent être recherchées avant remplacement.

## 4. Trouver les URLs actuelles dans le code

Après récupération du projet, exécuter depuis sa racine :

```bash
rg -n -i \
  'n8n|webhook|matching-releve-bancaire|bordereau-ingestion|FormData|fileUrl|upload' \
  . \
  --glob '!node_modules' \
  --glob '!dist' \
  --glob '!build'
```

Rechercher aussi les variables d’environnement :

```bash
rg -n -i \
  'N8N|WEBHOOK|SUPABASE|VITE_' \
  .env* src app client server 2>/dev/null
```

Avant toute modification, créer une sauvegarde Git :

```bash
git status
git add .
git commit -m "backup avant remplacement des webhooks n8n"
```

## 5. Remplacer les URLs

Remplacer l’URL utilisée par le bouton **Upload Bordereau** par :

```text
https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion
```

Remplacer l’URL utilisée par le bouton **Upload Relevé** par :

```text
https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire
```

Ne pas faire un remplacement global aveugle si les deux fonctions sont dans le même fichier. Il faut associer chaque URL au bon bouton.

### Exemple de variables `.env`

```dotenv
N8N_BORDEREAU_WEBHOOK_URL=https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion
N8N_EXCEL_WEBHOOK_URL=https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire
```

Après modification d’une variable `VITE_*`, redémarrer le serveur de développement et refaire le build. Les valeurs des variables frontend sont intégrées au bundle au moment du build.

## 6. Code attendu pour l’upload d’un bordereau

Le bouton photo doit utiliser le fichier sélectionné et le champ multipart `file` :

```javascript
const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch(
  "https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion",
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`n8n HTTP ${response.status}: ${errorText}`);
}

const result = await response.json();
if (result.status !== "ok") {
  throw new Error(result.message || "Le traitement n8n a échoué");
}
```

Ne pas ajouter manuellement `Content-Type: multipart/form-data`. Le navigateur doit ajouter automatiquement la boundary multipart.

## 7. Code attendu pour l’upload d’un relevé Excel

```javascript
const formData = new FormData();
formData.append("file", selectedExcelFile);

const response = await fetch(
  "https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire",
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`n8n HTTP ${response.status}: ${errorText}`);
}

const result = await response.json();
if (result.status !== "ok") {
  throw new Error(result.message || "Le rapprochement n8n a échoué");
}
```

## 8. Tester depuis un terminal

Le script prêt à l’emploi est fourni dans `test-kajiflow-webhooks.sh`.

Rendre le script exécutable :

```bash
chmod +x test-kajiflow-webhooks.sh
```

Tester un bordereau :

```bash
./test-kajiflow-webhooks.sh bordereau /chemin/vers/bordereau.jpg
```

Tester un relevé Excel :

```bash
./test-kajiflow-webhooks.sh releve /chemin/vers/releve.xlsx
```

Test direct sans script pour une photo :

```bash
curl --fail-with-body --show-error --verbose \
  -X POST \
  -F "file=@/chemin/vers/bordereau.jpg;type=image/jpeg" \
  "https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion"
```

Test direct sans script pour un Excel :

```bash
curl --fail-with-body --show-error --verbose \
  -X POST \
  -F "file=@/chemin/vers/releve.xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  "https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire"
```

## 9. Vérification finale

Après un test réussi :

1. Ouvrir n8n et aller dans **Executions**.
2. Pour une photo, vérifier une nouvelle exécution du workflow d’ingestion.
3. Vérifier que le premier nœud reçoit le fichier dans `Binary → file`.
4. Vérifier Gemini, l’insertion Supabase et la réponse finale.
5. Pour un relevé, vérifier `Webhook Matching`, `Normaliser Fichier Reçu`, le mapping Excel et la réponse de matching.
6. Refaire un build et publier le site.

Les secrets Supabase, n8n, Telegram et Brevo ne doivent pas être placés dans le code frontend ni dans un dépôt public.

## 10. Critère de succès

Le site doit appeler le bon endpoint, n8n doit afficher une nouvelle exécution, et le bouton doit afficher une erreur réelle si n8n répond avec un statut HTTP non valide. Il ne faut pas afficher « traitement réussi » avant la réponse effective de n8n.

## Références

[1]: https://n8n.srv1332055.hstgr.cloud "Instance n8n de production"
[2]: https://kajimatch-fhgkyo9u.manus.space "Site publié Kajiflow"
