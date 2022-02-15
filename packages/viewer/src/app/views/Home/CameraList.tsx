import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { ApplicationState } from '../../store';

interface Props {
  DataActions: DataActions<Camera>;
}

type State = {};

export class CameraList extends Component<Props, State> {
  state = {};
  componentDidMount() {
    console.log('Camera List');
    this.props.DataActions.getList('Camera');
  }
  componentDidUpdate() {
    console.log('Camera List Update');
  }
  render() {
    return <div>CameraList</div>;
  }
}

const mapStateToProps = (state: ApplicationState) => state.Data;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
