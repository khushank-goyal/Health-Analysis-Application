import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Loading from './loading';
import axios from 'axios';
import moment from 'moment';
import {
    ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class Prediction extends Component {
    state = {
        loading: false,
        data: []
    }
    componentDidMount() {
        this.setState({ loading: true })
        let url = process.env.REACT_APP_BACKEND_URL + `/predictfailure/${this.props.applicationId}`;
        axios.defaults.withCredentials = true;
        axios.post(url, { searchText: this.props.predictionText })
            .then(response => {
                let data = JSON.stringify(response.data)
                data = data.replace(/lower95\(prediction\(count\)\)/g, "Prediction (Lower 95)")
                data = data.replace(/upper95\(prediction\(count\)\)/g, "Prediction (Upper 95)")
                data = data.replace(/prediction\(count\)/g, "Prediction")
                data = data.replace(/T00\:00\:00\.000\+00\:00/g, "")
                this.setState({
                    data: JSON.parse(data),
                    loading: false
                })
            }
            )
            .catch((error) => {
            })
    }
    render() {
        return (
            <div >
                <Loading loading={this.state.loading} loadingText="Fetching Prediction !!" />
                <Dialog fullScreen open={this.props.open} onClose={this.props.handleClose} TransitionComponent={Transition}>
                    <AppBar >
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={this.props.handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6">
                                Failure Prediction
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <List>
                        <div class="container" style={{ height: "500px", width: "800px", marginTop: "120px" }}>
                            <ResponsiveContainer style={{ maxHeight: "500px" }}>
                                <ComposedChart
                                    width="600px"
                                    height="400px"
                                    data={this.state.data}
                                    margin={{
                                        top: 20, right: 20, bottom: 20, left: 20,
                                    }}
                                >
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis dataKey="_time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="Prediction (Upper 95)" fill="#8884d8" stroke="#8884d8" />
                                    <Bar dataKey="Prediction" barSize={20} fill="#413ea0" />
                                    <Line type="monotone" dataKey="Prediction (Lower 95)" stroke="#ff7300" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                    </List>
                </Dialog>
            </div>
        );
    }
}
export default Prediction;