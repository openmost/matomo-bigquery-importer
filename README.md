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

- In the file `index.js`, paste the contents of [`GoogleCloudRun/index.js`](./GoogleCloudRun/index.js)
- In the file `package.json`, paste the contents of [`GoogleCloudRun/package.json`](./GoogleCloudRun/package.json)

> In the `index.js` file, the first few lines need to be updated:

```javascript
// START CONFIGURATION //
const matomo_host = 'https://matomo.my-company.com';
const matomo_site_id = 1;
const matomo_token_auth = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const matomo_period = 'day';
const matomo_date = 'yesterday';
const matomo_filter_offset = 0;
const matomo_filter_limit = 1000;
const big_query_dataset_id = 'matomo_extract';
const big_query_table_id = 'matomo_visits';
// END CONFIGURATION //
```
Once both files are modified, click **"Save and deploy"**.

### Create a Job for the Cloud Function

In the side menu, select **"Jobs"**.

Click **"Create job"**.

Select the container image URL by choosing from the list the image with the `latest` badge (feel free to expand the options to find the correct container image).

Once the image is selected, click **"Save"**.

### Define a Trigger for the Job with Google Scheduler

In your **"Job"**, go to the **"Triggers"** tab.

Click **"Add scheduler trigger"** and set the frequency to `0 2 * * *` (which means 2:00 AM every day).

In the next field, select your **time zone**.

Then click **"Create"**.

Your task is now created and available in [Google Cloud Scheduler](https://console.cloud.google.com/cloudscheduler).  
You can test it by clicking the three vertical dots under **"Action"**, then selecting **"Force run"**.

## Disclaimer

> These scripts may evolve over time.  
> Some values in the JSON object returned by the Matomo API may change and/or may not yet be supported by this script.
