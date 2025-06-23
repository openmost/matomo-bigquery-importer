
## BigQuery

Créez vous un compte bigQuery associé à une propriété Google Cloud Console.

> Assurez-vosu d'avoir un compte de facturation Google Cloud Console à jour.

### Activez l'API BigQuery


### Créez un dataset

Dans votre projet BigQuery, cliquez sur les trois points verticaux situés à droite du nom du projet et cliquez sur "Créer un ensemble de données"

Nommez votre ensemble de données `matomo_extract`.

Définissez "Région" sur `europe-west-1 (Belgique)`.

Cliquez sur "Créer un ensemble de données".

### Créez une table dans le dataset

Sur l'ensemble de données (dataset) fraichement créé, cliquez sur les trois points verticaux en face du dataset et ensuite sur "Créer une table".

Dans le champs "Table*" saisissez la valeur `matomo_visits`.

Activez le switch "Modifier sous forme de texte" et collez le contenu du fichier `GoogleBigQuery/bigquery-table-schema.json` de ce repo.

Cliquez ensuite sur le bouton bleu "Créer une table".

## Google Cloud Run

Maintenant que notre table BigQuery est crée, il va valloir l'alimenter avec des données de l'API de Matomo.

Pour cela, nous allons avoir besoin de faire fonctionner un script de manière régulière pour extraire les données, les formatter et les injecter dans BigQuery.

Redez-vous sur [Google Cloud Run](https://console.cloud.google.com/run/) (Activez l'API si c'est la première fois).

## Créer une fonction

Une fois sur le tableau de bord de Cloud Run, cliquez sur "Ecrire une fonction".

### Configurer un service

Nommez votre service `matomo-bigquery-importer`.

Définissez la région qui correspond à votre législation '`europe-west-1`).

Choisissez une execution sur `Node.js 22` ou plus récent.

Cochez "Utiliser IAM pour authentifier les requêtes entrantes".

Cochez "Exiger l'authentification".

Descendez toute en bas et cliquez sur le bouton bleu "Créer".

### Ajouter des sources

Maintenant que votre service est créé, il faut lui ajouter des source (le code qu'il va executer).

- Dans le fichier `index.js`, collez le contenu du fichier `GoogleCloudRun/index.js`
- Dans le fichier `package.json`, collez le contenu du fichier `GoogleCloudRun/package.json`

Une fois les deux fichiers modifiés, cliquez sur "Enregistrer et déployer".

### Créer un Job

Dans le menu latéral, sélectionnez "Jobs"

Cliquez sur "Créer un job"

Selectionnez l'URL de l'image du conteneur en selectionant dans la liste, l'image qui à le badge `latest` (n'hésitez pas à déplier les options pour trouver la bonne image du conteneur).

Une fois l'image selectionnée, cliquez sur en "Enregistrer".

### Définir un déclencheur avec Google Scheduler

Dans notre "Job", rendez-vous dans l'onglet "Déclencheurs"

Cliquez sur "Ajouter un déclencheur de programmeur" et définissez la fréquience sur `0 2 * * *` (ce qui équivaut à 02h du matin tous les jours)

Dans le champs suivant, selectionnez votre fuseaux horaire.

Et cliquez sur "Créer"
