import React, { Component } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cola from 'cytoscape-cola';
import Cytoscape from 'cytoscape';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ReactJson from 'react-json-view'
import Button from '@material-ui/core/Button';
import moment from 'moment';
import Slide from '@material-ui/core/Slide';
import _ from 'lodash';
import coseBilkent from 'cytoscape-cose-bilkent';
import Chip from '@material-ui/core/Chip';
import CloseIcon from '@material-ui/icons/Close';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PollIcon from '@material-ui/icons/Poll';
import TimelineIcon from '@material-ui/icons/Timeline';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import BatteryAlertIcon from '@material-ui/icons/BatteryAlert';
import BatteryChargingFullIcon from '@material-ui/icons/BatteryChargingFull';
import Rating from '@material-ui/lab/Rating';
import Card from '@material-ui/core/Card';
import Loading from './loading';
import Prediction from './prediction';
import microservice from '../components/images/microservice.png';
Cytoscape.use(cola);
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" in={true} timeout={3000} ref={ref} {...props} />;
});
export default class Application extends Component {

    state = {
        w: 0,
        h: 0,
        elements: [
            { data: { id: 'one', label: 'ORDERS', success: "false" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: 'two', label: 'SIGNIN', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: 'three', label: 'PAYMENT', success: "false" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: 'four', label: 'CATALOG', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: '5', label: 'SIGNUP', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: '8', label: 'ANALYTICS', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: '6', label: 'DETAILS', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { id: '7', label: 'SELLER', success: "true" }, position: { x: Math.floor(Math.random() * (window.innerWidth - 800)), y: Math.floor(Math.random() * (window.innerHeight - 200)) } },
            { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'two', target: 'one', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'one', target: 'three', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'two', target: 'three', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'one', target: 'four', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'four', target: '8', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'two', target: '6', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'four', target: '5', label: 'Edge from Node1 to Node2' } },
            { data: { source: 'four', target: '7', label: 'Edge from Node1 to Node2' } }
        ],
        application: [],
        loading: false,
        detailsPage: false,
        currentMicroserviceId: "",
        currentMicroservice: {},
        prediction: false,
        predictionText: ""
    }

    componentDidMount = () => {
        this.setState({
            w: window.innerWidth - 200,
            h: window.innerHeight - 200
        })
        this.fetchApplicationInfo()
    }

    handleClose = () => {
        this.setState({
            prediction: false,
            predictionText: ""
        })
    }

    handleOpen = (text) => {
        this.setState({
            prediction: true,
            predictionText: text
        })
    }

    fetchApplicationInfo() {
        this.setState({ loading: true })
        const { match: { params } } = this.props;
        let url = process.env.REACT_APP_BACKEND_URL + '/getmicroservicedata/' + params.id;
        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        application: response.data
                    }, () => this.setUpListeners())
                }
            })
            .catch((error) => {
                this.setState({
                    application: []
                })
            });;
    }

    openDetails = (id) => {
        this.setState({
            currentMicroserviceId: id,
            loading: true,
            loadingText: "Fetching Details!"
        })
        axios.get(process.env.REACT_APP_BACKEND_URL + '/getmicroservicehistory/' + id)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        detailsPage: true,
                        loading: false,
                        loadingText: "",
                        currentMicroservice: response.data
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    loadingText: "",
                    currentMicroservice: {},
                    currentMicroserviceId: ""
                })
            });
    }

    closeDetails = () => {
        this.setState({
            detailsPage: false,
            currentMicroservice: {},
            currentMicroserviceId: ""
        })
    }

    defaultListeners = () => {

        this.cy.nodes().style({ 'transition-property': 'spring', 'transition-duration': '5s' });
        this.cy.edges().style({ 'transition-property': 'spring', 'transition-duration': '5s' });
        this.cy.nodes().connectedEdges().style({ 'width': "1px", 'line-color': 'grey' });
        this.cy.nodes().style({ 'font-size': "12px", 'color': "#4f4f4e", 'shape': 'circle' });
        this.cy.nodes('[success="false"]').style({ 'background-color': '#dc5a32', 'shape': 'circle' });
        this.cy.nodes('[success="true"]').style({ 'background-color': '#438f54' });
        this.cy.nodes('[success="false"]').connectedEdges().style({ 'line-color': '#dc5a32', 'width': "1px" });
        //this.cy.nodes('[success="false"]').connectedEdges().style({'background-color': 'blue'});
        this.cy.nodes('[success="false"]').outgoers().style({ 'background-color': '#f0957a', 'shape': 'circle' });
        //this.cy.nodes('[success="false"]').parent().style({'background-color': 'black'});
        //this.cy.nodes('[success="true"]').connectedEdges().style({'line-color': 'green'});
        this.cy.edges().style({ 'curve-style': 'straight', 'target-arrow-shape': 'vee', 'arrow-scale': 0.5 });
    }
    setUpListeners = () => {
        this.cy.on('click', 'node', (event) => {
            console.log(event.target._private.data.label)
            //alert(event.target._private.data.label)
            this.openDetails(event.target._private.data._id)
            //this.cy.nodes(`[label="${event.target._private.data.label}"]`).connectedEdges().style({ 'line-color': "teal", 'width': "2px" });
        })
        this.cy.on('mouseover', 'node', (event) => {
            this.cy.nodes(`[label="${event.target._private.data.label}"]`).connectedEdges().style({ 'line-color': "teal", 'width': "2px" });
            this.cy.nodes(`[label="${event.target._private.data.label}"]`).outgoers().style({ 'background-color': 'teal' });
        })
        this.cy.on('mouseout', 'node', (event) => {
            this.defaultListeners()
        })
        this.defaultListeners()
    }

    render() {
        const { match: { params } } = this.props;
        let dialog = null;
        if (this.state.detailsPage == true) {
            dialog = (
                <Dialog TransitionComponent={Transition}
                    style={{ overflowX: "hidden !important" }} fullWidth maxWidth="md" open={true} onClose={this.closeDetails} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title" style={{ padding: "15px 15px 5px" }}><h3 style={{ margin: "2px" }}>{_.isUndefined(this.state.currentMicroservice.microServiceDetails) ? "" : this.state.currentMicroservice.microServiceDetails[0]['name']}
                        {(this.state.currentMicroservice.currentStatus.length > 0 || this.state.currentMicroservice.history.length > 0) ? (
                            <Button style={{ padding: "3px 6px 3px", border: "1.3px solid", marginLeft: "10px" }} variant="outlined" onClick={() => this.handleOpen(this.props.location.state.key + "_" + this.state.currentMicroservice.microServiceDetails[0]['name'] + '_FAILURE')} color="primary">
                                <b>View Prediction</b><PollIcon style={{ fontSize: "20px" }} />
                            </Button>
                        ) : ""}
                    </h3>
                    </DialogTitle>
                    <DialogContent>
                        <div class="row">
                            <div className="col-md-9" style={{ overflowY: "scroll", height: "450px" }}>
                                <div class="row">
                                    <span style={{ marginLeft: "10px", fontSize: "20px", fontWeight: "600", verticalAlign: "top" }}>Status: </span>
                                    {this.state.currentMicroservice.currentStatus ? (
                                        this.state.currentMicroservice.currentStatus.length > 0 ? (
                                            <span style={{ color: "#f50057" }}><BatteryAlertIcon style={{ fontSize: "35px", verticalAlign: "top" }} /><span style={{ fontSize: "16px", verticalAlign: "-webkit-baseline-middle", fontWeight: "600" }}>{this.state.currentMicroservice.currentStatus.length} API's Failing</span></span>
                                        ) : (
                                                <span style={{ color: "#438f54" }}><BatteryChargingFullIcon style={{ fontSize: "35px", verticalAlign: "top" }} /><span style={{ fontSize: "16px", verticalAlign: "-webkit-baseline-middle", fontWeight: "600" }}>No Failures</span></span>
                                            )
                                    ) : ""}
                                </div>
                                <div class="row" style={{ marginTop: "10px", marginBottom: "5px" }}>
                                    <span style={{ margin: "20px 10px 20px", fontSize: "18px", fontWeight: "600" }}>Current API Failure(s)</span>
                                </div>
                                <div class="row">
                                    {this.state.currentMicroservice.currentStatus ? (
                                        this.state.currentMicroservice.currentStatus.length > 0 ? (
                                            <div>
                                                {this.state.currentMicroservice.currentStatus.map(api => {
                                                    return (
                                                        <div style={{ padding: "0px 10px 0px" }}>
                                                            <ExpansionPanel style={{ backgroundColor: "#ffe6e6", marginBottom: "3px" }}>
                                                                <ExpansionPanelSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls="panel1a-content"
                                                                    id="panel1a-header"
                                                                >
                                                                    <div class="row" style={{ width: "100%" }}>
                                                                        <Typography>
                                                                            <div class="col-md-4"><b>{api.failedApi}</b></div>
                                                                            <div class="col-md-5"><b>Last Failure: {moment.unix(api.failureTime).format("LLLL")}</b></div>
                                                                            <div class="col-md-1" style={{ textAlign: "left", padding: "0px" }}><ReportProblemIcon style={{ fontSize: "10px", marginTop: "0px" }} /> <b>{api['severity']}</b> </div>
                                                                            <div class="col-md-2" style={{ textAlign: "right", padding: "0px" }}>
                                                                                <b>Failing for {api['failureCount']} Time(s)</b>
                                                                            </div>
                                                                        </Typography>
                                                                    </div>
                                                                </ExpansionPanelSummary>
                                                                <ExpansionPanelDetails style={{ backgroundColor: "#fffafa" }}>
                                                                    <Typography>
                                                                        <ReactJson
                                                                            src={api.failureData}
                                                                            collapsed={false}
                                                                            displayDataTypes={false}
                                                                            sortKeys={false}
                                                                            enableClipboard={false}
                                                                        />
                                                                    </Typography>
                                                                </ExpansionPanelDetails>
                                                            </ExpansionPanel>
                                                        </div>
                                                    )

                                                })}
                                            </div>
                                        ) : (
                                                <div class="row container" style={{ width: "100%", marginLeft: "0px", textAlign: "center", marginTop: "5px" }}>
                                                    <Card style={{ padding: "5px" }}>
                                                        <b>No Failure(s) Currently</b>
                                                    </Card>
                                                </div>
                                            )
                                    ) : ""}
                                </div>
                                <div class="row" style={{ marginTop: "10px" }}>
                                    <span style={{ margin: "20px 10px 20px", fontSize: "18px", fontWeight: "600" }}>API Failure History</span>
                                </div>
                                <div class="row" style={{ marginTop: "5px" }}>
                                    {this.state.currentMicroservice.history ? (
                                        this.state.currentMicroservice.history.length > 0 ? (
                                            <div>
                                                {this.state.currentMicroservice.history.map(api => {
                                                    return (
                                                        <div style={{ padding: "0px 10px 0px" }}>
                                                            <ExpansionPanel style={{ backgroundColor: "#ebf1ff", marginBottom: "3px" }}>
                                                                <ExpansionPanelSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls="panel1a-content"
                                                                    id="panel1a-header"
                                                                >
                                                                    <div class="row" style={{ width: "100%" }}>
                                                                        <Typography>
                                                                            <div class="col-md-5"><b>{api.name}</b></div>
                                                                            <div class="col-md-2"><b>Failed {api.history[0]['failureCount']} Times</b></div>
                                                                            <div class="col-md-2" style={{ textAlign: "right" }}><ReportProblemIcon style={{ fontSize: "10px", marginTop: "0px" }} /> <b>{api.history[0]['severity']}</b> </div>
                                                                            <div class="col-md-3" style={{ textAlign: "right" }}>
                                                                                <Button variant="outlined" style={{ padding: "0px 3px 0px", border: "1.1px solid" }} onClick={() => this.handleOpen(api.history[0]['failedApi'])} color="secondary">
                                                                                    <b>View Prediction</b><PollIcon style={{ fontSize: "20px" }} />
                                                                                </Button>
                                                                            </div>
                                                                        </Typography>
                                                                    </div>
                                                                </ExpansionPanelSummary>
                                                                <ExpansionPanelDetails style={{ backgroundColor: "#f7f9ff" }}>
                                                                    <Typography>
                                                                        <ReactJson
                                                                            src={api.history}
                                                                            collapsed={false}
                                                                            displayDataTypes={false}
                                                                            sortKeys={false}
                                                                            enableClipboard={false}
                                                                        />
                                                                    </Typography>
                                                                </ExpansionPanelDetails>
                                                            </ExpansionPanel>
                                                        </div>
                                                    )

                                                })}
                                            </div>
                                        ) : (
                                                <div class="row container" style={{ width: "100%", marginLeft: "0px", textAlign: "center", marginTop: "5px" }}>
                                                    <Card style={{ padding: "5px" }}>
                                                        <b>No Failure History</b>
                                                    </Card>
                                                </div>
                                            )
                                    ) : ""}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <h3 style={{ margin: "0px 0px 10px" }}>Dependencies</h3>
                                {this.state.currentMicroservice.microServiceDetails ? this.state.currentMicroservice.microServiceDetails[0].dependencies.map((microservice, index) => {
                                    return (
                                        <Chip
                                            label={<h5>{microservice}</h5>}
                                            icon={<BlurOnIcon style={{ fontSize: "24px" }} />}
                                            deleteIcon={<CloseIcon />}
                                            color="primary"
                                            style={{ cursor: "pointer", height: "35px", "marginRight": "8px", marginBottom: "8px", padding: "0px", fontSize: "14px", boxShadow: "2px 2px 5px 0px #abc4eb" }}
                                        />
                                    )
                                }) : ""}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDetails} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )
        } else {
            dialog = null
        }
        let prediction = null;
        if (this.state.prediction === true) {
            prediction = (
                <Prediction open={this.state.prediction} handleClose={this.handleClose} predictionText={this.state.predictionText} applicationId={params.id} />
            )
        } else {
            prediction = null;
        }
        let layoutname = { name: 'cola', flow: { axis: 'y', minSeparation: 50 }, animate: true, maxSimulationTime: 8000, randomize: true }
        return (
            <div class="container" style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.3)", backgroundColor: "#fff", marginTop: "5px" }}>
                <Loading loading={this.state.loading} />
                {prediction}
                {dialog}
                <h2 style={{ textAlign: "center", margin: "5px 0px 10px", color: "#5e5d5c" }}>{this.props.location.state.application}</h2><hr style={{ margin: "0px" }} />
                <CytoscapeComponent
                    elements={this.state.application}
                    style={{
                        width: "100%",
                        height: this.state.h + 40,
                        border: "1px solid groove",
                        marginTop: "10px",
                        cursor: "pointer"
                    }}
                    cy={(cy) => { this.cy = cy }}
                    //zoomingEnabled={false}
                    //zoom={0.8}
                    layout={layoutname}
                />
                <div class="row" >
                    <div class="col-md-2" />
                    <div class="col-md-2" style={{ textAlign: "center" }}>
                        <span style={{ height: "30px", width: "30px", backgroundColor: "#438f54", borderRadius: "50%", display: "inline-block" }}></span><b style={{verticalAlign:"top", marginLeft:"5px" }}>Success</b>
                    </div>
                    <div class="col-md-2" style={{}}>
                        <span style={{ height: "30px", width: "30px", backgroundColor: "#dc5a32", borderRadius: "50%", display: "inline-block" }}></span><b style={{verticalAlign:"top", marginLeft:"5px" }}>Failing</b>
                    </div>
                    <div class="col-md-2" style={{}}>
                        <span style={{ height: "30px", width: "30px", backgroundColor: "#f0957a", borderRadius: "50%", display: "inline-block" }}></span><b style={{verticalAlign:"top", marginLeft:"5px" }}>May Fail</b>
                    </div>
                    <div class="col-md-2" style={{}}>
                        <span style={{ height: "30px", width: "30px", backgroundColor: "teal", borderRadius: "50%", display: "inline-block" }}></span><b style={{verticalAlign:"top", marginLeft:"5px" }}>Dependant</b>
                    </div>
                    <div class="col-md-2" />
                </div>
            </div>
        )
    }
}