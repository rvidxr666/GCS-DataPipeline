import React, { Component } from "react"
import Graph from "./graph";
const axios = require('axios').default;


export default class Coin extends Component {
    constructor(props) {
        super(props)


        this.onChangeName = this.onChangeName.bind(this);
        this.onChangePeriod = this.onChangePeriod.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: "Ethereum",
            period: "Date",
            cryptoNames: [],
            dataPlot: []
        }

    }

    // async genCryptoNames() {
    //     var res = await axios.get("http://localhost:5000/coins/list")
    //     var arrNames = Object.values(res.data.data.map(elem => elem.Name))
    //     console.log(arrNames)
    //     return arrNames
    // }

    async componentDidMount() {
        var res = await axios.get("http://localhost:5000/coins/list")
        this.setState({
            cryptoNames: res.data.data.map(elem => elem.Name)
        })
            // .then(res => {
            //     this.setState({
            //         cryptoNames: res.data.data.map(elem => elem.Name)
            //     })
            //     console.log(this.state.cryptoNames)
            // })

        const default_req = {
            name: this.state.name,
            period: this.state.period
        }

        var res = await axios.post("http://localhost:5000/coins/api", default_req)
        this.setState({
            dataPlot: res.data.data})
            // .then(res => this.setState({
            //     dataPlot: res.data.data})
            // )

        console.log(this.state.dataPlot)

            // .then(res => console.log(res.data.data))
    }

    onChangeName(e) {
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

        var res = await axios.post("http://localhost:5000/coins/api", req)
        this.setState({
            dataPlot: res.data.data})
            // .then(res => this.setState({
            //     dataPlot: res.data.data}))
    

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
                            // value={this.state.name}
                            value={this.state.name}
                            onChange={this.onChangeName}>
                            {
                                this.state.cryptoNames.map(function(cryptoName) {
                                return <option 
                                    key={cryptoName}
                                    value={cryptoName}>{cryptoName}
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