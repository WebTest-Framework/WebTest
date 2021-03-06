import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../css/App.css';
import { Navbar, Form, FormControl, Dropdown} from 'react-bootstrap';
import AddNewDataModal from './add_new_data';

export function handleAddNewData() {
  ReactDOM.render(<AddNewDataModal toOpenPopup={true}/>,
    document.getElementById("modal") as HTMLElement);
}

export default ({handleChange, post, handleSubmit}: any) => {
    return (
      <Navbar className="justify-content-between navbar-expand-sm bg-dark">
        <a style={{padding: "unset", position: "relative", width: "11em"}} className="nav-link" href="#">
          <img style={{width: "30%"}} alt="DataHub Logo" src="https://images.squarespace-cdn.com/content/v1/57d04a7737c581bb6fd2e8b0/1504045039472-LOBUFZRGK6JPYGAKOMWL/ke17ZwdGBToddI8pDm48kAf-OpKpNsh_OjjU8JOdDKBZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZUJFbgE-7XRK3dMEBRBhUpwkCFOLgzJj4yIx-vIIEbyWWRd0QUGL6lY_wBICnBy59Ye9GKQq6_hlXZJyaybXpCc/Big+Data+Solutions+-+Alliance+Technology+Group"/>
          <span className="title-cls">DataHub</span>
        </a>
        <Form inline style={{width:"70%"}} onSubmit={handleSubmit}>
          <FormControl type="text" placeholder="Search" name="search" value={post.name} onChange={handleChange} style={{width: "inherit", position: "relative", top: "1%"}} className=" mr-sm-1 search-ip" />
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              ...
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onSelect={e => handleAddNewData()}>Add New Data</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form>
      </Navbar>
    );
};