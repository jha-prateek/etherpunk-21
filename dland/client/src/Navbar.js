import React, { Component } from 'react';
import { Link } from "react-router-dom";
import logo from './dstays2.png';

export default class Navbar extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {
        return (
            <nav
                className="navbar navbar-expand-lg fixed-top navbar-dark shadow-lg"
            >
                <Link className="navbar-brand navbar-nav" to="/">
                    <img src={logo} />
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarTogglerDemo02"
                    aria-controls="navbarTogglerDemo02"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                    <ul className="navbar-nav mr-auto"></ul>
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item active" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/"><h5>Dashboard</h5></Link>
                        </li>
                        <li className="nav-item active" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/property"><h5>Rent Out</h5></Link>
                        </li>
                        <li className="nav-item active" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/bookings"><h5>My Bookings</h5></Link>
                        </li>
                        <li className="nav-item active" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/properties"><h5>My Properties</h5></Link>
                        </li>
                    </ul>
                </div>
            </nav>
        )
    }
}
