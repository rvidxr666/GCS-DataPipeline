const router = require("express").Router()

// BigQuery client
const {BigQuery} = require("@google-cloud/bigquery")

const bigquery = new BigQuery({
    projectId: 'marine-catfish-310009', // how to ref it properly
    keyFilename: '/home/maksi/.google/credentials/google_credentials.json'
})

const location = "EU"
const projectID = "marine-catfish-310009"
const dataset = "pipeline_dataset"

// request with the name (Crypto name) and period (Hour, Date)
router.route("/api").post(async (req, res) => {
    const name = req.body.name 
    const period = req.body.period
    console.log(name, period)

    rows = await queryBigQuery(name, period)
    res.json({
        "name": name,
        "period": period, 
        "data": rows
    })
})

// List unique cryptocurrencies
router.route("/list").get(async (req, res) => {
    rows = await queryListOfCrypto()
    res.json({
        "data": rows
    })
})

// Get list of unique cryptocurrencies
const queryListOfCrypto = async () => {
    const query = `
        SELECT DISTINCT Name
        FROM ${projectID}.${dataset}.dates_coin
    `
    const options = {
        query: query
    }

    const [job] = await bigquery.createQueryJob(options)
    const [rows] = await job.getQueryResults()

    return rows
}

const queryBigQuery = async (name, period) => {

    const query = `
        SELECT ${period}, Name, Price, PriceDiff, PercentageChange
        FROM ${projectID}.${dataset}.${period.toLowerCase()}s_coin
        WHERE Name = "${name}"
        ORDER BY ${period}
    `
    const options = {
        query: query
    }

    const [job] = await bigquery.createQueryJob(options)
    const [rows] = await job.getQueryResults()

    return rows

}


queryBigQuery("Ethereum", "Date")

module.exports = router
