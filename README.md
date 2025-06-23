Activer Cloudfunction et BQ API

Ensuite choisir le prodjet dans la liste, cliquer sur les trois points puis "Créer un ensemble de données"

Ensuite cliquerr sur l'ensemble 'Matom oextgract' et créez uen table `matomo_visits` avec le schema suivantt :

```
JSON A DEFINIR
```

On va ensuite sur Google Cloud Function

https://console.cloud.google.com/

## Google Cloud Run Function

Activez l'APi de Cloud Run Function
https://console.cloud.google.com/

- Nom du service : `matomo-data-import`
- Région : `europe-west1`
- Execution : `Node.js 22`

Définir l'authentification sur IAM -> Exiger l'authentification

- Activez les API requises (Cloud Build API)
Da,s Cloud run, définissez node sur Node 22 puis le point d'entrée sur le nom de la fonction soit `importDataFromAPI`.

Dans le `package.json` ajoutez :

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@google-cloud/bigquery": "^7.0.0",
    "axios": "^1.6.0"
  }
}

```

Dans le `index.js` ajoutez : 

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const axios = require('axios');

const bigquery = new BigQuery();
const datasetId = 'matomo_extract';
const tableId = 'matomo_visits';

exports.importDataFromAPI = async (req, res) => {
  try {
    const response = await axios.get('https://demo.matomo.cloud/?module=API&method=Live.getLastVisitsDetails&idSite=1&token_auth=anonymous&format=json&period=day&date=yesterday&filter_limit=100');

    const rows = response.data.map(v => ({
      visitId: v.idVisit.toString(),
      visitIp: v.visitIp,
      visitLocalTime: new Date(`${v.lastActionDateTime}Z`)
    }));

    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    res.status(200).send(`✅ ${rows.length} lignes insérées dans BigQuery`);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send("❌ Erreur pendant l'import des données.");
  }
};

```


récupérez l'URL De la Cloudfunction

https://matomo-data-import-939481467647.europe-west1.run.app


### Créer le job dans Cloud Function avec l'onglet Jobs


## Google Cloud Scheduler

Actrivez l'API de Clodu Scheduler
https://console.cloud.google.com/cloudscheduler

### Créer une tâche planifiée
- nom `matomo-daily-import`
- région: `europe-west-1`
- Fréqauence : `0 0 * * *` // everyday at midnight
- fuseau horarire `HAEC` // Europe centrale avec heure d'été (France)

- Cible : `HTTP`
- URL : `https://matomo-data-import-939481467647.europe-west1.run.app`
- Sécurité `OIDC` (de GCP a GCP)


## Visualiser les données dans Google BigQuery
