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

const {BigQuery} = require('@google-cloud/bigquery');
const axios = require('axios');
const functions = require('@google-cloud/functions-framework');

const bigquery = new BigQuery();

const sanitizeForBigQuery = value => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value ? value : null;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return null;
        }
    }
    return String(value);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchMatomoData = async (offset) => {
    const response = await axios.post(
        `${matomo_host}/?module=API`,
        new URLSearchParams({
            method: 'Live.getLastVisitsDetails',
            format: 'json',
            idSite: matomo_site_id,
            period: matomo_period,
            date: matomo_date,
            filter_offset: offset,
            filter_limit: matomo_filter_limit,
            token_auth: matomo_token_auth
        }),
        {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }
    );

    return response.data;
};

const transformVisitData = (visit) => {
    return {
        idSite: parseInt(visit.idSite),
        idVisit: parseInt(visit.idVisit),
        visitIp: sanitizeForBigQuery(visit.visitIp),
        visitorId: sanitizeForBigQuery(visit.visitorId),
        fingerprint: sanitizeForBigQuery(visit.fingerprint),
        actionDetails: Array.isArray(visit.actionDetails)
            ? visit.actionDetails.map(a => ({
                // Events
                eventCategory: sanitizeForBigQuery(a.eventCategory),
                eventAction: sanitizeForBigQuery(a.eventAction),
                eventName: sanitizeForBigQuery(a.eventName),
                eventValue: sanitizeForBigQuery(a.eventValue),

                // Page
                type: sanitizeForBigQuery(a.type),
                url: sanitizeForBigQuery(a.url),
                pageTitle: sanitizeForBigQuery(a.pageTitle),
                pageIdAction: parseInt(a.pageIdAction),
                idpageview: sanitizeForBigQuery(a.idpageview),
                serverTimePretty: sanitizeForBigQuery(a.serverTimePretty),
                pageId: parseInt(a.pageId),
                title: sanitizeForBigQuery(a.title),
                subtitle: sanitizeForBigQuery(a.subtitle),

                pageLoadTime: sanitizeForBigQuery(a.pageLoadTime),
                timeSpent: parseInt(a.timeSpent),
                timeSpentPretty: sanitizeForBigQuery(a.timeSpentPretty),
                pageLoadTimeMilliseconds: parseInt(a.pageLoadTimeMilliseconds),
                pageviewPosition: parseInt(a.pageviewPosition),

                icon: sanitizeForBigQuery(a.icon),
                iconSVG: sanitizeForBigQuery(a.iconSVG),
                timestamp: parseInt(a.timestamp),

                // Custom dimensions with scope "action"
                dimension1: sanitizeForBigQuery(a.dimension1),
                dimension2: sanitizeForBigQuery(a.dimension2),
                dimension3: sanitizeForBigQuery(a.dimension3),
                dimension4: sanitizeForBigQuery(a.dimension4),
                dimension5: sanitizeForBigQuery(a.dimension5),
                dimension6: sanitizeForBigQuery(a.dimension6),
                dimension7: sanitizeForBigQuery(a.dimension7),
                dimension8: sanitizeForBigQuery(a.dimension8),
                dimension9: sanitizeForBigQuery(a.dimension9),
                dimension10: sanitizeForBigQuery(a.dimension10),
                dimension11: sanitizeForBigQuery(a.dimension11),
                dimension12: sanitizeForBigQuery(a.dimension12),
                dimension13: sanitizeForBigQuery(a.dimension13),
                dimension14: sanitizeForBigQuery(a.dimension14),
                dimension15: sanitizeForBigQuery(a.dimension15)
            }))
            : [],
        goalConversions: parseInt(visit.goalConversions),
        siteCurrency: sanitizeForBigQuery(visit.siteCurrency),
        siteCurrencySymbol: sanitizeForBigQuery(visit.siteCurrencySymbol),
        serverDate: sanitizeForBigQuery(visit.serverDate),
        visitServerHour: sanitizeForBigQuery(visit.visitServerHour),
        lastActionTimestamp: parseInt(visit.lastActionTimestamp),
        lastActionDateTime: sanitizeForBigQuery(visit.lastActionDateTime),
        siteName: sanitizeForBigQuery(visit.siteName),
        serverTimestamp: parseInt(visit.serverTimestamp),
        firstActionTimestamp: parseInt(visit.firstActionTimestamp),
        serverTimePretty: sanitizeForBigQuery(visit.serverTimePretty),
        serverDatePretty: sanitizeForBigQuery(visit.serverDatePretty),
        serverDatePrettyFirstAction: sanitizeForBigQuery(visit.serverDatePrettyFirstAction),
        serverTimePrettyFirstAction: sanitizeForBigQuery(visit.serverTimePrettyFirstAction),
        userId: sanitizeForBigQuery(visit.userId),
        visitorType: sanitizeForBigQuery(visit.visitorType),
        visitorTypeIcon: sanitizeForBigQuery(visit.visitorTypeIcon),
        visitConverted: visit.visitConverted ? 1 : 0,
        visitConvertedIcon: sanitizeForBigQuery(visit.visitConvertedIcon),
        visitCount: parseInt(visit.visitCount),
        totalEcommerceItems: parseInt(visit.totalEcommerceItems),
        totalAbandonedCartsRevenue: parseInt(visit.totalAbandonedCartsRevenue),
        visitEcommerceStatus: sanitizeForBigQuery(visit.visitEcommerceStatus),
        visitEcommerceStatusIcon: sanitizeForBigQuery(visit.visitEcommerceStatusIcon),
        daysSinceFirstVisit: parseInt(visit.daysSinceFirstVisit),
        secondsSinceFirstVisit: parseInt(visit.secondsSinceFirstVisit),
        daysSinceLastEcommerceOrder: parseInt(visit.daysSinceLastEcommerceOrder),
        secondsSinceLastEcommerceOrder: parseInt(visit.secondsSinceLastEcommerceOrder),
        visitDuration: parseInt(visit.visitDuration),
        visitDurationPretty: sanitizeForBigQuery(visit.visitDurationPretty),
        searches: parseInt(visit.searches),
        actions: parseInt(visit.actions),
        interactions: parseInt(visit.interactions),
        referrerType: sanitizeForBigQuery(visit.referrerType),
        referrerTypeName: sanitizeForBigQuery(visit.referrerTypeName),
        referrerName: sanitizeForBigQuery(visit.referrerName),
        referrerKeyword: sanitizeForBigQuery(visit.referrerKeyword),
        referrerKeywordPosition: parseInt(visit.referrerKeywordPosition),
        referrerUrl: sanitizeForBigQuery(visit.referrerUrl),
        referrerSearchEngineUrl: sanitizeForBigQuery(visit.referrerSearchEngineUrl),
        referrerSearchEngineIcon: sanitizeForBigQuery(visit.referrerSearchEngineIcon),
        referrerSocialNetworkUrl: sanitizeForBigQuery(visit.referrerSocialNetworkUrl),
        referrerSocialNetworkIcon: sanitizeForBigQuery(visit.referrerSocialNetworkIcon),
        languageCode: sanitizeForBigQuery(visit.languageCode),
        language: sanitizeForBigQuery(visit.language),
        deviceType: sanitizeForBigQuery(visit.deviceType),
        deviceTypeIcon: sanitizeForBigQuery(visit.deviceTypeIcon),
        deviceBrand: sanitizeForBigQuery(visit.deviceBrand),
        deviceModel: sanitizeForBigQuery(visit.deviceModel),
        operatingSystem: sanitizeForBigQuery(visit.operatingSystem),
        operatingSystemName: sanitizeForBigQuery(visit.operatingSystemName),
        operatingSystemIcon: sanitizeForBigQuery(visit.operatingSystemIcon),
        operatingSystemCode: sanitizeForBigQuery(visit.operatingSystemCode),
        operatingSystemVersion: sanitizeForBigQuery(visit.operatingSystemVersion),
        browserFamily: sanitizeForBigQuery(visit.browserFamily),
        browserFamilyDescription: sanitizeForBigQuery(visit.browserFamilyDescription),
        browser: sanitizeForBigQuery(visit.browser),
        browserName: sanitizeForBigQuery(visit.browserName),
        browserIcon: sanitizeForBigQuery(visit.browserIcon),
        browserCode: sanitizeForBigQuery(visit.browserCode),
        browserVersion: sanitizeForBigQuery(visit.browserVersion),
        events: parseInt(visit.events),
        continent: sanitizeForBigQuery(visit.continent),
        continentCode: sanitizeForBigQuery(visit.continentCode),
        country: sanitizeForBigQuery(visit.country),
        countryCode: sanitizeForBigQuery(visit.countryCode),
        countryFlag: sanitizeForBigQuery(visit.countryFlag),
        region: sanitizeForBigQuery(visit.region),
        regionCode: sanitizeForBigQuery(visit.regionCode),
        city: sanitizeForBigQuery(visit.city),
        location: sanitizeForBigQuery(visit.location),
        latitude: sanitizeForBigQuery(visit.latitude),
        longitude: sanitizeForBigQuery(visit.longitude),
        visitLocalTime: sanitizeForBigQuery(visit.visitLocalTime),
        visitLocalHour: sanitizeForBigQuery(visit.visitLocalHour),
        daysSinceLastVisit: parseInt(visit.daysSinceLastVisit),
        secondsSinceLastVisit: parseInt(visit.secondsSinceLastVisit),
        resolution: sanitizeForBigQuery(visit.resolution),
        plugins: sanitizeForBigQuery(visit.plugins),
        pluginsIcons: Array.isArray(visit.pluginsIcons)
            ? visit.pluginsIcons.map(p => ({
                pluginIcon: sanitizeForBigQuery(p.pluginIcon),
                pluginName: sanitizeForBigQuery(p.pluginName)
            }))
            : [],
        experiments: (() => {
            try {
                if (!visit.experiments || typeof visit.experiments !== 'string' || !visit.experiments.trim().startsWith('[')) return [];
                return JSON.parse(visit.experiments).map(e => ({
                    idexperiment: sanitizeForBigQuery(e.idexperiment),
                    name: sanitizeForBigQuery(e.name),
                    variation: e.variation ? {
                        idvariation: parseInt(e.variation.idvariation),
                        name: sanitizeForBigQuery(e.variation.name)
                    } : null
                }));
            } catch (e) {
                return [];
            }
        })(),
        adClickId: sanitizeForBigQuery(visit.adClickId),
        adProviderId: sanitizeForBigQuery(visit.adProviderId),
        adProviderName: sanitizeForBigQuery(visit.adProviderName),
        crashes: typeof visit.crashes === 'string' ? parseInt(visit.crashes) : visit.crashes,

        // Custom dimensions with scope "visits"
        dimension1: sanitizeForBigQuery(visit.dimension1),
        dimension2: sanitizeForBigQuery(visit.dimension2),
        dimension3: sanitizeForBigQuery(visit.dimension3),
        dimension4: sanitizeForBigQuery(visit.dimension4),
        dimension5: sanitizeForBigQuery(visit.dimension5),
        dimension6: sanitizeForBigQuery(visit.dimension6),
        dimension7: sanitizeForBigQuery(visit.dimension7),
        dimension8: sanitizeForBigQuery(visit.dimension8),
        dimension9: sanitizeForBigQuery(visit.dimension9),
        dimension10: sanitizeForBigQuery(visit.dimension10),
        dimension11: sanitizeForBigQuery(visit.dimension11),
        dimension12: sanitizeForBigQuery(visit.dimension12),
        dimension13: sanitizeForBigQuery(visit.dimension13),
        dimension14: sanitizeForBigQuery(visit.dimension14),
        dimension15: sanitizeForBigQuery(visit.dimension15)
    };
};

const insertBatchToBigQuery = async (rows) => {
    if (rows.length === 0) return 0;

    await bigquery.dataset(big_query_dataset_id).table(big_query_table_id).insert(rows);
    return rows.length;
};

const importDataFromAPI = async (req, res) => {
    try {
        let totalProcessed = 0;
        let currentOffset = 0;
        let pendingRows = [];
        let hasMoreData = true;

        console.log(`🚀 Starting batch import process...`);
        console.log(`📊 API batch size: ${matomo_filter_limit}`);
        console.log(`💾 BigQuery batch size: ${matomo_batch_size}`);
        console.log(`🎯 Max visits limit: ${matomo_max_visits || 'No limit'}`);

        while (hasMoreData) {
            // Check if we've reached the maximum visits limit
            if (matomo_max_visits > 0 && totalProcessed >= matomo_max_visits) {
                console.log(`🎯 Reached maximum visits limit (${matomo_max_visits})`);
                break;
            }

            console.log(`📥 Fetching data from offset ${currentOffset}...`);

            // Fetch data from Matomo API
            const apiData = await fetchMatomoData(currentOffset);

            // Check if we have data
            if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
                console.log(`🏁 No more data available from API`);
                hasMoreData = false;
                break;
            }

            console.log(`✅ Retrieved ${apiData.length} visits from API`);

            // Transform the data
            const transformedRows = apiData.map(transformVisitData);
            pendingRows.push(...transformedRows);

            // Process BigQuery batches when we have enough rows
            while (pendingRows.length >= matomo_batch_size) {
                const batchToInsert = pendingRows.splice(0, matomo_batch_size);

                console.log(`💾 Inserting batch of ${batchToInsert.length} rows to BigQuery...`);
                const insertedCount = await insertBatchToBigQuery(batchToInsert);
                totalProcessed += insertedCount;

                console.log(`✅ Inserted ${insertedCount} rows. Total processed: ${totalProcessed}`);

                // Check if we've reached the maximum visits limit
                if (matomo_max_visits > 0 && totalProcessed >= matomo_max_visits) {
                    console.log(`🎯 Reached maximum visits limit (${matomo_max_visits})`);
                    hasMoreData = false;
                    break;
                }
            }

            // Update offset for next API call
            currentOffset += matomo_filter_limit;

            // If we got less data than requested, we've reached the end
            if (apiData.length < matomo_filter_limit) {
                console.log(`🏁 Received less data than requested, reached end of available data`);
                hasMoreData = false;
            }

            // Add delay between API calls to be respectful to the server
            if (hasMoreData && delay_between_batches > 0) {
                console.log(`⏱️ Waiting ${delay_between_batches}ms before next API call...`);
                await sleep(delay_between_batches);
            }
        }

        // Insert any remaining rows
        if (pendingRows.length > 0) {
            console.log(`💾 Inserting final batch of ${pendingRows.length} rows to BigQuery...`);
            const insertedCount = await insertBatchToBigQuery(pendingRows);
            totalProcessed += insertedCount;
            console.log(`✅ Inserted ${insertedCount} rows. Final total: ${totalProcessed}`);
        }

        const message = `🎉 Batch import completed successfully! Total visits processed: ${totalProcessed}`;
        console.log(message);
        res.status(200).send(message);

    } catch (error) {
        const errorMessage = `❌ Error during batch import: ${error.message}`;
        console.error('Detailed error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).send(`${errorMessage}\n\n${JSON.stringify(error.errors || error.response?.data || error, null, 2)}`);
    }
};

// Register the HTTP function
functions.http('importDataFromAPI', importDataFromAPI);

// Also export for manual testing
exports.importDataFromAPI = importDataFromAPI;
