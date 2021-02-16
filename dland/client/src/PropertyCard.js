import React, { Component } from 'react';
import { getFurnishing, getDateFromEpoch, getFlatType } from './Utils';

export default class PropertyCard extends Component {
    constructor(props) {
        super(props)

        const property = this.props.propertyDetail;
        const imageURLs = property.imagesHash !== "" ? property.imagesHash.split(",") : [];
        const description = property['propertyDescription'].split(';');
        // console.log(property.isBooked);
        this.state = {
            imageURLs: imageURLs,
            contact: description[1],
            address: description[0],
            startDate: getDateFromEpoch(property.checkInDate),
            endDate: getDateFromEpoch(property.checkoutDate),
            property: property
        }
    }

    render() {
        return (
            <div className="booking col-sm-6" >
                <div className="card">
                    {this.state.imageURLs.length > 0 ? <img className="card-img-top" src={`https://ipfs.io/ipfs/${this.state.imageURLs[0]}`} alt="Prop image" />
                        : <img className="card-img-top" src="https://ipfs.io/ipfs/Qmdg4hnwMimppNT3XhyABLf4UrCWgfiw9YvMC6TH1Jmr2m" alt="Prop image" />}
                    <div className="card-body">
                        <h5 className="card-title lead">PropertyId: {this.state.property.propId}</h5>
                        <h3 className="text-muted card-text">{this.state.address}</h3>
                        <div className="info-main">
                            <dl className="row property-description">
                                <dt className="col-sm-5">Booked</dt>
                                <dd className="col-sm-5">{this.state.property.isBooked ? "Yes" : "No"}</dd>

                                <dt className="col-sm-5">Tenant Address</dt>
                                <dd className="col-sm-5">{this.state.property.tenant}</dd>

                                <dt className="col-sm-5">Start Date</dt>
                                <dd className="col-sm-5">{this.state.startDate}</dd>

                                <dt className="col-sm-5">End Date</dt>
                                <dd className="col-sm-5">{this.state.endDate}</dd>

                                <dt className="col-sm-5">Owner contact</dt>
                                <dd className="col-sm-5">{this.state.contact} </dd>

                                <dt className="col-sm-5">Security Deposit</dt>
                                <dd className="col-sm-5">{this.state.property.securityDeposit} </dd>

                                <dt className="col-sm-5">Rent</dt>
                                <dd className="col-sm-5">{this.state.property.rent} </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
