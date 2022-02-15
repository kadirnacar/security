import React, { Component } from 'react';
import { Container, Nav, Navbar, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Route, Routes, Link } from 'react-router-dom';
import Home from '../../views/Home';
import Settings from '../../views/Settings';
import './main.css';

type Props = {};

type State = {};

export class Main extends Component<Props, State> {
  state = {};

  render() {
    return (
      <Container fluid>
        <Row>
          <Navbar bg="dark" variant="dark">
            <Container>
              <Navbar.Brand href="#home">Şahin</Navbar.Brand>
              <Nav className="me-auto">
                <Link className="nav-link" to="/">
                  Monitor
                </Link>
                <Link className="nav-link" to="/settings">
                  Ayarlar
                </Link>
              </Nav>
            </Container>
          </Navbar>
        </Row>
        <Row>
          <div className="routes">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
