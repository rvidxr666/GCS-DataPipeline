import React, { Component } from "react"
import {Link} from "react-router-dom"

export default class Navbar extends Component {
    render() {
        return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link to="/" className="navbar-brand">Dashboard-App</Link>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <Link to="/coins" className="nav-link">Coins-Data</Link>
            </li>
            <li className="nav-item">
              <Link to="/networks" className="nav-link">Network-Data</Link>
            </li>
            <li className="nav-item">
              <Link to="/sum" className="nav-link">Sum-Networks</Link>
            </li>
          </ul>
        </div>
      </nav>
      )
    }
}