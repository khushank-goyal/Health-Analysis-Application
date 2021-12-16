import React, { Component } from 'react';
import ReactJson from 'react-json-view'
import Alert from '@material-ui/lab/Alert';
import { Link } from 'react-router-dom';
import '../App.css'

const logformat = {
    // "microservice": "ORDERS",
    // "api": "CREATE_ORDER",
    // "status": "AMAZON_ORDERS_SUCCESS or AMAZON_ORDERS_FAILURE",
    // "log": "logs",
    // "reasons": "DB Connection Failure",
    // "endpoint": "{host}:/orders/create",
    // "timestamp": "2020-04-17T11:29:48.601Z",
    message: {
        api: "/cutomer/payment",
         status : "INSTACART_GATEWAY_FAILURE",
        logData: "{ error : 'INSTA CART Payment failure'}",
    },
    metadata: {
        source: "Insta Cart",
        sourcetype: "httpevent",
        index: "main",
        host: "farm.local",
    },
    log: {
        error: "hellow",
    },
    severity: "High"
}

class OnBoardSuccess extends Component {
    render() {
        return (
            <div className="container" style={{ width: "70%", marginTop: "10px", backgroundColor: "white" }}>
                <h4 style={{ textAlign: "center", margin: "30px 0px 30px", color: "green" }}>Application On-Boarding Success</h4>
                <Alert severity="info" style={{}}><h5 style={{ margin: "0px" }} >Please find the Logging Guidelines mentioned below !</h5></Alert>
                <ReactJson src={logformat} theme="brewer" style={{ width: "60%", margin: "30px 30px 30px" }} />
                <div style={{ textAlign: "center", margin: "30px 0px 30px" }}><Link to="/applications"><b>Go to Applications</b></Link></div>
            </div>
        )
    }
}

export default OnBoardSuccess;