import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getFurnishing, getDateFromEpoch, getFlatType } from './Utils';
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

export default class DashboardCard extends Component {
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
            availableFrom: getDateFromEpoch(availableFrom),
            flatType: getFlatType(flatType),
            furnishing: getFurnishing(furnishing),
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
            transactionMessage: "",
            loadingMessage: "Booking..."
        }

        // console.log(propertyId, this.props.contract, this.props.account);
    }

    initiateSuperfluid = async () => {
        const { account, rent } = this.state;
        const { owner } = this.props.propertyDetail;

        const fDAIxTokenAddress_Rinkeby = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';
        try {
            const DAIPerSecond = await this.convertDollarToDAI(rent);

            const sf = new SuperfluidSDK.Framework({
                web3: this.props.web3
            });
            await sf.initialize();

            await sf.cfa.createFlow({
                superToken: fDAIxTokenAddress_Rinkeby,
                sender: account,
                receiver: owner,
                flowRate: Math.round(DAIPerSecond)
            });

            console.log(sf);

            this.setState({ transactionMessage: `${this.state.transactionMessage} \n Your superfluid flow has started. Check https://superfluid.finance/` });

            const flowDeductions = (await sf.cfa.getNetFlow({ superToken: fDAIxTokenAddress_Rinkeby, account: account })).toString();
            console.log(flowDeductions);

        } catch (error) {
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }

    rentProperty = async () => {
        const { account, contract, propertyId, checkInDate, checkOutDate, availableFrom, securityDeposit } = this.state;
        const { web3 } = this.props;

        // setInterval(function () {
        //     if (web3.eth.accounts[0] !== account) {
        //         window.location.reload(false);
        //     }
        // }, 100);

        if (checkInDate === "" || checkOutDate === "" || checkInDate > checkOutDate) {
            alert("Check-out date must be after Check-in date");
            return;
        }

        const checkInDateEpoch = new Date(checkInDate).getTime();
        const checkOutDateEpoch = new Date(checkOutDate).getTime();

        if (checkInDate < availableFrom - 1) {
            alert("Check-in date must be after Available date");
            return;
        }

        this.setState({ bookProperty: false, showLoadingBackdrop: true });

        try {
            // contract.methods.rentProperty.estimateGas({ from: account })
            //     .then(function (gasAmount) {
            //         console.log(`Estimation: ${gasAmount}`);
            //     })
            //     .catch(function (error) {
            //         console.error(error);
            //     });

            // Chainlink call for converting Dollat to Matic using priceFeed
            const responseMATIC = await contract.methods.getLatestPriceMATIC().call();
            const dollarToMatic = responseMATIC;
            const totalSecurityMatic = ((securityDeposit * 10 ** 26) / dollarToMatic);

            console.log("Matic " + totalSecurityMatic);

            // Sending security amount to owner
            const response = await contract.methods.rentProperty(
                propertyId, checkInDateEpoch, checkOutDateEpoch
            )
                .send({
                    from: account,
                    gasPrice: web3.utils.toWei("3", 'gwei'),
                    gas: 210000,
                    value: web3.utils.toWei(totalSecurityMatic.toString(), 'wei')
                });

            // console.log(response);
            // console.log(this.state);
            this.setState({ transactionMessage: `Success! \n  Deposit-TxHash:${response.transactionHash} \n`, loadingMessage: 'Innitiating Superfluid Rent flow.' });
            await this.initiateSuperfluid();

        } catch (error) {
            this.setState({ transactionMessage: `Failed!` });
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }

    convertDollarToDAI = async (dollarAmt) => {
        const { contract } = this.state;
        const responseDAI = await contract.methods.getLatestPriceDAI().call();
        const DAI = (dollarAmt * 10 ** 8) / responseDAI;
        return (DAI * 10 ** 18) / (3600 * 24 * 30);
    }

    componentDidMount() {
        // this.initiateSuperfluid();
    }

    render() {
        return (
            <div className="Property w-100 p-2">
                <div className="card card-product-list bg-light mb-3">
                    <div className="row no-gutters">
                        <div className="col-md-3 p-3 align-middle">
                            {this.state.imageURL !== "" ?
                                <img src={`https://ipfs.io/ipfs/${this.state.imageURL}`} className="img-thumbnail rounded mx-auto d-block" alt="..." />
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
                                    <span className="rent h5 text-end">Rent: $ {this.state.rent} </span>
                                    <br />
                                    <span className="rent h5">Security: $ {this.state.securityDeposit} </span>
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
                        <Modal.Title>{this.state.loadingMessage}</Modal.Title>
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
