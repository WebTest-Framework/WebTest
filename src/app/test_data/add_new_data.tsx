import * as React from 'react';
import { Table, Modal, Button, FormControl, Alert } from 'react-bootstrap';
import '../../css/App.css';
import * as ReactDOM from 'react-dom';
import SuccessMessage from '../success_message';
import * as qs from 'querystring';
import * as http from 'http';

var server = "localhost";

interface AppState {
    toOpenPopup: boolean,
    isString: boolean,
    dataRows: any[],
    dataRowSerial: number
    toShowSuccess: boolean
}

class AddNewDataModal extends React.Component<any, AppState, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            toOpenPopup: props.toOpenPopup,
            isString: false,
            dataRows: [],
            dataRowSerial: 1,
            toShowSuccess: false
        };
    }

    handleClose() {
        this.setState({ toOpenPopup: false });
    }

    addNewDataRow() {
        var existingDataRows: any[] = this.state.dataRows;

        this.setState({dataRowSerial: this.state.dataRowSerial + 1});
        existingDataRows.push(<tr>
            <td>{this.state.dataRowSerial + 1}</td>
            <td>
                <FormControl key={"new_dataKey_" + (this.state.dataRowSerial)} onChange={(e) => this.storeData(e, "new_dataKey_" + (this.state.dataRowSerial))} type="text" placeholder="Data Key" name="dataValue" className=" mr-sm-1" />
            </td>
            <td>
                <FormControl key={"new_dataValue_" + (this.state.dataRowSerial)} onChange={(e) => this.storeData(e, "new_dataValue_" + (this.state.dataRowSerial))} type="text" placeholder="Data Value" name="dataValue" className=" mr-sm-1" />
            </td>
        </tr>);
        this.setState({
            dataRows: existingDataRows
        });
    }

    storeData(event: any, key: string) {
        if(event.target.value !== "") {
            localStorage.setItem(key, event.target.value);
        } else {
            if(Object.keys(localStorage).includes(key)) {
                localStorage.removeItem(key);
            }
        }
    }

    handleSave() {
        var data = "{";
        var count = 1;
        while(true) {
            var instanceKey = localStorage.getItem("new_dataKey_" + count);
            var instanceVal = localStorage.getItem("new_dataValue_" + count);
            if(instanceKey !== null && instanceVal !== null) {
                // localStorage.setItem(instanceKey, instanceVal);
                localStorage.removeItem("new_dataKey_" + count);
                localStorage.removeItem("new_dataValue_" + count);
                data += "\"" + instanceKey + "\": " + "\"" + instanceVal + "\",";
                count ++;
            } else {
                break;
            }
        }
        data = data.substring(0, data.length - 1);
        data += "}";
        var options = {
            "method": "POST",
            "hostname": server,
            "port": "16720",
            "path": "/api/testdata/addnewkey",
            "headers": {
              "content-type": "application/x-www-form-urlencoded"
            }
          };
          
        var req = http.request(options, function (res) {
          var chunks:any[] = [];
        
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
        
          res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            ReactDOM.render(<SuccessMessage toShowSuccess={true} message={"Success"}/>, document.getElementById("modal") as HTMLElement);
            setTimeout(function() { window.location.reload(); }, 2000);
          });
        });
        req.write(qs.stringify({ data: data }));
        req.end();
    }

    render() {
        if(this.state.toOpenPopup) {
            return(
                <Modal show={this.state.toOpenPopup}>
                    <Modal.Header closeButton onClick={() => this.handleClose()}>
                    <Modal.Title>Add new data set</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table style={{marginBottom: "0px"}} striped bordered hover variant="light">
                            <thead>
                                <tr>
                                    <th>Serial No</th>
                                    <th>Data Key</th>
                                    <th>Data Values</th>
                                    <th>
                                        <Button variant="light" onClick={() => this.addNewDataRow()}>+</Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{1}</td>
                                    <td>
                                        <FormControl key={"new_dataKey_1"} onChange={(e) => this.storeData(e, "new_dataKey_1")} type="text" placeholder="Data Key" name="search" className=" mr-sm-1" />
                                    </td>
                                    <td>
                                        <FormControl key={"new_dataValue_1"} onChange={(e) => this.storeData(e, "new_dataValue_1")} type="text" placeholder="Data Value" name="search" className=" mr-sm-1" />
                                    </td>
                                </tr>
                                {this.state.dataRows.map((item: any) => (item))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.handleClose()}>Close</Button>
                    <Button variant="primary" onClick={() => this.handleSave()}>Save</Button>
                    </Modal.Footer>
                </Modal>
            );
        }
    }
}

export default AddNewDataModal;