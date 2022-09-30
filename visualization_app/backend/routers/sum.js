const router = require("express").Router()


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
        projectId: 'marine-catfish-310009', // how to ref it properly
        keyFilename: '/home/maksi/.google/credentials/google_credentials.json'
    })

    const location = "EU"
    const projectID = "marine-catfish-310009"
    const dataset = "pipeline_dataset"
    const table = "summarize_net"

    const query = `
        SELECT * FROM ${projectID}.${dataset}.${table}
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