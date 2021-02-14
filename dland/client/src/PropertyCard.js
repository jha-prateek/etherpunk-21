import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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
        const imageURL = this.props.propertyDetail['imagesHash'].split(',')[0];
        const propertyId = this.props.propertyDetail['propId'];

        this.state = {
            area: area,
            availableFrom: this.getDateFromEpoch(availableFrom),
            flatType: this.getFlatType(flatType),
            furnishing: this.getFurnishing(furnishing),
            rent: rent,
            securityDeposit: securityDeposit,
            address: description[0],
            contact: description[1],
            imageURL: imageURL,
            propertyId: propertyId,
            contract: this.props.contract,
            account: this.props.account,
            bookProperty: false,
            showLoadingBackdrop: false,
            showSuccessBackdrop: false,
            checkInDate: "",
            checkOutDate: "",
            transactionMessage: ""
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

    rentProperty = async () => {
        const { account, contract, propertyId, checkInDate, checkOutDate } = this.state;
        if (checkInDate === "" || checkOutDate === "" || checkInDate > checkOutDate) {
            alert("Check-out date must be after Check-in date");
            return;
        }

        this.setState({ bookProperty: false, showLoadingBackdrop: true });

        const checkInDateEpoch = new Date(checkInDate).getTime();
        const checkOutDateEpoch = new Date(checkOutDate).getTime();

        try {
            const response = await contract.methods.rentProperty(
                propertyId, checkInDateEpoch, checkOutDateEpoch
            )
                .send({ from: account, value: 0 });

            console.log(response);
            console.log(this.state);
            this.setState({ transactionMessage: `Success! \n  TxHash:${response.transactionHash}` });
        } catch (error) {
            this.setState({ transactionMessage: `Failed!` });
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }

    render() {
        return (
            <div className="Property w-100 p-2">
                <div className="card card-product-list bg-light mb-3">
                    <div className="row no-gutters">
                        <div className="col-md-3 p-3 align-middle">
                            {this.state.imageURL !== "" ?
                                <img src={`https://ipfs.io/ipfs/${this.state.imageURL}`} className="img-thumbnail" alt="..." />
                                : <span className="rent h6">No images</span>
                            }
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
                                    <button className="btn btn-primary btn-block"
                                        onClick={() => this.setState({ bookProperty: true })}
                                    > Details </button>
                                </p>
                                <p>
                                    Available from: <span className="rent h6"> {this.state.availableFrom} </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    show={this.state.bookProperty}
                    backdrop="static"
                    keyboard={false}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="form-row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="inputDOB">Check-in Date</label>
                                <input type="date" className="form-control"
                                    value={this.state.checkInDate} onChange={(e) => { this.setState({ checkInDate: e.target.value }) }}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="inputDOB">Check-out Date</label>
                                <input type="date" className="form-control"
                                    value={this.state.checkOutDate} onChange={(e) => { this.setState({ checkOutDate: e.target.value }) }}
                                    required
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ bookProperty: false })}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.rentProperty}>
                            Book
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showLoadingBackdrop}
                    backdrop="static"
                    keyboard={false}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Booking...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex justify-content-center">
                            <div className="spinner-grow" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={this.state.showSuccessBackdrop}
                    onHide={() => this.setState({ showSuccessBackdrop: false })}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Message </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.transactionMessage}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}
