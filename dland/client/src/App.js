import React, { Component } from "react";
import PropertyRental from "./contracts/PropertyRental.json";
import getWeb3 from "./getWeb3";
import config from './config.json';

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import {
  // BrowserRouter as Router,
  HashRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import Dashboard from './Dashboard';
import Register from './RegisterProperty'
import Navbar from "./Navbar";
import MyBookings from './MyBookings';
import MyProperties from './MyProperties';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    transactionHash: 'No transactions yet'
  };

  componentDidMount = async () => {
    try {

      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = PropertyRental.networks[networkId];
      const instance = new web3.eth.Contract(
        PropertyRental.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        {
          web3, accounts, contract: instance
        }
        // , this.runExample
      );

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    // const request = await contract.methods.rentOutproperty(
    //   '3500 Deer Creek Road Palo Alto, CA 94304;8507783427',
    //   1234, 1, 1613073764999, 0, 4500, 10000).send({ from: accounts[0] });

    // console.log(request);

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getProperies().call();
    console.log('Response', response);

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Router>
          <Navbar />
          <Route path="/" exact render={
            (props) => <Dashboard {...props} contract={this.state.contract} account={this.state.accounts[0]} web3={this.state.web3} />
          } />
          <Route path="/property" exact render={
            (props) => <Register {...props} contract={this.state.contract} account={this.state.accounts[0]} />
          } />
          <Route path="/bookings" exact render={
            (props) => <MyBookings {...props} contract={this.state.contract} account={this.state.accounts[0]} web3={this.state.web3} />
          } />
          <Route path="/properties" exact render={
            (props) => <MyProperties {...props} contract={this.state.contract} account={this.state.accounts[0]} />
          } />
        </Router>
      </div>
    )
  }
}

export default App;
