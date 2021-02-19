import React, { Component } from 'react';
import { getFurnishing, getDateFromEpoch, getFlatType } from './Utils';
import { SuperfluidSDK } from "@superfluid-finance/js-sdk";

export default class BookingCard extends Component {
    constructor(props) {
        super(props)

        const property = this.props.propertyDetail;

        const imageURLs = property.imagesHash !== "" ? property.imagesHash.split(",") : [];
        const description = property['propertyDescription'].split(';');
        // console.log(this.props.propertyDetail);
        this.state = {
            imageURLs: imageURLs,
            contact: description[1],
            address: description[0],
            startDate: getDateFromEpoch(property.checkInDate),
            endDate: getDateFromEpoch(property.checkoutDate),
            property: property
        }
    }

    cancelFLow = async () => {
        const { account, property } = this.state;

        const fDAIxTokenAddress_Rinkeby = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';
        try {

            const sf = new SuperfluidSDK.Framework({
                web3: this.props.web3
            });
            await sf.initialize();

            await sf.cfa.deleteFlow({
                superToken: fDAIxTokenAddress_Rinkeby,
                sender: account,
                receiver: property.owner,
                by: account
            });

        } catch (error) {

        }
    }

    render() {
        console.log(this.state.imageURLs);
        return (
            <div className="booking w-100 p-2" style={{ textAlign: '-webkit-center' }}>
                <div className="card" style={{ width: '60%' }}>
                    {this.state.imageURLs.length > 0 ? <img className="card-img-top" src={`https://ipfs.io/ipfs/${this.state.imageURLs[0]}`} alt="Prop image" />
                        : <img className="card-img-top" src="https://ipfs.io/ipfs/Qmdg4hnwMimppNT3XhyABLf4UrCWgfiw9YvMC6TH1Jmr2m" alt="Prop image" />}
                    <div className="card-body">
                        <h5 className="card-title lead">PropertyId: {this.state.property.propId}</h5>
                        <h3 className="text-muted card-text">{this.state.address}</h3>
                        <div className="info-main">
                            <dl className="row property-description">
                                <dt className="col-sm-4">Start Date</dt>
                                <dd className="col-sm-8">{this.state.startDate}</dd>

                                <dt className="col-sm-4">End Date</dt>
                                <dd className="col-sm-8">{this.state.endDate}</dd>

                                <dt className="col-sm-4">Owner contact</dt>
                                <dd className="col-sm-8">{this.state.contact} </dd>

                                <dt className="col-sm-4">Security Deposit</dt>
                                <dd className="col-sm-8">{this.state.property.securityDeposit} </dd>

                                <dt className="col-sm-4">Rent</dt>
                                <dd className="col-sm-8">{this.state.property.rent} </dd>
                            </dl>
                        </div>
                    </div>
                    <button onClick={this.cancelFLow} className="btn btn-primary btn-block">Cancel Flow</button>
                </div>
            </div>
        )
    }
}
