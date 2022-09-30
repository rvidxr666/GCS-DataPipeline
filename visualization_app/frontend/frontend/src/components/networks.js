import React, { Component } from "react"
import Graph from "./graph";
const axios = require('axios').default;


export default class Coin extends Component {
    constructor(props) {
        super(props)


        this.onChangeNet = this.onChangeNet.bind(this);
        this.onChangePeriod = this.onChangePeriod.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: "Ethereum",
            period: "Date",
            netNames: [],
            dataPlot: []
        }

    }

    async componentDidMount() {
        var res = await axios.get("http://localhost:5000/networks/list")
        this.setState({
            netNames: res.data.data.map(elem => elem.Network)
        })

        const default_req = {
            name: this.state.name,
            period: this.state.period
        }

        var res = await axios.post("http://localhost:5000/networks/api", default_req)
        this.setState({
            dataPlot: res.data.data})
    }

    onChangeNet(e) {
        this.setState({
            name: e.target.value
        })
    }

    onChangePeriod(e) {
        this.setState({
            period: e.target.value
        })
    }

    async onSubmit(e) {
        e.preventDefault()

        console.log(this.state.name)
        const req = {
            name: this.state.name,
            period: this.state.period
        }

        var res = await axios.post("http://localhost:5000/networks/api", req)
        this.setState({
            dataPlot: res.data.data})
    }


    render() {
        return (
                <div class="container text-center">
                <div class="row justify-content-start">
                <div class="col-md-4 offset-md-4">
                    <p>Please Complete the Following information to generate the graph</p>
                    <form onSubmit={this.onSubmit} align="center" class="form-container">
                        <div className="mb-3"> 
                        <label>Name of the Cryptocurrency: </label>
                        <select ref="userInput"
                            required
                            className="form-control"
                            value={this.state.name}
                            onChange={this.onChangeNet}>
                            {
                                this.state.netNames.map(function(netName) {
                                return <option 
                                    key={netName}
                                    value={netName}>{netName}
                                    </option>;
                                })
                            }
                        </select>
                        </div>

                        <div className="mb-3"> 
                        <label>Period: </label>
                        <select 
                            ref="userInput"
                            required
                            className="form-control"
                            value={this.state.period}
                            onChange={this.onChangePeriod}>
                                    <option value="Date">Date</option>
                                    <option value="Hour">Hour</option>
                        </select>
                        </div>

                        <div className="mb-3">
                        <input type="submit" value="Generate Graph" className="btn btn-primary" />
                        </div>
                    </form>
                    </div>
                
                    <Graph data={this.state.dataPlot}/>
                </div>
                </div>
        )
    }
}