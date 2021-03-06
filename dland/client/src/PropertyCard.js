import React, { Component } from 'react';
import { getFurnishing, getDateFromEpoch, getFlatType } from './Utils';
import Modal from 'react-bootstrap/Modal';
import config from './config.json';
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

export default class PropertyCard extends Component {
    constructor(props) {
        super(props)

        const property = this.props.propertyDetail;
        // console.log(property);
        const imageURLs = property.imagesHash !== "" ? property.imagesHash.split(",") : [];
        const description = property['propertyDescription'].split(';');
        this.state = {
            imageURLs: imageURLs,
            contact: description[1],
            address: description[0],
            startDate: property.checkInDate !== "0" ? getDateFromEpoch(property.checkInDate) : "",
            endDate: property.checkoutDate !== "0" ? getDateFromEpoch(property.checkoutDate) : "",
            property: property,
            contract: this.props.contract,
            account: this.props.account,
            showLoadingBackdrop: false,
            showSuccessBackdrop: false,
            transactionMessage: "",
            showCancelButton: !property.isBooked,
            showActivateButton: property.isActive,
            showDeactivateButton: !property.isActive,
            tenant: property.tenant !== "0x0000000000000000000000000000000000000000" ? property.tenant : ""
        }
    }
    cancelFLow = async () => {
        const { property, account, contact } = this.state;
        const { web3 } = this.props;

        // this.setState({ showLoadingBackdrop: true });

        const fDAIxTokenAddress_Rinkeby = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';
        try {

            const sf = new SuperfluidSDK.Framework({
                web3: web3
            });
            await sf.initialize();

            await sf.cfa.deleteFlow({
                superToken: fDAIxTokenAddress_Rinkeby,
                sender: property.tenant,
                receiver: property.owner,
                by: property.owner
            });

            this.setState({
                transactionMessage: `${this.state.transactionMessage} \n You are not paying rent anymore. Check with SuperFluid Dashboard.`
            });
            // console.log(sf);

        } catch (error) {
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }
    returnDeposit = async () => {
        const { account, contract, property } = this.state;
        const { web3 } = this.props;

        this.setState({ showLoadingBackdrop: true });
        // console.log(property);
        try {
            const responseMATIC = await contract.methods.getLatestPriceMATIC().call();
            const dollarToMatic = responseMATIC;
            const totalSecurityMaticDec = ((property.securityDeposit * 10 ** 26) / dollarToMatic);
            const totalSecurityMatic = totalSecurityMaticDec.toFixed(0);

            const response = await contract.methods.cancelBooking(
                property.propId
            )
                .send({
                    from: property.owner,
                    gasPrice: web3.utils.toWei("3", 'gwei'),
                    gas: 210000,
                    value: web3.utils.toWei(totalSecurityMatic.toString(), 'wei')
                });
            this.setState({ transactionMessage: `Success! \n  Deposit-TxHash:${response.transactionHash} \n` });
            //console.log(response);
            this.cancelFLow();
        } catch (error) {
            this.setState({
                transactionMessage: `Failed!`,
                showLoadingBackdrop: false,
                showSuccessBackdrop: true
            });
            console.error(error);
        }
        // this.setState({
        //     showLoadingBackdrop: false,
        //     showSuccessBackdrop: true
        // });
    }

    activateProperty = async () => {
        const { contract, property } = this.state;

        this.setState({ showLoadingBackdrop: true });
        try {
            const response = await contract.methods.markPropertyAsActive(
                property.propId
            )
                .send({
                    from: property.owner
                });
            this.setState({ transactionMessage: `Success! \n  Deposit-TxHash:${response.transactionHash} \n` });
        } catch (error) {
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }

    deActivateProperty = async () => {
        const { contract, property } = this.state;

        this.setState({ showLoadingBackdrop: true });
        try {
            const response = await contract.methods.markPropertyAsInactive(
                property.propId
            )
                .send({
                    from: property.owner
                });
            this.setState({ transactionMessage: `Success! \n  Deposit-TxHash:${response.transactionHash} \n` });
        } catch (error) {
            console.error(error);
        }
        this.setState({
            showLoadingBackdrop: false,
            showSuccessBackdrop: true
        });
    }

    refreshPage = () => {
        window.location.reload();
    }

    checkData = async () => {
        const { property } = this.state;
        const fDAIxTokenAddress_Rinkeby = '0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90';
        const { web3 } = this.props;
        const sf = new SuperfluidSDK.Framework({
            web3: web3,
            tokens: ["fDAI"]
        });
        await sf.initialize();
        // console.log(sf.tokens);
        let daix = sf.tokens.fDAIx;
        console.log("***********************");
        // console.log(await sf.cfa.listFlows({ superToken: fDAIxTokenAddress_Rinkeby, account: '0x8f231D5F3622E6c7b9c4aF00156C15AbCC3F1061' }));
        console.log((await sf.tokens.fDAIx.balanceOf.call('0x8f231D5F3622E6c7b9c4aF00156C15AbCC3F1061')).toString() / 1e18);
        console.log("***********************");
        web3.eth.getPastLogs(
            {
                address: "0x8f231D5F3622E6c7b9c4aF00156C15AbCC3F1061",
                fromBlock: "0x1",
                toBlock: 'latest'
            })
            .then(console.log)
            .catch(e => console.log(e));
    }

    componentDidMount() {
        // this.checkData();
    }

    render() {
        return (
            <div className="booking col-sm-6" >
                <div className="card">
                    {this.state.imageURLs.length > 0 ? <img className="card-img-top" src={`https://ipfs.io/ipfs/${this.state.imageURLs[0]}`} alt="Prop image" />
                        : <img className="card-img-top" src="https://ipfs.io/ipfs/Qmdg4hnwMimppNT3XhyABLf4UrCWgfiw9YvMC6TH1Jmr2m" alt="Prop image" />}
                    <div className="card-body">
                        {/* <h5 className="card-title lead">PropertyId: {this.state.property.propId}</h5> */}
                        <h3 className="text-muted card-text">{this.state.address}</h3>
                        <div className="info-main">
                            <dl className="row property-description">
                                <dt className="col-sm-5">Booked</dt>
                                <dd className="col-sm-5">{this.state.property.isBooked ? "Yes" : "No"}</dd>
                                <div className="border-top" />

                                <dt className="col-sm-5">Tenant Address</dt>
                                <dd className="col-sm-5">{this.state.tenant}</dd>

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
                    <button hidden={this.state.showCancelButton} onClick={this.returnDeposit} className="btn btn-danger">Cancel Booking</button>
                    {/* <br /> */}
                    <button hidden={(this.state.showActivateButton || !this.state.showCancelButton)} onClick={this.activateProperty} className="btn btn-primary">Activate</button>
                    <button hidden={(this.state.showDeactivateButton || !this.state.showCancelButton)} onClick={this.deActivateProperty} className="btn btn-danger">Deactivate</button>
                    {/* <div dangerouslySetInnerHTML={{ __html: "<iframe src='https://app.superfluid.finance/streams/goerli/0xfc598fba68f46e8b5d7125a841f2afb9dc7863f7419fe57ca3801a955ccd0626' scrolling='no' frameborder='0' />" }} /> */}
                    {/* <div dangerouslySetInnerHTML={{ __html: "<iframe src='https://app.superfluid.finance/streams/rinkeby/0x263d71a23f9127f3f564f1b67c58ecfc390a14edc62151a34b0e2b60b66e98fe' />"}} /> */}
                </div>
                <Modal
                    show={this.state.showLoadingBackdrop}
                    backdrop="static"
                    keyboard={false}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Updating Property Details</Modal.Title>
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
                    onHide={this.refreshPage}
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
