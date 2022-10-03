const router = require("express").Router()

const location = "EU"
const projectID = process.env.projectID // Project ID
const dataset = process.env.DatasetID  // BigQuuery Dataset
const keyPath =   "/home/maksi/.google/credentials/google_credentials.json" // KeyPath

const {BigQuery} = require("@google-cloud/bigquery")

const bigquery = new BigQuery({
    projectId: projectID, // how to ref it properly
    keyFilename: keyPath
})

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


router.route("/list").get(async (req, res) => {
    const query = `
        SELECT DISTINCT Network
        FROM ${projectID}.${dataset}.dates_net
    `
    const options = {
        query: query
    }

    const [job] = await bigquery.createQueryJob(options)
    const [rows] = await job.getQueryResults()

    res.json({
        "data": rows
    })
})


// router.route("/list").get(async () => {
//     const query = `
//         SELECT DISTINCT Network
//         FROM ${projectID}.${dataset}.dates_net
//     `
//     const options = {
//         query: query
//     }

//     const [job] = await bigquery.createQueryJob(options)
//     const [rows] = await job.getQueryResults()

//     return rows
// })

const queryBigQuery = async (network, period) => {

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