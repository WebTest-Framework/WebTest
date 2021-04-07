import * as React from 'react';
import Table from './table';
import Header from './header';
import Footer from './footer';

interface AppState {
    post: {
        name: string
    }
    error: string,
    isLoaded: boolean,
    items: any
}

class App extends React.Component<{}, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            post: {
                name: ""
            },
            error: "",
            isLoaded: false,
            items: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event: any) {
        this.setState({
            post: {
                name: event.target.value
            }
        });
        event.preventDefault();
    }
    handleSubmit(e: any) {
        this.setState(() => ({
            post: { name: this.state.post.name, isCalled: true }
        }));
        e.preventDefault();
    };
    render() {
       return (
        <div>
            <Header handleChange={this.handleChange} post={this.state.post} handleSubmit={this.handleSubmit}/>
            <Table dataFromParent={this.state.post.name}/>
            <Footer/>
        </div>
       );
    }
}

export default App;