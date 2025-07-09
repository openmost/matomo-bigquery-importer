# Google BigQuery

Create a BigQuery account associated with a Google Cloud Console project.

> Make sure you have an up-to-date billing account in Google Cloud Console.

### Enable the BigQuery API

If this is your first time using BigQuery, you’ll need to enable the **BigQuery API** from your Google Cloud account.

### Create a Dataset

In your BigQuery project, click on the three vertical dots to the right of the project name and click **"Create dataset"**.

Name your dataset: `matomo_extract`.

Set the **Region** to: `europe-west1 (Belgium)`.

Click **"Create dataset"**.

### Create a Table in the Dataset

On the newly created dataset, click on the three vertical dots next to the dataset and then on **"Create table"**.

In the **"Table*"** field, enter the value `matomo_visits`.

Enable the **"Edit as text"** switch and paste the contents of the file [`GoogleBigQuery/bigquery-table-schema.json`](./GoogleBigQuery/bigquery-table-schema.json) from this repo.

Then click the blue **"Create table"** button.

# Google Cloud Run

Now that our BigQuery table is created, we need to populate it with data from the Matomo API.

To do this, we’ll need to run a script on a regular basis to extract the data, format it, and inject it into BigQuery.

Go to [Google Cloud Run](https://console.cloud.google.com/run/) (enable the API if this is your first time).

Once on the Cloud Run dashboard, click **"Write a function"**.

### Configure a Service

Name your service: `matomo-bigquery-importer`.

Set the region that corresponds to your legislation: `europe-west1`.

Choose a runtime of `Node.js 22` or later.

Check **"Use IAM to authenticate incoming requests"**.

Check **"Require authentication"**.

Scroll all the way down and click the blue **"Create"** button.

### Add Source Files

Now that your service is created, you need to add source files (the code it will execute).

- In the file `index.js`, paste the contents of [`GoogleCloudRun/index.js`](./GoogleCloudRun/index.js) (set `importDataFromAPI` as entry point function name)
- In the file `package.json`, paste the contents of [`GoogleCloudRun/package.json`](./GoogleCloudRun/package.json)

> In the `index.js` file, the first few lines need to be updated:

```javascript
// START CONFIGURATION //
const matomo_host = 'https://matomo.example.com';
const matomo_token_auth = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const matomo_site_id = 1;
const matomo_period = 'day';
const matomo_date = 'yesterday'; 
const matomo_filter_limit = 100;        // API batch size per request
const matomo_batch_size = 1000;         // BigQuery insert batch size
const matomo_max_visits = 50000;        // Maximum visits to process (0 = no limit)
const big_query_dataset_id = 'matomo_extract';
const big_query_table_id = 'matomo_visits';
const delay_between_batches = 1000;     // Delay in milliseconds between API calls
// END CONFIGURATION //
```
Once both files are modified, click **"Save and deploy"**.

# Google Cloud Scheduler

Go to [Google Cloud Scheduler](https://console.cloud.google.com/cloudscheduler).

Create a new job.

Define a name like "matomo-bigquery-importer"

Set your region `europe-west-1 (Belgique)`

Set the frequency to `0 2 * * *` (which means 2:00 AM every day).

Set your timestamp.

Click **Continue**

Now define the target as `HTTP`.

The URL is the URL of your Cloud Run Function (available from your Cloud Run function dashboard).

Set method to **POST**

For the authorization, select **OIDC token** and select your service account.

In the last part, set an attempt limit to 2 and save.

## Visualise data using BigQuery

When you look at your data, click on the "Request" button and execute any request you want.

You can try to run queries, here are some [demo queries](./GoogleBigQuery/demo-queries.md).


## Disclaimer

> These scripts may evolve over time.
> 
> Openmost cannot be held responsible for any price overruns in Google Cloud environments.
