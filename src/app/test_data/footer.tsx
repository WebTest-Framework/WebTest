import React, { useState } from 'react';
import '../../css/App.css';
import { Card, Button, Modal } from 'react-bootstrap';
import http from 'http';
import * as qs from 'querystring';

var server="localhost";

interface AppState {
    error: string,
    isLoaded: boolean,
    items: any,
    subType: string[],
    curSubType: string,
    testDataFiles: string[],
    curTestDataFile: string
}

class Footer extends React.Component<any, AppState, AppState> {
    constructor(prop: any) {
        super(prop);
        this.state = {
            error: "",
            isLoaded: true,
            items: "",
            subType: [],
            testDataFiles: [],
            curSubType: "",
            curTestDataFile: ""
        };
    }

    getSubTypeOptions(optionList: string[]) {
        
    }

    componentDidMount() {
        fetch("http://" + server + ":16720/api/testdata/getSubTypes")
            .then(res => res.json())
            .then(
            (result) => {
              this.setState({
                error: "",
                isLoaded: true,
                items: result.subs,
                subType: result.subs.subType,
                testDataFiles: []
              });
            },
            (error) => {
              this.setState({
                isLoaded: true,
                error: error,
                items: []
              });
            }
            );
    }

    fetchTestFilesInType(event: any) {
        this.setState({
            curSubType: event.target.value
        });
        if(event.target.value !== "default") {
            fetch("http://" + server + ":16720/api/testdata/getTestDataFiles?testSubPath=" + event.target.value)
            .then(res => res.json())
                .then(
                (result) => {
                this.setState({
                    error: "",
                    isLoaded: true,
                    testDataFiles: result.subs
                });
                },
                (error) => {
                this.setState({
                    isLoaded: true,
                    error: error,
                    items: [],
                    subType: [],
                    testDataFiles: []
                });
                }
            );
        }
    }

    postData() {
        var storeKeys = Object.keys(localStorage);
        var dataSets = "{";
        for(let i = 0; i < storeKeys.length; i ++) {
            dataSets = dataSets + "\"" + storeKeys[i] + "\":\"" + localStorage.getItem(storeKeys[i]) + "\",";
            localStorage.removeItem(storeKeys[i]);
        }
        dataSets = dataSets.substring(0, dataSets.length - 1);
        dataSets += "}";
        var options = {
        "method": "POST",
        "hostname": server,
        "port": "16720",
        "path": "/process_post",
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        };
    
        var req = http.request(options, function (res) {
            var chunks: any[] = [];
        
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
        
            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });
        });
        req.write(qs.stringify({ subDataType: this.state.curSubType,
        testDataFileName: this.state.curTestDataFile,
        dataJson: dataSets }));
        req.end();
        window.location.reload();
    }

    render() {
        const {error, isLoaded, items, subType, testDataFiles} = this.state;
        if(error !== "") {
            return <div>{error.toString()}</div>;
        } else if(!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <Card className="text-left bg-dark text-white" style={{position: "fixed", bottom: "0px", width: "100%", backgroundColor: "white", display: "inline"}}>
                    <Card.Body>
                        <Card.Title style={{color: "#a259e4"}}>Save Your Files</Card.Title>
                    </Card.Body>
                    <select title="Select Sub Data Type" className="dd-slt" onChange={(e) => this.fetchTestFilesInType(e)}>
                    <option value="default">Select Sub Data Type</option>    
                    {subType.map((item: any) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                    </select>
                    <select onChange={(e) => { this.setState({ curTestDataFile: e.target.value});}} title="Select Test Files" className="dd-slt" disabled={!items.isSubPresent}>
                    <option value="default">Select Test Files</option>
                    {testDataFiles.map((item: any) => (
                        <option key={item.split(' ').join('')} value={item}>{item.split('.')[0]}</option>
                    ))}
                    </select>
                    <Button className="btn-cls" variant="outline-primary" onClick={() => {
                        this.postData();
                    }}>Save</Button>
                </Card>
            );
        }
    }
}

export default Footer;