#!/usr/bin/env bash
set -euo pipefail

BORDEREAU_URL='https://n8n.srv1332055.hstgr.cloud/webhook/bordereau-ingestion'
RELEVE_URL='https://n8n.srv1332055.hstgr.cloud/webhook/matching-releve-bancaire'

usage() {
  echo "Usage: $0 bordereau /chemin/image.jpg|png"
  echo "       $0 releve /chemin/releve.xlsx|xls"
  exit 2
}

[[ $# -eq 2 ]] || usage
TYPE="$1"
FILE="$2"

[[ -f "$FILE" ]] || { echo "Fichier introuvable: $FILE" >&2; exit 1; }

case "$TYPE" in
  bordereau)
    case "${FILE,,}" in
      *.jpg|*.jpeg) MIME='image/jpeg' ;;
      *.png) MIME='image/png' ;;
      *.webp) MIME='image/webp' ;;
      *) MIME='application/octet-stream' ;;
    esac
    URL="$BORDEREAU_URL"
    echo "Test bordereau -> $URL"
    ;;
  releve)
    case "${FILE,,}" in
      *.xlsx) MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ;;
      *.xls) MIME='application/vnd.ms-excel' ;;
      *) MIME='application/octet-stream' ;;
    esac
    URL="$RELEVE_URL"
    echo "Test relevé -> $URL"
    ;;
  *)
    usage
    ;;
esac

echo "Fichier: $FILE"
echo "MIME: $MIME"
echo

curl --fail-with-body --show-error --verbose \
  --request POST \
  --form "file=@${FILE};type=${MIME}" \
  "$URL"

STATUS=$?
echo
if [[ $STATUS -eq 0 ]]; then
  echo "Requête acceptée par le webhook. Vérifier maintenant l’exécution dans n8n."
else
  echo "Échec HTTP ou réseau. Consulter le statut et le corps affichés par curl." >&2
fi
exit "$STATUS"
