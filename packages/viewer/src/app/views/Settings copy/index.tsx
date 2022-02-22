import '@fortawesome/fontawesome-svg-core/styles.css';
import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { withRouter } from '../../withRouter';
import CameraForm from './CameraForm';
import Navigation from './Navigation';
import './setting.css';

interface SettingsState {}
class Settings extends Component<any, SettingsState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <Navigation />
        <Card
          className="flex-column"
          bg={'light'}
          text={'dark'}
          style={{ width: '80%', minWidth: 300, borderRadius: 0 }}
        >
          <Card.Body>
            <Routes>
              <Route path="/" element={<div></div>} />
              <Route path="/camera-add" element={<CameraForm isNew={true} />} />
              <Route path="/camera-edit/:id" element={<CameraForm isNew={false} />} />
            </Routes>
          </Card.Body>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
);
