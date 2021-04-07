import * as React from 'react';
import { Table, Modal, Button } from 'react-bootstrap';

interface AppState {
    itemId: any,
    itemValue: any,
    toOpenPopup: boolean,
    isString: boolean
}

class ModalView extends React.Component<any, AppState, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            itemId: props.itemId,
            itemValue: props.itemValue,
            toOpenPopup: props.toOpenPopup,
            isString: false
        };
    }

    handleModalDataSave(event: any) {
        var allData: string[] = [];
        var key = "no_key";
        for(let eachLocalStorage of Object.keys(localStorage)) {
            var data = localStorage.getItem(eachLocalStorage);
            if(eachLocalStorage.includes("modal_") && data !== null) {
                allData.push(data);
                if(data !== null) {
                    key = eachLocalStorage.split("modal_")[1].split("_")[0];
                    localStorage.removeItem(eachLocalStorage);
                }
            }
        }
        if(this.state.isString) {
            localStorage.setItem(key, allData.toString());
        } else {
            localStorage.setItem(key, "[" + allData.toString() + "]");
        }
        this.setState({ toOpenPopup: false});
    }

    saveTestDataModal(event: React.ChangeEvent<HTMLInputElement>, dataValue: string) {
        if(event.target.checked) {
            localStorage.setItem("modal_" + event.target.id, dataValue);
        } else {
            localStorage.removeItem("modal_" + event.target.id);
        }
    }

    saveAsString(event: React.ChangeEvent<HTMLInputElement>) {
        if(event.target.checked) {
            this.setState({ isString: true});
        } else {
            this.setState({ isString: false});
        }
    }

    render() {
        var count = 0;
        if(this.state.toOpenPopup) {
            return(
                <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>{this.state.itemId} contains more than one options</Modal.Title>
                    <Button style={{backgroundColor:"white", color: "black"}} onClick={e => this.setState({toOpenPopup: false})}>X</Button>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <thead>
                            <tr>
                            <th style={{width: "1%"}}>Select</th>
                                <th>Data Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.itemValue.map((item: any) => (
                                <tr key={item}>
                                    <td style={{width: "1%", textAlign: "center", verticalAlign: "middle"}}>
                                        <input id={this.state.itemId + "_" + count} key={count++} onChange={e => this.saveTestDataModal(e, item)} type="checkbox"/>
                                        </td>
                                    <td style={{width: "5%"}}>
                                        {item}
                                    </td>
                                </tr>
                                )
                                )
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <div style={{position: "relative", right: "25%"}}>
                        <input key={count++} onChange={e => this.saveAsString(e)} id="ifString" type="checkbox"/>
                        <label style={{paddingLeft: "1em"}} htmlFor="ifString">Store as string</label>
                    </div>
                    <button type="button" className="btn btn-default" onClick={e => this.setState({toOpenPopup: false})}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={e => this.handleModalDataSave(e)}>Save changes</button>
                </Modal.Footer>
            </Modal.Dialog>);
        }
    }
}

export default ModalView;