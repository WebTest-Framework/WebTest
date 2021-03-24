import * as React from 'react';
import '../css/App.css';
import { Table } from 'react-bootstrap';

var server = "localhost";

interface AppState {
    error: string,
    isLoaded: boolean,
    items: any
}

class TableView extends React.Component<any, AppState, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            error: "",
            isLoaded: false,
            items: ""
        };
        console.log("parent: " + this.props.dataFromParent);

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
            console.log("New prop:" + newProps.dataFromParent);
            this.getSearchData(newProps.dataFromParent);
        }
    }
    getSearchData(searchEntity: string) {
        this.setState({
            isLoaded: false
        });
        console.log(searchEntity);
        fetch("http://" + server + ":16720/api/testdata/searchtestdata?searchEntity=" + searchEntity)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
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
        if(event.target.checked) {
            if(!this.isPresentInLocalStorage(event.target.id)) {
                localStorage.setItem(event.target.id, item.dataValue);
            } else {
                localStorage.removeItem(event.target.id);
            }
        } else {
            localStorage.removeItem(event.target.id);
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
        return <div>Loading...</div>;
        } else {
            var count = 0;
            return (
                <Table style={{marginBottom: "0px"}} striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>#</th>
                        <th style={{width: "5%"}}>Select</th>
                        <th>First Name</th>
                        <th>Last Name</th>
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