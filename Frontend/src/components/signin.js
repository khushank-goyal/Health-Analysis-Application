import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import splunk from '../components/images/background.jpeg';
class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invalidCredentials: '',
            email: "",
            password: "",
            invalidEmail: false
        }
        this.authenticateUser = this.authenticateUser.bind(this);
        this.emailChangeHandler = this.emailChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.validateCredentials = this.validateCredentials.bind(this);
    }

    authenticateUser = (event) => {
        event.preventDefault();
        let url = process.env.REACT_APP_BACKEND_URL + '/signin?email=' + this.state.email + '&password=' + this.state.password;
        axios.defaults.withCredentials = true;
        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    localStorage.setItem("email", this.state.email);
                    localStorage.setItem("id", response.data._id);
                    localStorage.setItem("name", response.data.name);
                    this.setState({
                        invalidCredentials: false
                    })
                } else {
                    this.setState({
                        invalidCredentials: true
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    invalidCredentials: true
                })
            });;
    }

    emailChangeHandler = (event) => {
        if (/.+@.+\.[A-Za-z]+$/.test(event.target.value)) {
            this.setState({
                invalidEmail: false,
                email: event.target.value
            })
        } else {
            this.setState({
                invalidEmail: true,
                email: event.target.value
            })
        }
    }

    passwordChangeHandler = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    validateCredentials = (event) => {
        if (!this.state.invalidEmail && this.state.password !== "") return false
        else return true
    }

    render() {
        let home = null;
        if (localStorage.getItem("email") !== null) {
            home = <Redirect to={"/applications"} />
        }
        return (
            <div style={{ overflowX: "hidden", backgroundImage: `url(${splunk})` }}>
                {home}
                <div class="container" style={{ marginTop: "40px",marginBottom:"193px", width: "400px", backgroundColor: "", borderRadius: "7px", padding: "30px 40px 30px" }}>
                    <div class="login-form">
                        <div class="panel" style={{ marginBottom: "30px", opacity:"0%" }}>
                            <h2 style={{ textAlign: "center" }}>Sign In</h2>
                        </div>
                        <form className="form" onSubmit={this.authenticateUser}>
                            <div class="form-group">
                                <input type="email" onChange={this.emailChangeHandler} style={{ backgroundColor: "" }} class="form-control" name="emailId" placeholder="Email Id" required />
                            </div>
                            <div class="form-group" style={{ "alignItems": "center" }}>
                                {this.state.invalidEmail ? <span style={{ color: "red", "font-weight": "bold", "textAlign": "center" }}>Invalid Email Id. Please check</span> : ''}
                            </div>
                            <div class="form-group" style={{ marginBottom: "20px" }}>
                                <input type="password" onChange={this.passwordChangeHandler} class="form-control" name="password" placeholder="Password" required />
                            </div>
                            <div class="form-group" style={{ "alignItems": "center" }}>
                                {this.state.invalidCredentials ? <span style={{ color: "red", "font-style": "oblique", "font-weight": "bold", "textAlign": "center" }}>Invalid Username or Password</span> : ''}
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <button disabled={this.validateCredentials()} class="btn btn-success" style={{ "width": "100%" }}>Login</button>
                            </div>
                            <br />
                            <div style={{ textAlign: "center" }}>
                                <Link to="/signup">Not a User? Sign Up</Link>
                            </div>
                        </form>
                        <br />
                    </div>
                </div>
            </div>
        )
    }
}

export default SignIn;