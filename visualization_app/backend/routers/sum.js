const router = require("express").Router()

const location = "EU"
const projectID = process.env.projectID // Project ID
const dataset = process.env.DatasetID  // BigQuuery Dataset
const keyPath =   "/home/maksi/.google/credentials/google_credentials.json" // KeyPath

// request with the name (Crypto name) and period (Hour, Date)
router.route("/api").get(async (req, res) => {

    rows = await queryBigQuery()
    res.json({
        "data": rows
    })
})

const queryBigQuery = async () => {
    const {BigQuery} = require("@google-cloud/bigquery")

    const bigquery = new BigQuery({
        projectId: projectID, // how to ref it properly
        keyFilename: keyPath
    })

    const table = "summarize_net"

    const query = `
        SELECT * FROM ${projectID}.${dataset}.${table}
    `
    const options = {
        query: query
    }

    const [job] = await bigquery.createQueryJob(options)
    const [rows] = await job.getQueryResults()


    return rows

}

module.exports = router