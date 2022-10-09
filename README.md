# GCP Batch Data Pipeline
The main idea of the project was to implement a simple logic of the Scheduled Batch Data Processing Pipeline with the usage of Google Cloud services such as (Google Cloud Storage Buckets, BigQuery, Cloud Run Jobs, Cloud Scheduler), Processing/Scheduling services (Apache Airflow, Apache Spark, Pandas Framework), Visualization (NodeJS, ReactJS, ChartJS) and Deployment (Terraform, Docker)
## Description
### Principle of Work
The principle of work is as follows:
1. Java-based webscraper which is deployed on Cloud Run and scheduled with Cloud Scheduler extracts the descriptive data about first 500 hundred cryptocurrencies once in hour. Example of the single record being extracted by the scraper **{"Type":"Coin","Price":20267.15,"Volume":49138747923,"Network":"Own","Time":"14-09-2022 09:35:05","Tag":"BTC","Name":"Bitcoin","MarketCap":388119294728}**  
2. Collected data is stored in the form of the .json file in the Landing Data Lake (GCS)
3. Processing Job is triggered right after the new .json file was placed in the Data Lake. 
     - Firstly, Script extracts the the .json files stored in the Landing Data Lake, for each of the cryptocurrencies script calculates the price change during the last 7 days (per day) and during the last 24 hours (per hour). In other words it tells how the price of a specific cryptocurrency was changing between last 7 days (in case of weekly threshold) and between hours of today's date.
     - Secondly, script groups cryptocurrencies by the Blockchain Network on which they are deployed on (Ethereum, BNB Smartchain, Own) and calculates the average price of cryptocurrencies that are located under the certain Network. After that it performs the caluclations explained in the first step (calculating price differences per last week and per today's date hours).  
     - Thirdly, script takes the dataframe grouped by Networks from the second step and for each of the unique Networks, it calculates the amount of unique cryptocurrencies that are deployed on it.
     - Finally, script partitions each dataframe by 4 and deploys to the "Processed" GCS Bucket
4. Processed GCS Bucket consists of the following directories ("dates_coin", "dates_net", "hours_coin", "hours_net", "summarize_net"), each of them is connected to BigQuery as an External Data Source. 
5. Visulization Application uses BigQuery REST API to access the data stored in the "Prepared Bucket", so that it was able to generate the respective graphs.  

## Architecture Visualization 
![architecture](https://github.com/rvidxr666/GCS-DataPipeline/blob/master/images/architecture.jpg?raw=true)

# Final Result
![result1](https://github.com/rvidxr666/GCS-DataPipeline/blob/master/images/coin-result.png?raw=true)
![result2](https://github.com/rvidxr666/GCS-DataPipeline/blob/master/images/net-result.png?raw=true)
![result3](https://github.com/rvidxr666/GCS-DataPipeline/blob/master/images/net-summary.png?raw=true)
