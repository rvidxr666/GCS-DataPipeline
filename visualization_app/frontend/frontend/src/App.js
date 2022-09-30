import React from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"

import Landing from './components/landing';
import Navbar from './components/navbar';
import Net from './components/networks';
import Sum from './components/sum';
import Coin from './components/coins';

function App() {
  return (
    <Router>
      <Navbar />
      <br/>
      <Routes>
        <Route path='/' element={<Landing />}></Route>
        <Route path='/networks' element={<Net />}></Route>
        <Route path='/coins' element={<Coin />}></Route>
        <Route path='/sum' element={<Sum />}></Route>   
      </Routes>  
    </Router>
  );
}

export default App;
