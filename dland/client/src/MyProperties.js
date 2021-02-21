import React, { Component } from 'react';
import Property from './PropertyCard';
import Modal from 'react-bootstrap/Modal';

export default class MyProperties extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contract: this.props.contract,
            account: this.props.account,
            myProperties: [],
            bookings: []
        }
    }

    getMyProperies = async () => {

        const { account, contract } = this.state;
        try {
            const response = await contract.methods.getMyProperties(2, account).call();
            const mergedResult = [response[0], response[1]].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
            this.setState({ myProperties: mergedResult });

        } catch (error) {
            console.error(error);
        }
    };

    componentDidMount() {
        this.getMyProperies();
    }

    render() {
        const { myProperties } = this.state;
        return (
            <div className="my-properties">
                <div className="jumbotron jumbotron-fluid bg-transparent m-0">
                    <div className="container container-fluid p-5">
                        <header className="section-heading">
                            <h1 className="section-title text-center">My Properties</h1>
                        </header>
                        <div className="container container-fluid p-5">
                            <div className="row">
                                {
                                    myProperties.length > 0 ?
                                        myProperties.map((item, key) => {
                                            return <Property key={key} propertyDetail={item} contract={this.state.contract} account={this.state.account} web3={this.props.web3} />
                                        })
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}