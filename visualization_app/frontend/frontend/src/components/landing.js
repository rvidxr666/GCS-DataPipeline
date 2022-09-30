import React, { Component } from "react"
import {Link} from "react-router-dom"

export default class Landing extends Component {
    render() {
        return (
            <div class="container py-4">
                <div class="p-5 mb-4 bg-light rounded-3">
                    <div class="container-fluid py-5">
                        <h1 class="display-5 fw-bold">About</h1>
                        <p class="col-md-8 fs-4">Dashboarding application for visualizing Crypto Prices differences
                            </p>
                    </div>
                </div>
            
                <div class="row align-items-md-stretch">

                    <div class="col">
                        <div class="h-100 p-5 text-white bg-dark rounded-3">
                        <h2>Coins-Data</h2>
                        <p>Visualize the differences between prices of Cryptocurrencies on a weekly or daily timeframe</p>
                        <Link to="/coins" className="btn btn-outline-light" >Start</Link>
                        </div>
                    </div>

                    <div class="col">
                        <div class="h-100 p-5 bg-light border rounded-3">
                        <h2>Network-Data</h2>
                        <p>Visualize the differences between Crypto Network financial value on a daily or weekly timeframe</p>
                        <Link to="/networks" className="btn  btn-outline-secondary" >Start</Link>
                        </div>
                    </div>

                    <div class="col">
                        <div class="h-100 p-5 bg-light border rounded-3">
                        <h2>Summarize-Networks</h2>
                        <p>Visualize amount of Cryptocurrencies that belong to a specific network</p>
                        <Link to="/sum" className="btn  btn-outline-secondary" >Start</Link>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}