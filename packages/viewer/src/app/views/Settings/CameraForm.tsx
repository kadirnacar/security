import { connect } from 'react-redux';
import React, { Component } from 'react';
import { ApplicationState } from '../../store';
import { DataActions } from '../../reducers/Data/actions';
import { Camera } from '@security/models';
import { bindActionCreators } from 'redux';
import { DataState } from '../../reducers/Data/state';
import { Button, Form } from 'react-bootstrap';

type Props = {
  DataActions?: DataActions<Camera>;
  isNew?: boolean;
  Data?: DataState;
};

type State = {};

export class CameraForm extends Component<Props, State> {
  render() {
    return (
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state.Data;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraForm);
