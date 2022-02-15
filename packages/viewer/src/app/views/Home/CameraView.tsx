import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';

interface Props {
  DataActions?: DataActions<Camera>;
  id?: string;
}

type State = {};

export class CameraView extends Component<Props & ApplicationState, State> {
  state = {};
  async componentDidMount() {
    if (this.props.id) await CameraService.connect(this.props.id);
  }

  render() {
    return (
      <Row>
        <Col xs={12}>{this.props.id}</Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraView);
