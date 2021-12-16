import React, { Component } from 'react';
import '../App.css'
import { PieChart, Pie, Sector, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import microservice from '../components/images/microservice.png';
import BatteryChargingFullIcon from '@material-ui/icons/BatteryChargingFull';
import Rating from '@material-ui/lab/Rating';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from './loading';

class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            projects: [],
            displayProjects: [],
            sliderValue: 0,
            loading: false
        }
        this.searchtextChangeHandler = this.searchtextChangeHandler.bind(this);
        this.sliderChange = this.sliderChange.bind(this);
    }
    componentDidMount() {
        this.setState({ loading: true })
        let url = process.env.REACT_APP_BACKEND_URL + `/getapplications/${localStorage.getItem("id")}`;
        axios.defaults.withCredentials = true;
        axios.get(url)
            .then(response => {
                this.setState({
                    projects: response.data,
                    displayProjects: response.data,
                    loading: false
                })

                this.state.projects.map((project, index) => {
                    var successCount = 0;
                    project.microServicesdetails.map((microservice, index) => {
                        if (microservice.success === true) {
                            successCount = successCount + 1;
                        }
                    })
                    project.health = ((successCount / project.microServicesdetails.length) * 100).toFixed(2)
                })
            }
            )
            .catch((error) => {
                console.log(error)
            })
    }

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    searchtextChangeHandler = (e) => {
        let result = []
        for (var i = 0; i < this.state.projects.length; i++) {
            if (this.state.projects[i].name.toLowerCase().includes(e.target.value.toLowerCase())) {
                result.push(this.state.projects[i])
                this.setState({
                    displayProjects: result
                })
            }
        }
        this.setState({
            displayProjects: result
        })
    }

    searchtextChangeHandlerAuto = (e, value) => {
        console.log(value)
        if (value === null) {
            this.setState({
                displayProjects: this.state.projects
            })
            return
        }
        let result = []
        for (var i = 0; i < this.state.projects.length; i++) {
            if (this.state.projects[i].name.toLowerCase().includes(value.toLowerCase())) {
                result.push(this.state.projects[i])
                this.setState({
                    displayProjects: result
                })
            }
        }
        this.setState({
            displayProjects: result
        })
    }

    sliderChange = (event, value) => {
        this.setState({
            sliderValue: value
        })
        this.filterProjects(value)
    }

    filterProjects = (value) => {
        let result = []
        this.state.projects.map(project => {
            if (project.health >= value) {
                result.push(project)
            }
        })
        this.setState({
            displayProjects: result
        })
    }

    render() {
        var data = [];
        this.state.projects.map((project, index) => {
            var successCount = 0;
            project.microServicesdetails.map((microservice, index) => {
                if (microservice.success === true) {
                    successCount = successCount + 1;
                }
            })
            data.push({ name: project.name, value: 500, health: ((successCount / project.microServicesdetails.length) * 100).toFixed(2) })
        })

        const renderActiveShape = (props) => {
            const RADIAN = Math.PI / 180;
            const {
                cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
                fill, payload, percent, value, health,
            } = props;
            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius + 10) * cos;
            const sy = cy + (outerRadius + 10) * sin;
            const mx = cx + (outerRadius + 30) * cos;
            const my = cy + (outerRadius + 30) * sin;
            const ex = mx + (cos >= 0 ? 1 : -1) * 22;
            const ey = my;
            const textAnchor = cos >= 0 ? 'start' : 'end';

            return (
                <g>
                    <text x={cx} y={cy} dy={8} textAnchor="middle" fill={"#dc5a32"}>{payload.name}</text>
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={"#dc5a32"}
                    />
                    <Sector
                        cx={cx}
                        cy={cy}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        innerRadius={outerRadius + 6}
                        outerRadius={outerRadius + 10}
                        fill={"#dc5a32"}
                    />
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={"#dc5a32"} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={"#dc5a32"} stroke="#dc5a32" />
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#dc5a32">{`Health ${health}%`}</text>
                </g>
            );
        };

        var dataBar = [];
        this.state.projects.map((project, index) => {
            var successCount = 0;
            project.microServicesdetails.map((microservice, index) => {
                if (microservice.success === true) {
                    successCount = successCount + 1;
                }
            })
            dataBar.push({ name: project.name, Success: successCount, Failure: (project.microServicesdetails.length - successCount) })
        })

        const top100Films = [];
        this.state.projects.map((project, index) => {
            top100Films.push({ title: project.name })
        })

        const PrettoSlider = withStyles({
            root: {
                color: '#dc5a32',
                height: 8,
            },
            thumb: {
                height: 24,
                width: 24,
                backgroundColor: '#dc5a32',
                border: '2px solid currentColor',
                marginTop: -8,
                marginLeft: -12,
                '&:focus, &:hover, &$active': {
                    boxShadow: 'inherit',
                },
            },
            active: {},
            valueLabel: {
                left: 'calc(-50% + 4px)',
            },
            track: {
                height: 8,
                borderRadius: 4,
            },
            rail: {
                height: 8,
                borderRadius: 4,
            },
        })(Slider);



        return (
            <div style={{ marginTop: "5px" }}>
                <Loading loading={this.state.loading} />
                <div className="col-md-7">

                    <div className="row">

                        <Card style={{ marginLeft: "10px" }}>
                            <div className="col-md-6">
                                <div style={{ minHeight: "90px", maxHeight: "90px", marginLeft: "10px", marginTop: "10px" }}>
                                    <p style={{ fontSize: "17px", color: "#5c5e5e", fontWeight: "500", marginBottom: "0px" }}>Search Applications:</p>
                                    <div style={{ width: 300, marginTop: "-10px" }}>
                                        <Autocomplete onChange={this.searchtextChangeHandlerAuto}
                                            id="free-solo-demo"
                                            freeSolo
                                            options={top100Films.map((option) => option.title)}
                                            renderInput={(params) => (
                                                <TextField onChange={this.searchtextChangeHandler}  {...params} label="Application Name" margin="normal" variant="outlined" />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={{ minHeight: "90px", maxHeight: "90px", marginLeft: "10px", marginTop: "10px" }}>
                                    <p style={{ fontSize: "17px", color: "#5c5e5e", fontWeight: "500" }}>Health range:</p>
                                    <PrettoSlider style={{ width: "97%" }} valueLabelDisplay="auto" aria-label="pretto slider" value={this.state.sliderValue} onChange={this.sliderChange} />
                                </div>
                            </div>
                        </Card>

                    </div>

                    <div className="row" style={{ marginTop: "5px", minHeight: "470px", maxHeight: "470px", overflowY: "scroll" }}>

                        {this.state.displayProjects.map((project, index) => {

                            var microservices = [];
                            var runningMicroservices = 0;

                            project.microServicesdetails.map((microservice, index) => {

                                microservices.push(microservice.name);

                                if (microservice.success === true) {
                                    runningMicroservices = runningMicroservices + 1
                                }
                            })
                            return (
                                <Card style={{ marginLeft: "10px", marginBottom: "2px" }}>
                                    <div className="col-md-10" style={{ margin: "10px" }}>
                                        <Link to={{ pathname: "/application/" + project._id, state: { application: project.name, key: project.key } }} style={{ fontSize: "17px", color: "#5c5e5e", fontWeight: "500" }}><p style={{ fontSize: "17px", color: "#5c5e5e", fontWeight: "500" }}>{project.name}</p></Link>
                                        <p style={{ display: "inline" }}>
                                            {microservices.slice(0, 9).map((service, index) => {
                                                return (<Chip style={{ fontSize: "13px", color: "#5c5e5e", fontWeight: "500", marginRight: "10px", marginBottom: "10px" }} variant="outlined" label={service} avatar={<Avatar src={microservice} />} />)
                                            })}
                                        </p>
                                        {microservices.length > 9 ? <p style={{ display: "inline", fontSize: "13px", color: "#5c5e5e", fontWeight: "500" }}>&nbsp;+{microservices.length - 9} others</p> : ""}
                                    </div>

                                    <div className="col-md-1" style={{ margin: "15px" }}>

                                        {(runningMicroservices / microservices.length) * 100 > 80 ? <Rating
                                            style={{ marginTop: "10px" }}
                                            defaultValue={0.8}
                                            size="large"
                                            style={{ color: "#dc5a32" }}
                                            precision={0.1}
                                            max={1}
                                            readOnly={true}
                                            icon={<BatteryChargingFullIcon style={{ fontSize: "60" }}
                                                name="read-only" />}
                                        /> : <Rating
                                                style={{ marginTop: "10px" }}
                                                defaultValue={0.8}
                                                size="large"
                                                style={{ color: "#fc8965" }}
                                                precision={0.1}
                                                max={1}
                                                readOnly={true}
                                                icon={<BatteryChargingFullIcon style={{ fontSize: "60" }}
                                                    name="read-only" />}
                                            />}
                                    </div>
                                </Card>
                            )
                        })}

                    </div>

                </div>

                <div className="col-md-5" style={{ paddingLeft: "5px" }}>
                    <Card>
                        <p style={{ fontSize: "20px", color: "#5c5e5e", margin: "0px", fontWeight: "500" }}><center>Applications Health</center></p>
                        <PieChart width={500} height={250}>
                            <Pie
                                activeIndex={this.state.activeIndex}
                                activeShape={renderActiveShape}
                                data={data}
                                cx={260}
                                cy={125}
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={this.onPieEnter}
                            />
                        </PieChart>
                    </Card>
                    <Card style={{ marginTop: "5px", marginBottom: "5px" }}>
                        <p style={{ fontSize: "20px", color: "#5c5e5e", margin: "0px", fontWeight: "500" }}><center>Current Microservice Status</center></p>
                        <BarChart
                            width={500}
                            height={270}
                            data={dataBar}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Success" fill="teal" />
                            <Bar dataKey="Failure" fill="#dc5a32" />
                        </BarChart>
                    </Card>
                </div>
            </div>
        )
    }
}

export default Projects;