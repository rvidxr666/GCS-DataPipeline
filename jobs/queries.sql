    SELECT Network, ROUND(AVG(NetworkCount)) as NetworkCount
    FROM
        (SELECT Time, Network, COUNT(*) as NetworkCount
        FROM crypto_prices
        GROUP BY 1, 2
        ORDER BY 3 DESC)
    GROUP BY 1
    ORDER BY 2 DESC


SELECT COUNT(*)
FROM crypto_prices
WHERE Date='2022-09-14'


SELECT COUNT(*)
FROM crypto_prices
WHERE Date='2022-09-17'