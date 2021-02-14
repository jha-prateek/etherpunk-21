import React, { Component } from 'react';

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

        const response = await contract.methods.getMyBookings(0).call();
        // const data = response[0].filter(item => item.owner !== "0x0000000000000000000000000000000000000000");
        console.log(response);
        // this.setState({ myBookings: data });
    };

    componentDidMount() {
        this.getMyBookings();
    }

    render() {
        return (
            <div className="MyBookings">
                <div className="jumbotron jumbotron-fluid bg-transparent m-0">
                    <div className="container container-fluid p-5">
                        <header className="section-heading">
                            <h1 className="section-title text-center">My Bookings</h1>
                        </header>
                        <div className="container container-fluid p-5">
                            <div className="list-group mx-auto">
                                {
                                    console.log(this.state.allProperties)
                                    // allProperties.length > 0 ?
                                    //     allProperties.map((item, key) => {
                                    //         return <Property key={key} propertyDetail={item} />
                                    //     })
                                    //     : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
