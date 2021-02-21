import React, { Component } from 'react';
import Property from './DashboardCard';

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

        const response = await contract.methods.getProperties(0).call();
        const data = response[0].filter(item => item.owner !== "0x0000000000000000000000000000000000000000");
        console.log(response);
        this.setState({ allProperties: data });

        //const response1 = await contract.methods.convertUSDToEth(1).call();
        //console.log(response1);
        //const responseDeposit = await contract.methods.getDepositedETH(0).call();
        //console.log(" Dep"+ responseDeposit);
        // const dollar = 100;
        // const responseDAI = await contract.methods.getLatestPriceDAI().call();
        // const dollarToDAI = responseDAI / 10 ** 8;
        // const DAI = dollar / dollarToDAI;
        // const DAIPerSecond = DAI * 10 ** 18 / (3600 * 24 * 30);

        // console.log(DAI);
        // console.log(DAIPerSecond);

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
                                            return <Property key={key} propertyDetail={item} account={this.state.account} contract={this.state.contract} web3={this.props.web3} />
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
