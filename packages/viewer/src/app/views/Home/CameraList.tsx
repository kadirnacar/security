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

export class CameraList extends Component<Props & ApplicationState, State> {
  state = {};
  async componentDidMount() {
    await this.props.DataActions.getList('Camera');
    console.log(this.props.Data.Camera.List);
  }
  componentDidUpdate() {
    console.log('Camera List Update');
  }
  render() {
    return <div>CameraList</div>;
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
