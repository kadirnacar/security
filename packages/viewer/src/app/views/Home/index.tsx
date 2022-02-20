import { Camera } from '@security/models';
import {
  Actions,
  DockLocation,
  Layout,
  Model,
  TabNode,
} from 'flexlayout-react';
import React, { Component } from 'react';
import CameraList from './CameraList';
import CameraView from './CameraView';
import data from './flexlayout';
import './home.css';

interface HomeState {
  model: Model;
}

class Home extends Component<any, HomeState> {
  constructor(props) {
    super(props);
    this.factory = this.factory.bind(this);
    this.onSelectCamera = this.onSelectCamera.bind(this);
    this.state = {
      model: Model.fromJson(data),
    };
  }

  onSelectCamera(camera: Camera) {
    const node = this.state.model.getNodeById(camera.id || '');
    if (!node) {
      this.state.model.doAction(
        Actions.addNode(
          {
            id: camera.id,
            type: 'camera',
            name: camera.name,
            component: 'CameraView',
          },
          'cameras',
          DockLocation.RIGHT,
          -1
        )
      );
    } else {
      Actions.selectTab(camera.id || '');
    }
  }

  factory(node: TabNode) {
    const component = node.getComponent();
    console.log(node.getId());
    switch (component) {
      case 'button':
        return <button>{node.getName()}</button>;
      case 'CameraList':
        return <CameraList onSelect={this.onSelectCamera} />;
      case 'CameraView':
        return <CameraView id={node.getId()} />;
      default:
        return <div></div>;
    }
  }
  render() {
    return (
      <Layout
        model={this.state.model}
        onModelChange={(model) => {}}
        factory={this.factory}
      />
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default Home;
