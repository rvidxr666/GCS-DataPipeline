import React, { Component } from "react"
import {Bar} from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

export default class Graph extends Component  {
    // constructor(props) {
    //     // super(props)
    //     // this.generatePlot = this.generatePlot.bind(this);
    //     // this.state = {
    //     //     plotState: "", 
    //     //     Name: props.data[0].Name || this.props.data[0].Network
    //     // }
    // }

    componentDidMount() {
        console.log(this.props.data)
    }

    generatingLabels() {
        var labels = this.props.data.map(elem => {
            if (Object.keys(elem).includes("Hour")) {
                return elem.Hour + ":00"
            } else {
                return elem.Date.value
            }
            
        })
        // console.log(labels)
        // return labels.toString()
        return labels
    }

    generatingValues() {

        var values = this.props.data.map(elem => elem.PriceDiff)
        // return values.toString()
        return values
    }

    accessingName() {

        if (!this.props.data.length) {
            return ""
        }

        if (Object.keys(this.props.data[0]).includes("Name")) {
            return this.props.data[0].Name
        } else {
            return this.props.data[0].Network
        }
    }

    generatePlot() {
        var labels = this.generatingLabels()
        var data = this.generatingValues()
        const state = {
            labels: labels,
            datasets: [
              {
                label: this.accessingName(),
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 2,
                data: data
              }
            ]
        }


        // this.setState({
        //     plotState: state
        // })

        return state
    }

    render() {
        return (
            <div className="row mb-3">
            <div className=".col-md-6 .offset-md-3">
            <Bar
              data={this.generatePlot()}
              options={{
                title:{
                  display:true,
                  text:"Asss",
                  fontSize:20
                },
                legend:{
                  display:true,
                  position:'right'
                }, 
                plugins: {
                    datalabels: {
                       display: true,
                       color: 'black', 
                       anchor: "end",
                       offset: -20,
                       align: "start"
                    }
                }
              }}
            />
            </div>
            </div>
            // <div>
            //     <p>{this.generatingValues()}</p>
            //     <p>{this.generatingLabels()}</p>
            // </div>
        )
    }


}