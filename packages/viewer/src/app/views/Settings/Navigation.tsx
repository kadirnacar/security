import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Card, Dropdown, Nav, NavItem, NavLink } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import './setting.css';

interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}
interface NavigationState {
  activeMenu?: string;
}

class Navigation extends Component<Props, NavigationState> {
  constructor(props) {
    super(props);
    this.state = {
      activeMenu: '',
    };
  }

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
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
                {this.props.Data?.Camera.List.map((camera, index) => {
                  return (
                    <Dropdown.Item
                      key={index}
                      as={Link}
                      to={`/settings/camera-edit/${camera.id}`}
                      className="nav-link"
                    >
                      {camera.name}
                    </Dropdown.Item>
                  );
                })}
                <Dropdown.Item
                  as={Link}
                  to="/settings/camera-add"
                  className="nav-link"
                >
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

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
