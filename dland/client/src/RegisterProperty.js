import React, { Component } from 'react';
import validator from 'validator';
import IPFS from './getIPFS';
import Modal from 'react-bootstrap/Modal';

export default class RegisterProperty extends Component {
    constructor(props) {
        super(props)

        this.state = {
            flatType: "",
            furnishing: "",
            area: "",
            address: "",
            availableFrom: "",
            rent: "",
            deposit: "",
            selectedFiles: [],
            selectedFilesIPFSPath: [],
            fileHashString: "",
            ownerContact: "",
            ipfsClient: this.props.ipfsClient,
            contract: this.props.contract,
            account: this.props.account,
            showLoadingBackdrop: false,
            loadingBackdropTitle: "Saving File...",
            showSuccessBackdrop: false,
            transactionMessage: ""
        }
    }

    componentDidMount() {

    }

    onFileSelection = (e) => {
        const allFiles = e.target.files;
        this.setState({ selectedFiles: [] });

        for (const property in allFiles) {
            if (typeof (allFiles[property]) !== 'object') continue;

            let file = allFiles[property];
            try {
                const reader = new FileReader();

                reader.readAsArrayBuffer(file);
                reader.onloadend = () => {
                    const newImage = {
                        file: file,
                        buffer: Buffer(reader.result)
                    }
                    this.setState({ selectedFiles: [...this.state.selectedFiles, newImage] });
                }
            } catch (error) {
                console.error('File Error');
            }
        }
    }

    getFlatType = (flatType) => {
        if (flatType === "1RK") {
            return 0;
        }
        else if (flatType === "1BHK") {
            return 1;
        }
        else if (flatType === "2BHK") {
            return 2;
        }
        else if (flatType === "3BHK") {
            return 3;
        }
    }

    getFurnishing = (furnishing) => {
        if (furnishing === "None") {
            return 0;
        }
        else if (furnishing === "SemiFurnished") {
            return 1;
        }
        else if (furnishing === "FullyFurnished") {
            return 2;
        }
    }

    validatePhone = (e) => {
        if (!validator.isMobilePhone(e.target.value)) {
            e.target.setCustomValidity("Invalid Phone Number");
        } else {
            e.target.setCustomValidity("");
        }
        this.setState({ ownerContact: e.target.value });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ showLoadingBackdrop: true });
        this.uploadAllFiles();
    }

    uploadAllFiles = async () => {
        const { selectedFiles } = this.state;
        const allHashPromises = await selectedFiles.map(async (file) => {
            const val = await this.uploadFileToIPFS(file.buffer);
            return val;
        });

        const allHashes = await Promise.all(allHashPromises)
        this.setState({
            loadingBackdropTitle: "Processing your transaction",
            selectedFilesIPFSPath: [...this.state.selectedFilesIPFSPath, allHashes]
        }, this.saveContract);
    }

    uploadFileToIPFS = async (file) => {
        try {
            let results = await IPFS.add(file.buffer);
            return results['path'];
        } catch (error) {
            console.error(error);
        }
    }

    saveContract = async () => {
        const { account, contract, address, availableFrom, area, flatType, furnishing, deposit, rent, ownerContact, selectedFilesIPFSPath } = this.state;
        const date = new Date(availableFrom).getTime();

        try {
            const response = await contract.methods.rentOutproperty(
                `${address};${ownerContact}`,
                area, this.getFurnishing(furnishing),
                date, this.getFlatType(flatType),
                rent, deposit,
                selectedFilesIPFSPath.join(",")
            )
                .send({ from: account });

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

        const { selectedFiles } = this.state;

        return (
            <div className="jumbotron jumbotron-fluid bg-transparent m-0">
                <div className="container container-fluid p-5">
                    <header className="section-heading">
                        <h1 className="section-title text-center">Rent out...</h1>
                    </header>
                    <div className="row">
                        <div className="col-lg-7">
                            <form onSubmit={this.handleSubmit}>
                                <h3>
                                    <small className="text-muted">Property Details</small>
                                </h3>
                                <hr />
                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputFirstName">Flat Type</label>
                                        <select id="inputBG" className="form-control"
                                            value={this.state.flatType} onChange={(e) => { this.setState({ flatType: e.target.value }) }}
                                            required
                                        >
                                            <option value="" disabled></option>
                                            <option value="1RK">1 RK</option>
                                            <option value="1BHK">1 BHK</option>
                                            <option value="2BHK">2 BHK</option>
                                            <option value="3BHK">3 BHK</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputLastName">Furnishing</label>
                                        <select id="inputBG" className="form-control"
                                            value={this.state.furnishing} onChange={(e) => { this.setState({ furnishing: e.target.value }) }}
                                            required
                                        >
                                            <option value="" disabled></option>
                                            <option value="FullyFurnished">Fully Furnished</option>
                                            <option value="SemiFurnished">Semi Furnished</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputUID">Address</label>
                                        <textarea type="text" className="form-control" rows="3" style={{ overflow: 'auto', resize: 'none' }}
                                            value={this.state.address} onChange={(e) => { this.setState({ address: e.target.value }) }}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputGender">Area</label>
                                        <input type="number" min="1" className="form-control"
                                            value={this.state.area} onChange={(e) => { this.setState({ area: e.target.value }) }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputDOB">Available From</label>
                                        <input type="date" className="form-control"
                                            value={this.state.availableFrom} onChange={(e) => { this.setState({ availableFrom: e.target.value }) }}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputDOB">Contact</label>
                                        <input type="text" className="form-control"
                                            value={this.state.ownerContact}
                                            onChange={this.validatePhone}
                                            required
                                        />
                                    </div>
                                </div>

                                <h3>
                                    <small className="text-muted">Expenses</small>
                                </h3>
                                <hr />

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputState">Rent</label>
                                        <div className="input-group mb-2">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">₹</div>
                                            </div>
                                            <input type="number" min="0" className="form-control"
                                                value={this.state.rent} onChange={(e) => { this.setState({ rent: e.target.value }) }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputCity">Security Deposit</label>
                                        <div className="input-group mb-2">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">₹</div>
                                            </div>
                                            <input type="number" min="0" className="form-control"
                                                value={this.state.deposit} onChange={(e) => { this.setState({ deposit: e.target.value }) }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h3>
                                    <small className="text-muted">Property Images</small>
                                </h3>
                                <hr />

                                <div className="form-row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="inputReportFile">Upload</label>
                                        <input type="file" className="form-control-file" multiple="multiple" accept="image/x-png,image/gif,image/jpeg"
                                            onChange={this.onFileSelection}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="row">
                                            {
                                                selectedFiles.map((item, key) => {
                                                    return <img key={key} src={URL.createObjectURL(item.file)} alt="..." className="img-thumbnail img-thumbnail-custom rounded" />
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>


                                <div className="col-md-6 mb-3">
                                    <label htmlFor="emptyLabel"></label>
                                    <button type="submit" className="btn btn-primary btn-block">Register</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <Modal
                    show={this.state.showLoadingBackdrop}
                    backdrop="static"
                    keyboard={false}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.loadingBackdropTitle}</Modal.Title>
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
