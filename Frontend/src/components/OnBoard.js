import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import CloseIcon from '@material-ui/icons/Close';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import Autocomplete from '@material-ui/lab/Autocomplete'
import Loading from './loading';
import _ from 'lodash';
import '../App.css';

class OnBoardApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            applicationKey: "",
            application: "",
            microservices: [],
            currentMicroService: "",
            dependencies: [],
            current: 0,
            username: "",
            password: "",
            host: "",
            port: "",
            protocol: "",
            connectionCheck: (<span><b style={{ color: "teal", fontSize: "12px" }}>Not Verified</b></span>),
            connectionVerified: false,
            loading: false,
            loadingText: "",
            success: false
        }
    }
    componentDidMount() {
    }

    setCurrentIndex = (index) => {
        this.setState({ current: index })
    }

    handleDependecyChange = (e, values) => {
        let dependencies = _.cloneDeep(this.state.dependencies);
        let value = this.state.microservices[this.state.current]
        dependencies[this.state.current][value] = values
        this.setState({
            dependencies: dependencies
        })
        console.log(dependencies)
    }

    buildDependencies(microservices) {
        let dependents = []
        microservices.map(microservice => {
            dependents.push({ [microservice]: [] })
        })
        this.setState({
            dependencies: dependents
        })
        console.log(dependents)
    }

    saveHandler = (event) => {
        let microservices = this.state.microservices
        microservices.push(this.state.currentMicroService.toUpperCase())
        this.setState({
            microservices: microservices,
            currentMicroService: ""
        })
        this.buildDependencies(microservices)
    }

    microServicesDeleteHandler = (index) => {
        let microservices = this.state.microservices;
        microservices.splice(index, 1)
        this.setState({
            microservices: microservices
        })
        this.buildDependencies(microservices)
    }

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    populateOptions = (index) => {
        let options = _.cloneDeep(this.state.microservices);
        options.splice(index, 1)
        return options
    }

    checkConnection = () => {
        let url = process.env.REACT_APP_BACKEND_URL + '/test/connection';
        axios.defaults.withCredentials = true;
        const data = {
            "username": this.state.username,
            "password": this.state.password,
            "scheme": this.state.protocol,
            "host": this.state.host,
            "port": this.state.port
        }
        axios.post(url, data)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        connectionCheck: (<span><b style={{ color: "green", fontSize: "12px" }}>Verified</b></span>),
                        connectionVerified: true
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    connectionCheck: (<span><b style={{ color: "red", fontSize: "12px" }}>Invalid Credentials. Please Check!</b></span>),
                    connectionVerified: false
                })
            });
    }

    validateDetails = () => {
        if (this.state.activeStep === 0) {
            return this.state.application === "" || this.state.applicationKey === ""
        }
        if (this.state.activeStep === 1) {
            return _.isEmpty(this.state.microservices)
        }
        if (this.state.activeStep === 3) {
            return !this.state.connectionVerified
        }
    }

    getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <div className="container" style={{ width: "80%", textAlign: "center", paddingTop: "0px" }}>
                        <h3>Application Details</h3>
                        <div className="row" style={{ paddingTop: "20px" }}>
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Application Name</label>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="application"
                                label="Application Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.application}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="row">
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Application Key </label>
                            <TextField
                                margin="dense"
                                name="applicationKey"
                                label="Application Key"
                                type="text"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.applicationKey}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div >
                        <div class="row" style={{ textAlign: "center" }}>
                            <h3>Micro Services</h3>
                        </div>
                        <div className="row" style={{ padding: "30px 200px 30px", textAlign: "center" }}>
                            {this.state.microservices.map((microservice, index) => {
                                return (
                                    <Chip
                                        label={<h5>{microservice}</h5>}
                                        onDelete={() => this.microServicesDeleteHandler(index)}
                                        icon={<BlurOnIcon style={{ fontSize: "24px" }} />}
                                        deleteIcon={<CloseIcon />}
                                        color="primary"
                                        style={{ height: "35px", "marginRight": "8px", marginBottom: "8px", padding: "0px", fontSize: "14px", boxShadow: "2px 2px 5px 0px #abc4eb" }}
                                    />
                                )
                            })}
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                            </div>
                            <div class="col-md-3" style={{ float: "center", marginRight: "0px", paddingRight: "7px" }}>
                                <input autoFocus autoComplete="off" required onChange={this.onChange} value={this.state.currentMicroService} type="text" class="form-control" name="currentMicroService" aria-describedby="name" placeholder="Add Micro Services"></input>
                            </div>
                            <div class="col-md-1" style={{ textAlign: "-webkit-center", marginLeft: "0px", paddingLeft: "0px" }}>
                                <button type="button" disabled={this.state.currentMicroService === ""} onClick={this.saveHandler} style={{ backgroundColor: "#0d7f02", width: "100px" }} class="btn btn-success" >Add</button>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div class="row">
                        <div class="row" style={{ textAlign: "center" }}>
                            <h3>Micro Services Relationships</h3>
                        </div>
                        <div className="row" style={{ textAlign: "center", marginTop: "20px" }}>
                            {this.state.microservices.map((microservice, index) => {
                                return (
                                    <div className="row" style={{ marginBottom: "10px" }}>
                                        <div class="col-md-2"></div>
                                        <div class="col-md-2" style={{ textAlign: "right", marginRight: "0px" }}>
                                            <label style={{ lineHeight: "55px" }}><h5>{microservice}</h5></label>
                                        </div>
                                        <div class="col-md-5" style={{ marginLeft: "0px" }}>
                                            <Autocomplete
                                                style={{}}
                                                multiple
                                                limitTags={2}
                                                size="large"
                                                id={microservice}
                                                name={microservice}
                                                closeIcon={<CloseIcon />}
                                                autoHighlight
                                                ChipProps={{ color: "primary" }}
                                                onChange={this.handleDependecyChange}
                                                options={this.populateOptions(index)}
                                                value={this.state.dependencies[index][microservice]}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => (
                                                    <TextField onClick={() => this.setCurrentIndex(index)} {...params} variant="outlined" placeholder="Select Dependant Micro Services" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div >
                )
            case 3:
                return (
                    <div className="container" style={{ width: "80%", textAlign: "center", paddingTop: "0px" }}>
                        <h3>Splunk Details</h3>
                        <div className="row" style={{ paddingTop: "20px" }}>
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Splunk Username</label>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="username"
                                label="Splunk Username"
                                type="password"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.username}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="row">
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Splunk Password</label>
                            <TextField
                                margin="dense"
                                name="password"
                                label="Splunk Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.password}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="row">
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Splunk Host</label>
                            <TextField
                                margin="dense"
                                name="host"
                                label="Splunk Host Eg: 192.168.0.1"
                                type="text"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.host}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="row">
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>Splunk Port</label>
                            <TextField
                                margin="dense"
                                name="port"
                                label="Splunk Port Eg: 8089"
                                type="text"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.port}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="row">
                            <label style={{ lineHeight: "45px", marginRight: "15px" }}>HTTP Protocol</label>
                            <TextField
                                margin="dense"
                                name="protocol"
                                label="HTTP Protocol Eg: HTTP or HTTPS"
                                type="text"
                                fullWidth
                                variant="outlined"
                                required
                                autoComplete="off"
                                value={this.state.protocol}
                                style={{ width: "400px", backgroundColor: "white" }}
                                onChange={this.onChange}
                            />
                        </div>
                        <div class="row" style={{ textAlign: "-webkit-center", marginTop: "20px", paddingLeft: "0px" }}>
                            <button type="button" disabled={this.state.connectionVerified} onClick={this.checkConnection} style={{ backgroundColor: "#0d7f02", width: "200px" }} class="btn btn-success" >Test Connection</button>
                            <span style={{ marginLeft: "20px" }}>{this.state.connectionCheck}</span>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div >
                        <div class="row" style={{ textAlign: "center" }}>
                            <h3>Review</h3>
                        </div>
                        <div class="row" style={{ padding: "20px 0px 0px" }}>
                            <div class="col-md-4">
                            </div>
                            <div class="col-md-2" style={{ float: "center", marginRight: "0px", paddingRight: "7px" }}>
                                <h4>Application Name</h4>
                            </div>
                            <div class="col-md-3" style={{ float: "center", marginRight: "0px", paddingRight: "7px" }}>
                                <h5>{this.state.application}</h5>
                            </div>
                        </div>
                        <div class="row" style={{ padding: "20px 0px 0px" }}>
                            <div class="col-md-4">
                            </div>
                            <div class="col-md-2" style={{ float: "center", marginRight: "0px", paddingRight: "7px" }}>
                                <h4>Microservices</h4>
                            </div>
                            <div class="col-md-5" style={{ float: "center", marginRight: "0px", paddingRight: "7px" }}>
                                {this.state.microservices.map((microservice, index) => {
                                    return (
                                        <Chip
                                            label={<h5>{microservice}</h5>}
                                            style={{ height: "35px", "marginRight": "8px", borderRadius: "6px", marginBottom: "8px", padding: "0px", fontSize: "9px", backgroundColor: "#bfd1d6" }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            default:
                return 'Unknown';
        }
    }

    handleNext = () => {
        if (this.state.activeStep === 4) {
            this.setState({
                loading: true,
                loadingText: "On-Boarding Your Application..."
            })
            const data = {
                "name": this.state.application,
                "key": this.state.applicationKey.toUpperCase(),
                "splunk": {
                    "username": this.state.username,
                    "password": this.state.password,
                    "scheme": this.state.protocol,
                    "host": this.state.host,
                    "port": this.state.port
                },
                "companyId": localStorage.getItem("id"),
                "dependencies": this.state.dependencies
            }
            let url = process.env.REACT_APP_BACKEND_URL + '/onboard';
            axios.post(url, data)
                .then(response => {
                    if (response.status === 200) {
                        this.setState({
                            loading: false,
                            loadingText: "",
                            success: true
                        })
                    }
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                        loadingText: "",
                        success: false
                    })
                });
        } else {
            this.setState({
                activeStep: this.state.activeStep + 1
            })
        }
    };

    handleBack = () => {
        this.setState({
            activeStep: this.state.activeStep - 1
        })
    };

    render() {
        const steps = ['Application Details', 'Micro Services', 'Micro Services Relationships', 'Splunk Details', 'Review'];
        let redirectVar = null
        if (this.state.success == true) redirectVar = <Redirect to={"/onboard/success"} />
        return (
            <div className="container" style={{ width: "90%", marginTop: "20px" }}>
                {redirectVar}
                <Loading loading={this.state.loading} loadingText={this.state.loadingText} />
                <Stepper activeStep={this.state.activeStep} alternativeLabel style={{ display: "flex", height: "20", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
                    {steps.map((label) => (
                        <Step key={label} style={{ fontSize: "30px !important" }}>
                            <StepLabel><b >{label}</b></StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <div>
                    {this.state.activeStep === steps.length ? (
                        <div>
                            <Typography >All steps completed</Typography>
                        </div>
                    ) : (
                            <div>
                                <div style={{ border: "0px solid", margin: "10px 0px 0px", padding: "0px 0px 30px", backgroundColor: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
                                    <Typography >{this.getStepContent(this.state.activeStep)}</Typography>
                                </div>
                                <div style={{ textAlign: "right", margin: "30px 0px 30px" }}>
                                    <Button
                                        disabled={this.state.activeStep === 0}
                                        onClick={this.handleBack}
                                    >
                                        Back
                                    </Button>
                                    <Button disabled={this.validateDetails()} variant="contained" color="primary" onClick={this.handleNext}>
                                        {this.state.activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        )
    }
}

export default OnBoardApp;