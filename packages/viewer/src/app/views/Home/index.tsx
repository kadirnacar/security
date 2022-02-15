import { Layout, Model } from 'flexlayout-react';
import React, { Component } from 'react';
import CameraList from './CameraList';
import data from './flexlayout';

interface HomeState {
  model: Model;
}

class Home extends Component<any, HomeState> {
  constructor(props) {
    super(props);
    this.factory = this.factory.bind(this);
    this.state = {
      model: Model.fromJson(data),
    };
  }

  factory(node) {
    const component = node.getComponent();
    switch (component) {
      case 'button':
        return <button>{node.getName()}</button>;
      case 'CameraList':
        return <CameraList />;
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
