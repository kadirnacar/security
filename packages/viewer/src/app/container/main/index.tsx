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
      <Container>
        <Row style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
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
        <Row
          style={{
            margin: 0,
            marginRight: 0,
            padding: 0,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 56,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
