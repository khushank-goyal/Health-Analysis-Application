import React, { Component } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import '../App.css'

class Loading extends Component {
    render() {
        return (
            <Backdrop open={this.props.loading} style={{ zIndex: "10000" }}>
                <CircularProgress />
                <span style={{ color: "white", marginLeft: "10px" }}>
                    {this.props.loadingText ? this.props.loadingText : ""}
                </span>
            </Backdrop>
        )
    }
}

export default Loading;