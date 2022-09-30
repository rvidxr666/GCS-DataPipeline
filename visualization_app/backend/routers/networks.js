const router = require("express").Router()


// request with the name (Crypto network) and period (Hour, Date)
router.route("/api").post(async (req, res) => {
    const network = req.body.name 
    const period = req.body.period
    console.log(network, period)

    rows = await queryBigQuery(network, period)
    res.json({
        "name": network,
        "period": period, 
        "data": rows
    })
})

const queryBigQuery = async (network, period) => {
    const {BigQuery} = require("@google-cloud/bigquery")

    const bigquery = new BigQuery({
        projectId: 'marine-catfish-310009', // how to ref it properly
        keyFilename: '/home/maksi/.google/credentials/google_credentials.json'
    })

    const location = "EU"
    const projectID = "marine-catfish-310009"
    const dataset = "pipeline_dataset"

    const query = `
        SELECT ${period}, Network, Price, PriceDiff, PercentageChange
        FROM ${projectID}.${dataset}.${period.toLowerCase()}s_net
        WHERE Network = "${network}"
        ORDER BY ${period}
    `
    const options = {
        query: query
    }

    const [job] = await bigquery.createQueryJob(options)
    const [rows] = await job.getQueryResults()


    // rows.forEach(row => console.log(row))

    return rows

}

module.exports = router