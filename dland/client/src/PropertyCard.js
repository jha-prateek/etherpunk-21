import React, { Component } from 'react';


export default class PropertyCard extends Component {
    constructor(props) {
        super(props)

        const description = this.props.propertyDetail['propertyDescription'].split(';');
        const area = this.props.propertyDetail['area'];
        const availableFrom = this.props.propertyDetail['availableFrom'];
        const flatType = this.props.propertyDetail['flatType'];
        const furnishing = this.props.propertyDetail['furnishing'];
        const rent = this.props.propertyDetail['rent'];
        const securityDeposit = this.props.propertyDetail['securityDeposit'];
        const imageURL = this.props.propertyDetail['imagesHash'].split(',')[1];

        this.state = {
            area: area,
            availableFrom: this.getDateFromEpoch(availableFrom),
            flatType: this.getFlatType(flatType),
            furnishing: this.getFurnishing(furnishing),
            rent: rent,
            securityDeposit: securityDeposit,
            address: description[0],
            contact: description[1],
            imageURL: imageURL
        }
    }

    getDateFromEpoch = (epoch) => {
        const newDate = new Date(0);
        newDate.setUTCMilliseconds(epoch);
        return newDate.toDateString();
    }

    getFlatType = (flatType) => {
        if (flatType === "0") {
            return "1RK";
        }
        else if (flatType === "1") {
            return "1BHK";
        }
        else if (flatType === "2") {
            return "2BHK";
        }
        else {
            return "3BHK";
        }
    }

    getFurnishing = (furnishing) => {
        if (furnishing === "0") {
            return "Un-furnished";
        }
        else if (furnishing === "1") {
            return "Semi-furnished";
        }
        else {
            return "Full-furnished";
        }
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className="Property w-100 p-2">
                <div className="card card-product-list bg-light mb-3">
                    <div className="row no-gutters">
                        <div className="col-md-3 p-3 align-middle">
                            <img src={`https://ipfs.io/ipfs/${this.state.imageURL}`} className="img-thumbnail" alt="..." />
                        </div>
                        <div className="col-md-6 p-2">
                            <div className="info-main">
                                <div className="h3 title property-title"> {this.state.flatType} - {this.state.furnishing} </div>
                                <dl className="row property-description">
                                    <dt className="col-sm-3">Address</dt>
                                    <dd className="col-sm-9">{this.state.address}</dd>

                                    <dt className="col-sm-3">Area</dt>
                                    <dd className="col-sm-9">{this.state.area} sqft.</dd>

                                    <dt className="col-sm-3">Schedule Visit</dt>
                                    <dd className="col-sm-9"><a href={`tel:${this.state.contact}`} className="text-decoration-none link-info">{this.state.contact}</a></dd>
                                </dl>
                            </div>
                        </div>
                        <div className="col-sm-3 p-2">
                            <div className="info-aside">
                                <div className="price-wrap">
                                    <span className="rent h5 text-end">Rent: ₹ {this.state.rent} </span>
                                    <br />
                                    <span className="rent h5">Security: ₹ {this.state.securityDeposit} </span>
                                </div>
                                <br />
                                <p>
                                    <a href="#" className="btn btn-primary btn-block"> Details </a>
                                </p>
                                <p>
                                    Available from: <span className="rent h6"> {this.state.availableFrom} </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
