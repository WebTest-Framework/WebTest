import * as React from 'react';
import {Alert, Button} from 'react-bootstrap';
import '../css/App.css';

interface AppState {
    toShowSuccess: boolean,
    toShowWarning: boolean,
    toShowError: boolean,
    message: string
}

class SuccessMessage extends React.Component<any, AppState, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            toShowSuccess: props.toShowSuccess,
            toShowError: props.toShowError,
            toShowWarning: props.toShowWarning,
            message: props.message
        };
    }

    render() {
        if (this.state.toShowSuccess) {
            return (<Alert className="alert" variant="success" onClose={() => this.setState({toShowSuccess: false})} dismissible>{this.state.message}</Alert>);
        } if (this.state.toShowError) {
            return (<Alert className="alert" variant="danger" onClose={() => this.setState({toShowError: false})} dismissible>{this.state.message}</Alert>);
        } if (this.state.toShowWarning) {
            return (<Alert className="alert" variant="warning" onClose={() => this.setState({toShowWarning: false})} dismissible>{this.state.message}</Alert>);
        } else {
            return ;
        }
    }
}

export default SuccessMessage;