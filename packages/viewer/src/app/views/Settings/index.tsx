import {
  findIconDefinition,
  IconDefinition,
  IconLookup,
  library,
} from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Model } from 'flexlayout-react';
import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { CameraForm } from './CameraForm';
import data from './flexlayout';
import Navigation from './Navigation';
import './setting.css';

library.add(fas);

const coffeeLookup: IconLookup = { prefix: 'fas', iconName: 'coffee' };
const coffeeIconDefinition: IconDefinition = findIconDefinition(coffeeLookup);
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
              <Route path="/" element={<div>1</div>} />
              <Route path="/camera-add" element={<CameraForm isNew={true}/>} />
            </Routes>
          </Card.Body>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
