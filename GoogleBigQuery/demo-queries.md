> Adapt `your-project-name` on each request.

# KPI per day

```sql
SELECT
  serverDate,
  COUNT(DISTINCT idVisit) AS total_visits,
  COUNT(*) AS total_actions,
  SUM(interactions) AS total_interactions,
  SUM(goalConversions) AS total_goal_conversions,
  SUM(CASE WHEN visitConverted = 1 THEN 1 ELSE 0 END) AS converted_visits,
  AVG(visitDuration) AS avg_duration_seconds,
  AVG(actions) AS avg_actions_per_visit
FROM
  `your-project-name.matomo_extract.matomo_visits`
WHERE
  serverDate IS NOT NULL AND serverDate != ''
GROUP BY
  serverDate
ORDER BY
  serverDate ASC;
```

# Top events

```sql
SELECT
  ad.eventCategory,
  ad.eventAction,
  ad.eventName,
  ad.eventValue,
  COUNT(*) AS total
FROM
  `your-project-name.matomo_extract.matomo_visits`,
  UNNEST(actionDetails) AS ad
WHERE
  ad.eventName IS NOT NULL
  AND ad.eventName != ''
GROUP BY
  ad.eventName,
  ad.eventCategory,
  ad.eventAction,
  ad.eventValue
ORDER BY
  total DESC
LIMIT 50;
```
## Top page URL and title

```sql
SELECT
    ad.url,
    ad.pageTitle,
    COUNT(*) AS total_views
FROM
    `your-project-name.matomo_extract.matomo_visits`,
    UNNEST(actionDetails) AS ad
WHERE
    ad.type = 'action'
  AND ad.url IS NOT NULL
  AND ad.url != ''
  AND ad.pageTitle IS NOT NULL
  AND ad.pageTitle != ''
GROUP BY
    ad.url, ad.pageTitle
ORDER BY
    total_views DESC
LIMIT 50;
```

# Top browser per countries

```sql
SELECT
  country,
  browser,
  COUNT(*) AS total_visits
FROM
  `your-project-name.matomo_extract.matomo_visits`
WHERE
  country IS NOT NULL AND country != ''
  AND browser IS NOT NULL AND browser != ''
GROUP BY
  country,
  browser
ORDER BY
  country,
  total_visits DESC;
```
