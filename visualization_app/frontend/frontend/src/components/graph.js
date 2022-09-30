import React, { Component } from "react"
import {Bar} from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

export default class Graph extends Component  {

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
    
    generatingLabel(elem) {
            if (Object.keys(elem).includes("Hour")) {
                return elem.Hour + ":00"
            } else {
                return elem.Date.value
            }
            
        }
        // console.log(labels)
        // return labels.toString()

    generatingValues() {

        var values = this.props.data.map(elem => {
            return {y: elem.Price, x: this.generatingLabel(elem), PriceDiff: elem.PriceDiff, PercChange: elem.PercentageChange}
        })
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
                       align: "start",
                       formatter: function(value) {
                        try {                        
                            return value.y.toFixed(5) + "$" + ` (${value.PriceDiff.toFixed(5)}$) ` 
                        + ` (${value.PercChange.toFixed(5)}%) `
                        } catch(e) {
                            return Math.round(value.y * (Math.pow(10, 5))) / Math.pow(10, 5) + "$" + ` (${value.PriceDiff}$) ` 
                            + ` (${value.PercChange}%) `
                        }
                    }
                }
                }
              }}
            />
            </div>
            </div>
        )
    }


}