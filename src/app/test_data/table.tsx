import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../css/App.css';
import { Table, Spinner } from 'react-bootstrap';
import ModalView from '../modal';
import { setTokenSourceMapRange } from 'typescript';

var server = "localhost";

interface AppState {
    error: string,
    isLoaded: boolean,
    items: any,
    toOpenPopup: boolean,
    itemId: any,
    itemValue: any
}

class TableView extends React.Component<any, AppState, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            error: "",
            isLoaded: false,
            items: "",
            toOpenPopup: false,
            itemId: "",
            itemValue: ""
        };
    }
    componentDidMount() {
        fetch("http://" + server + ":16720/api/testdata/gettestdata")
            .then(res => res.json())
            .then(
            (result) => {
              this.setState({
                error: "",
                isLoaded: true,
                items: result
              });
            },
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
            );
    }
    componentWillReceiveProps (newProps: any) {
        if( newProps !== this.props) {
            this.getSearchData(newProps.dataFromParent);
        }
    }
    getSearchData(searchEntity: string) {
        this.setState({
            isLoaded: false
        });
        fetch("http://" + server + ":16720/api/testdata/searchtestdata?searchEntity=" + searchEntity)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        error: "",
                        isLoaded: true,
                        items: result
                    });
                },
            (error) => {
                this.setState({
                    isLoaded: true,
                    error
                });
            }
        );
    }
    isPresentInLocalStorage(itemKey: string) {
        var storageItems = Object.keys(localStorage);
        for(let i = 0; i < storageItems.length; i ++) {
            if(storageItems[i] === itemKey) {
                return true;
            }
        }
        return false;
    }
    handleChange(event: any, item: any) {
        // if(event.target.checked) {
        //     if(!this.isPresentInLocalStorage(event.target.id)) {
        //         localStorage.setItem(event.target.id, item.dataValue);
        //     } else {
        //         localStorage.removeItem(event.target.id);
        //     }
        // } else {
        //     localStorage.removeItem(event.target.id);
        //     this.setState({
        //         toOpenPopup: false
        //     });
        // }
        this.setState({
                    toOpenPopup: false
                });
        if(event.target.checked === true && item.dataValue.length > 1) {
            this.setState({
                toOpenPopup: true,
                itemId: event.target.id,
                itemValue: item.dataValue
            }, () => {
                ReactDOM.render(<ModalView toOpenPopup={this.state.toOpenPopup} itemId={this.state.itemId} itemValue={this.state.itemValue}/>,
                    document.getElementById("modal") as HTMLElement);
                this.setState({ toOpenPopup: false});
            });
        }
    }
    getPrevCheckboxState(id: string) {
        var storedItemList = Object.keys(localStorage);
        for(let i = 0; i < storedItemList.length; i ++) {
            if(storedItemList[i] === id) {
                return true;
            }
        }
        return false;
    }
    render() {
        const { error, isLoaded, items } = this.state;
        
        if (error !== "") {
            return <div>{error}</div>;
        } else if (!isLoaded) {
            return(
            <div style={{backgroundColor: "#343a40", textAlign: "center"}}>
                <Spinner animation="border" variant="light" />
             </div>);
        } else if(items.length === 0) {
            return (
                <div style={{textAlign: "center", backgroundColor: "#343a40", color: "white"}}>No results found</div>
            );
        } else {
            var count = 0;
            return (
                <Table style={{marginBottom: "0px"}} striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>#</th>
                        <th style={{width: "5%"}}>Select</th>
                        <th>Data Key</th>
                        <th>Data Value</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: any) => (
                        <tr key={item.dataKey}>
                            <td>
                                {count += 1}
                            </td>
                            <td style={{width: "5%", textAlign: "center", verticalAlign: "middle"}}>
                                <input id={item.dataKey} defaultChecked={
                                        this.getPrevCheckboxState(item.dataKey)
                                    } type="checkbox" onChange={e => this.handleChange(e, item) }/>
                            </td>
                            <td>
                                {item.dataKey}
                            </td>
                            <td>
                                {item.dataValue.toString()}
                            </td>
                        </tr>
                        ))
                    }
                </tbody>
                </Table>
            );
        }
    }
}

export default TableView;