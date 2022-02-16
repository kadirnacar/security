import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { NavigateFunction } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataItemState, DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';

type Props = {
  DataActions?: DataActions<Camera>;
  isNew?: boolean;
  Camera?: DataItemState<Camera>;
};

interface State {
  data: Camera;
}

class CameraForm extends Component<Props & WithRouter, State> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.state = { data: { name: '' } };
  }

  async componentDidMount() {
    if (this.props.params && this.props.params['id']) {
      await this.props.DataActions?.getById('Camera', this.props.params['id']);
      this.setState({
        data: this.props.Camera?.CurrentItem || { name: '' },
      });
    } else {
      this.setState({
        data: { name: '' },
      });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      this.props.params &&
      this.props.params['id'] &&
      prevProps.Camera.CurrentItem?.id != this.props.params['id']
    ) {
      await this.props.DataActions?.getById('Camera', this.props.params['id']);
      this.setState({
        data: this.props.Camera?.CurrentItem || { name: '' },
      });
    } else if (this.state.data.id) {
      // this.setState({
      //   data: { name: '' },
      // });
    }
  }

  async save() {
    if (this.state.data.id) {
      await this.props.DataActions?.updateItem('Camera', this.state.data);
    } else {
      await this.props.DataActions?.createItem('Camera', this.state.data);
    }
    await this.props.DataActions?.getList('Camera');
  }
  async delete() {
    if (this.state.data.id) {
      this.props.DataActions?.deleteItem('Camera', this.state.data.id);
      if (this.props.navigate) this.props.navigate('/settings');
    }
  }
  render() {
    return (
      <>
        <Navbar bg="secondary" variant="light">
          <Container>
            <Navbar.Brand href="#home">Kamera Düzeleme</Navbar.Brand>
            <Nav variant="pills">
              <Nav.Link
                as={Button}
                variant="outline-danger"
                onClick={this.delete}
              >
                Sil
              </Nav.Link>
              <Nav.Link as={Button} variant="outline-dark" onClick={this.save}>
                Kaydet
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Adı</Form.Label>
            <Form.Control
              type="text"
              placeholder="Adı"
              value={this.state.data?.name || ''}
              onChange={(ev) => {
                const { data } = this.state;
                data.name = ev.target.value;
                this.setState({ data });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Adress</Form.Label>
            <Form.Control
              type="text"
              value={this.state.data.url || ''}
              placeholder="Url"
              onChange={(ev) => {
                const { data } = this.state;
                data.url = ev.target.value;
                this.setState({ data });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Port</Form.Label>
            <Form.Control
              type="number"
              value={this.state.data.port || ''}
              placeholder="Port"
              onChange={(ev) => {
                const { data } = this.state;
                data.port = ev.target.value as any;
                this.setState({ data });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rtsp Port</Form.Label>
            <Form.Control
              type="number"
              value={this.state.data.rtspPort || ''}
              placeholder="Port"
              onChange={(ev) => {
                const { data } = this.state;
                data.rtspPort = ev.target.value as any;
                this.setState({ data });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Kullanıcı Adı</Form.Label>
            <Form.Control
              type="text"
              value={this.state.data.username || ''}
              placeholder="Kullanıcı Adı"
              onChange={(ev) => {
                const { data } = this.state;
                data.username = ev.target.value;
                this.setState({ data });
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Kullanıcı Şifresi</Form.Label>
            <Form.Control
              type="password"
              value={this.state.data.password || ''}
              placeholder="Şifre"
              onChange={(ev) => {
                const { data } = this.state;
                data.password = ev.target.value;
                this.setState({ data });
              }}
            />
          </Form.Group>
        </Form>
      </>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state.Data;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CameraForm)
);
