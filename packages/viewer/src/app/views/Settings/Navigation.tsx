import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Card, Dropdown, Nav, NavItem, NavLink } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './setting.css';

interface NavigationState {
  activeMenu?: string;
}

class Navigation extends Component<any, NavigationState> {
  constructor(props) {
    super(props);
    this.state = {
      activeMenu: '',
    };
  }

  render() {
    return (
      <Card
        className="flex-column"
        bg={'dark'}
        text={'white'}
        style={{ width: '20%', minWidth: 300, borderRadius: 0 }}
      >
        <Card.Body>
          <Nav variant="pills" defaultActiveKey="/home" className="flex-column">
            <Dropdown
              as={NavItem}
              show={this.state.activeMenu == 'submenu2'}
              onToggle={(nextShow: boolean, meta) => {
                if (meta.source != 'rootClose' && meta.source != 'select') {
                  this.setState({ activeMenu: nextShow ? 'submenu2' : '' });
                }
              }}
            >
              <Dropdown.Toggle as={NavLink} bsPrefix="p-10">
                Kameralar
                <FontAwesomeIcon
                  className="drop-icon"
                  icon={
                    this.state.activeMenu == 'submenu2'
                      ? 'caret-down'
                      : 'caret-right'
                  }
                />
              </Dropdown.Toggle>
              <Dropdown.Menu
                variant="dark"
                style={{ transform: 'initial' }}
                className="sub-menu"
              >
                <Dropdown.Item as={Link} to="/settings/camera-add" className="nav-link">
                  <FontAwesomeIcon icon={'plus'} /> Yeni Ekle
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Card.Body>
      </Card>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
