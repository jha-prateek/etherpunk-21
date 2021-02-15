import React, { Component } from 'react';

export default class MyProperties extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contract: this.props.contract,
            account: this.props.account,
            myBookings: []
        }
    }

    getMyProperies = async () => {
        const { account, contract } = this.state;

        const response = await contract.methods.getMyProperties(0, this.state.account).call();
        // const data = response[0].filter(item => item.owner !== "0x0000000000000000000000000000000000000000");
        console.log(response);
        // this.setState({ myBookings: data });
    };

    componentDidMount() {
        this.getMyProperies();
    }

    render() {
        return (
            <div>

            </div>
        )
    }
}