import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { ApplicationState } from '../../store';
interface Props {
  DataActions?: DataActions<Camera>;
  onSelect?: (camera: Camera) => void;
}

type State = {};

export class CameraList extends Component<Props & ApplicationState, State> {
  state = {};

  async componentDidMount() {
    // await this.props.DataActions?.getList('Camera');
  }

  render() {
    return (
      <ListGroup>
        {this.props.Data.Camera && this.props.Data.Camera.List
          ? this.props.Data.Camera.List.map((cam, index) => {
              return (
                <ListGroup.Item
                  key={index}
                  style={{
                    background: 'none',
                    color: '#fff',
                    borderBottom: '1px solid',
                  }}
                  action
                  variant="dark"
                  onClick={() => {
                    if (this.props.onSelect) {
                      this.props.onSelect(cam);
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={'camera'}
                    style={{ marginRight: 10 }}
                  />
                  {cam.name}
                </ListGroup.Item>
              );
            })
          : null}
      </ListGroup>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
