import React, { Component } from 'react';
import Booking from './BookingCard';

export default class MyBookings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contract: this.props.contract,
            account: this.props.account,
            myBookings: []
        }
    }

    getMyBookings = async () => {
        const { account, contract } = this.state;
        try {
            const response = await contract.methods.getMyBookings(0, account).call();
            const mergedResult = [response[0], response[1]].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
            const filteredMergedResult = mergedResult.filter(item => item.owner !== "0x0000000000000000000000000000000000000000");
            // console.log(properties, bookings);
            // console.log(mergedResult);
            this.setState({ myBookings: filteredMergedResult });
        } catch (error) {
            console.error(error);
        }
    };

    componentDidMount() {
        this.getMyBookings();
    }

    render() {
        const { myBookings } = this.state;
        return (
            <div className="my-bookings">
                <div className="jumbotron jumbotron-fluid bg-transparent m-0">
                    <div className="container container-fluid p-5">
                        <header className="section-heading">
                            <h1 className="section-title text-center">My Bookings</h1>
                        </header>
                        <div className="container container-fluid p-5">
                            {
                                myBookings.length > 0 ?
                                    myBookings.map((item, key) => {
                                        return <Booking key={key} propertyDetail={item} contract={this.state.contract} account={this.state.account} web3={this.props.web3} />
                                    })
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
