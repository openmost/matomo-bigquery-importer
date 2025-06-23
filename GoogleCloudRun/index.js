// START CONFIGURATION //
const matomo_host = 'https://demo.ronan-hello.fr';
const matomo_site_id = 1;
const matomo_token_auth = 'bb9e8fdd6a4aad34e3f9f832f0ce6ee2';
const matomo_period = 'day';
const matomo_date = 'yesterday';
const matomo_filter_offset = 0;
const matomo_filter_limit = 100;
const big_query_dataset_id = 'matomo_extract';
const big_query_table_id = 'matomo_visits';
// END CONFIGURATION //

const {BigQuery} = require('@google-cloud/bigquery');
const axios = require('axios');

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

exports.importDataFromAPI = async (req, res) => {
    try {
        const response = await axios.post(
            `${matomo_host}/?module=API`,
            new URLSearchParams({
                method: 'Live.getLastVisitsDetails',
                format: 'json',
                idSite: matomo_site_id,
                period: matomo_period,
                date: matomo_date,
                filter_offset: matomo_filter_offset,
                filter_limit: matomo_filter_limit,
                token_auth: matomo_token_auth
            }),
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        );

        const rows = response.data.map(v => {
            return {
                idSite: parseInt(v.idSite),
                idVisit: parseInt(v.idVisit),
                visitIp: sanitizeForBigQuery(v.visitIp),
                visitorId: sanitizeForBigQuery(v.visitorId),
                fingerprint: sanitizeForBigQuery(v.fingerprint),
                actionDetails: Array.isArray(v.actionDetails)
                    ? v.actionDetails.map(a => ({

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
                goalConversions: parseInt(v.goalConversions),
                siteCurrency: sanitizeForBigQuery(v.siteCurrency),
                siteCurrencySymbol: sanitizeForBigQuery(v.siteCurrencySymbol),
                serverDate: sanitizeForBigQuery(v.serverDate),
                visitServerHour: sanitizeForBigQuery(v.visitServerHour),
                lastActionTimestamp: parseInt(v.lastActionTimestamp),
                lastActionDateTime: sanitizeForBigQuery(v.lastActionDateTime),
                siteName: sanitizeForBigQuery(v.siteName),
                serverTimestamp: parseInt(v.serverTimestamp),
                firstActionTimestamp: parseInt(v.firstActionTimestamp),
                serverTimePretty: sanitizeForBigQuery(v.serverTimePretty),
                serverDatePretty: sanitizeForBigQuery(v.serverDatePretty),
                serverDatePrettyFirstAction: sanitizeForBigQuery(v.serverDatePrettyFirstAction),
                serverTimePrettyFirstAction: sanitizeForBigQuery(v.serverTimePrettyFirstAction),
                userId: sanitizeForBigQuery(v.userId),
                visitorType: sanitizeForBigQuery(v.visitorType),
                visitorTypeIcon: sanitizeForBigQuery(v.visitorTypeIcon),
                visitConverted: v.visitConverted ? 1 : 0,
                visitConvertedIcon: sanitizeForBigQuery(v.visitConvertedIcon),
                visitCount: parseInt(v.visitCount),
                totalEcommerceItems: parseInt(v.totalEcommerceItems),
                totalAbandonedCartsRevenue: parseInt(v.totalAbandonedCartsRevenue),
                visitEcommerceStatus: sanitizeForBigQuery(v.visitEcommerceStatus),
                visitEcommerceStatusIcon: sanitizeForBigQuery(v.visitEcommerceStatusIcon),
                daysSinceFirstVisit: parseInt(v.daysSinceFirstVisit),
                secondsSinceFirstVisit: parseInt(v.secondsSinceFirstVisit),
                daysSinceLastEcommerceOrder: parseInt(v.daysSinceLastEcommerceOrder),
                secondsSinceLastEcommerceOrder: parseInt(v.secondsSinceLastEcommerceOrder),
                visitDuration: parseInt(v.visitDuration),
                visitDurationPretty: sanitizeForBigQuery(v.visitDurationPretty),
                searches: parseInt(v.searches),
                actions: parseInt(v.actions),
                interactions: parseInt(v.interactions),
                referrerType: sanitizeForBigQuery(v.referrerType),
                referrerTypeName: sanitizeForBigQuery(v.referrerTypeName),
                referrerName: sanitizeForBigQuery(v.referrerName),
                referrerKeyword: sanitizeForBigQuery(v.referrerKeyword),
                referrerKeywordPosition: parseInt(v.referrerKeywordPosition),
                referrerUrl: sanitizeForBigQuery(v.referrerUrl),
                referrerSearchEngineUrl: sanitizeForBigQuery(v.referrerSearchEngineUrl),
                referrerSearchEngineIcon: sanitizeForBigQuery(v.referrerSearchEngineIcon),
                referrerSocialNetworkUrl: sanitizeForBigQuery(v.referrerSocialNetworkUrl),
                referrerSocialNetworkIcon: sanitizeForBigQuery(v.referrerSocialNetworkIcon),
                languageCode: sanitizeForBigQuery(v.languageCode),
                language: sanitizeForBigQuery(v.language),
                deviceType: sanitizeForBigQuery(v.deviceType),
                deviceTypeIcon: sanitizeForBigQuery(v.deviceTypeIcon),
                deviceBrand: sanitizeForBigQuery(v.deviceBrand),
                deviceModel: sanitizeForBigQuery(v.deviceModel),
                operatingSystem: sanitizeForBigQuery(v.operatingSystem),
                operatingSystemName: sanitizeForBigQuery(v.operatingSystemName),
                operatingSystemIcon: sanitizeForBigQuery(v.operatingSystemIcon),
                operatingSystemCode: sanitizeForBigQuery(v.operatingSystemCode),
                operatingSystemVersion: sanitizeForBigQuery(v.operatingSystemVersion),
                browserFamily: sanitizeForBigQuery(v.browserFamily),
                browserFamilyDescription: sanitizeForBigQuery(v.browserFamilyDescription),
                browser: sanitizeForBigQuery(v.browser),
                browserName: sanitizeForBigQuery(v.browserName),
                browserIcon: sanitizeForBigQuery(v.browserIcon),
                browserCode: sanitizeForBigQuery(v.browserCode),
                browserVersion: sanitizeForBigQuery(v.browserVersion),
                events: parseInt(v.events),
                continent: sanitizeForBigQuery(v.continent),
                continentCode: sanitizeForBigQuery(v.continentCode),
                country: sanitizeForBigQuery(v.country),
                countryCode: sanitizeForBigQuery(v.countryCode),
                countryFlag: sanitizeForBigQuery(v.countryFlag),
                region: sanitizeForBigQuery(v.region),
                regionCode: sanitizeForBigQuery(v.regionCode),
                city: sanitizeForBigQuery(v.city),
                location: sanitizeForBigQuery(v.location),
                latitude: sanitizeForBigQuery(v.latitude),
                longitude: sanitizeForBigQuery(v.longitude),
                visitLocalTime: sanitizeForBigQuery(v.visitLocalTime),
                visitLocalHour: sanitizeForBigQuery(v.visitLocalHour),
                daysSinceLastVisit: parseInt(v.daysSinceLastVisit),
                secondsSinceLastVisit: parseInt(v.secondsSinceLastVisit),
                resolution: sanitizeForBigQuery(v.resolution),
                plugins: sanitizeForBigQuery(v.plugins),
                pluginsIcons: Array.isArray(v.pluginsIcons)
                    ? v.pluginsIcons.map(p => ({
                        pluginIcon: sanitizeForBigQuery(p.pluginIcon),
                        pluginName: sanitizeForBigQuery(p.pluginName)
                    }))
                    : [],
                experiments: (() => {
                    try {
                        if (!v.experiments || typeof v.experiments !== 'string' || !v.experiments.trim().startsWith('[')) return [];
                        return JSON.parse(v.experiments).map(e => ({
                            idexperiment: sanitizeForBigQuery(e.idexperiment),
                            name: sanitizeForBigQuery(e.name),
                            variation: e.variation ? {
                                idvariation: parseInt(e.variation.idvariation),
                                name: sanitizeForBigQuery(e.variation.name)
                            } : null
                        }));
                    } catch (e) {
                        console.warn('❗ Échec de parse de `experiments` pour idVisit:', v.idVisit, v.experiments);
                        return [];
                    }
                })(),
                adClickId: sanitizeForBigQuery(v.adClickId),
                adProviderId: sanitizeForBigQuery(v.adProviderId),
                adProviderName: sanitizeForBigQuery(v.adProviderName),
                crashes: typeof v.crashes === 'string' ? parseInt(v.crashes) : v.crashes,

                // Custom dimensions with scope "visits"
                dimension1: sanitizeForBigQuery(v.dimension1),
                dimension2: sanitizeForBigQuery(v.dimension2),
                dimension3: sanitizeForBigQuery(v.dimension3),
                dimension4: sanitizeForBigQuery(v.dimension4),
                dimension5: sanitizeForBigQuery(v.dimension5),
                dimension6: sanitizeForBigQuery(v.dimension6),
                dimension7: sanitizeForBigQuery(v.dimension7),
                dimension8: sanitizeForBigQuery(v.dimension8),
                dimension9: sanitizeForBigQuery(v.dimension9),
                dimension10: sanitizeForBigQuery(v.dimension10),
                dimension11: sanitizeForBigQuery(v.dimension11),
                dimension12: sanitizeForBigQuery(v.dimension12),
                dimension13: sanitizeForBigQuery(v.dimension13),
                dimension14: sanitizeForBigQuery(v.dimension14),
                dimension15: sanitizeForBigQuery(v.dimension15)
            };
        });

        await bigquery.dataset(big_query_dataset_id).table(big_query_table_id).insert(rows);
        res.status(200).send(`✅ ${rows.length} lignes insérées dans BigQuery`);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).send(`❌ Erreur pendant l'import des données : ${error.message}\n\n${JSON.stringify(error.errors || error.response?.data || error, null, 2)}`);
    }
};
