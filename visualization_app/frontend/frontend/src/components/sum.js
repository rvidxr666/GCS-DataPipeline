import React, { Component } from "react"
import {Pie} from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

const axios = require('axios').default;


export default class Coin extends Component {
    constructor(props) {
        super(props)

        this.state = {
            dataPlot: []
        }

    }

    async componentDidMount() {
        var res = await axios.get("http://localhost:5000/sum/api")
        this.setState({
            dataPlot: res.data.data
        })
    }


    render() {
        return (
            <SumGraph data={this.state.dataPlot}/>
        )
    }
}


function SumGraph(props) {

    const generateLabels = () => {
        var labels = props.data.map(elem => elem.Network)
        return labels
    }

    const generateVals = () => {
        var values = props.data.map(elem => elem.NetworkCount)
        return values
    }

    const generateData = () => {
        const data = {
            labels: generateLabels(),
            datasets: [
              {
                label: "Amount of cryptocurrency per Network",
                data: generateVals(),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
              },
            ],
          };
        
        return data
    }

    return (
        <>
            <div className="row mb-3">
            <div className=".col-md-6 .offset-md-3">
                <Pie data={generateData()} />
            </div>
            </div>     
        </>
    )
  }