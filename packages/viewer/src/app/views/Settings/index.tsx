import React, { Component } from 'react';
import { connect } from 'react-redux';

class Settings extends Component<any, any> {
  render() {
    return <div>settings</div>;
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
