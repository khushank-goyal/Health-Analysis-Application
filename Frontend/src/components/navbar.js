import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import '../App.css';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.handleLogout = this.handleLogout.bind(this);
    }
    handleLogout = () => {
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("id");
    }

    render() {
        let navBar = null;
        if (localStorage.getItem("email") !== null) {
            navBar = (
                <ul class="nav navbar-nav navbar-right">
                    <li ><Link class="navcolor" style={{ color: "white" }}><b>Welcome {localStorage.getItem("name")}</b></Link></li>
                    <li ><Link to="/onboard" class="navcolor" style={{ color: "white" }}><b>On-Board App</b></Link></li>
                    <li><Link to="/applications" class="navcolor" style={{ color: "white" }}><b>Applications</b></Link></li>
                    <li><Link to="/signin" class="navcolor" onClick={this.handleLogout} style={{ color: "white" }}><span class="glyphicon glyphicon-log-out"></span> <b>Logout</b></Link></li>
                </ul>
            )
        } else {
            navBar = (
                <ul class="nav navbar-nav navbar-right">
                    <li><Link to="/signin" class="navcolor" style={{ color: "white" }}><span class="glyphicon glyphicon-log-in"></span><b> Sign In</b></Link></li>
                    <li><Link to="/signup" class="navcolor" style={{ color: "white" }}><span class="glyphicon glyphicon-user"></span><b> Sign Up</b></Link></li>
                </ul>
            )
        }
        let redirectVar = null;
        if (!sessionStorage.getItem("persona") && window.location.pathname === '/') {
            return ( <Redirect to="/landing_page" />)
        } else if(!sessionStorage.getItem("persona") && window.location.pathname.match(/^\/landing_page/)){
            window.location.pathname = '/landing_page';
        } else {
            redirectVar = <Redirect to="/signin" />
        }
        return (
            <div>
                {redirectVar}
                <nav class="navbar navbar-dark bg-dark" style={{ backgroundColor: "#1b4a79", borderRadius: "0px", padding: "0px", margin: "0px", paddingTop: "3px", paddingBottom: "3px", boxShadow: "0 2px 5px rgba(0,0,0,0.3)", color: "white" }}>
                    <div class="container-fluid">
                        <div class="navbar-header" style={{ display: "inline" }}>
                            <b class="navbar-brand" style={{ color: "white", display: "inline", paddingRight:"0px" }}>
                                Application Health Analytics
                            </b>
                        </div>
                        <ul class="nav navbar-nav">
                        </ul>
                        {navBar}
                    </div>
                </nav>
            </div>
        )
    }
}

export default NavBar;