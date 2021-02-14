import React, { Component } from 'react';
import Property from './PropertyCard';

export class Dashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contract: this.props.contract,
            account: this.props.account,
            allProperties: []
        }
    }

    getAllProperties = async () => {
        const { account, contract } = this.state;

        const response = await contract.methods.getProperies(0).call();
        const data = response[0].filter(item => item.owner !== "0x0000000000000000000000000000000000000000");

        this.setState({ allProperties: data });
    }

    componentDidMount() {
        this.getAllProperties();
    }

    render() {
        const { allProperties } = this.state;
        return (
            <div className="Dashboard">
                <div className="jumbotron jumbotron-fluid bg-transparent m-0">
                    <div className="container container-fluid p-5">
                        <header className="section-heading">
                            <h1 className="section-title text-center">Catalog</h1>
                        </header>
                        <div className="container container-fluid p-5">
                            <div className="list-group mx-auto">
                                {
                                    // console.log(this.state.allProperties)
                                    allProperties.length > 0 ?
                                        allProperties.map((item, key) => {
                                            return <Property key={key} propertyDetail={item} account={this.state.account} contract={this.state.contract} />
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

export default Dashboard
