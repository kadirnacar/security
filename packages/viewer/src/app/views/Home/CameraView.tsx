import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppCtx, AppContextInterface } from '../../reducers/Base';
import { DataActions } from '../../reducers/Data/actions';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import MinMaxValue from './MinMaxVale';
import SlideValue from './SlideValue';

interface Props {
  DataActions?: DataActions<Camera>;
  id?: string;
}

interface State {
  range: { min: any; max: any; step: any; speed: any };
  velocity?: { x?: any; y?: any; z?: any };
  action?: 'home';
  streamSource?: any;
  isLoaded?: boolean;
}

export class CameraView extends Component<
  Props & ApplicationState,
  State,
  AppContextInterface
> {
  constructor(props) {
    super(props);
    this.startStream = this.startStream.bind(this);
    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.state = {
      range: { min: -1, max: 1, step: 0.1, speed: 0.8 },
      velocity: { x: 0, y: 1, z: 0 },
      action: undefined,
    };
  }

  context: AppContextInterface | undefined;
  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  socket?: WebSocket;

  static contextType = AppCtx;

  async componentDidMount() {
    if (this.props.id) {
      await CameraService.connect(this.props.id);
      this.setState({ isLoaded: true });
    }
  }

  componentWillUnmount() {
    if (this.props.id && this.socket) {
      this.socket.close();
    }
  }
  async startStream() {
    if (this.props.id) {
      this.setState({
        streamSource: `http://${location.host}/api/camera/watch/${this.props.id}`,
      });
      // this.socket = new WebSocket(
      //   `ws://${location.host}/watch?camId=${this.props.id}`
      // );
      // const player = new JSMpeg.Player(`ws://${location.host}/watch?camId=${this.props.id}`, {
      //   canvas: this.canvas.current,
      //   autoplay: true,
      // });
    }
  }
  toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }
  render() {
    const inputGroupStyle = {
      width: 100,
    };
    return (
      <Row>
        <Col xs={12}>
          <Container>
            <Row>
              <Col xs="12">
                <Button
                  onClick={async (ev) => {
                    if (this.props.id) {
                      await CameraService.pos(
                        this.props.id,
                        this.state.velocity,
                        {
                          x: this.state.range.speed,
                          y: this.state.range.speed,
                          z: this.state.range.speed,
                        }
                      );
                    }
                  }}
                >
                  Git
                </Button>
                <Button
                  disabled={!this.state.isLoaded}
                  onClick={this.startStream}
                >
                  Görüntü
                </Button>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <InputGroup>
                        <MinMaxValue
                          range={this.state.range}
                          onChangeValue={(val) => {
                            const { range } = this.state;
                            range[val.type] = val.value;
                            this.setState({ range });
                          }}
                        />
                      </InputGroup>
                    </Form.Label>
                  </Form.Group>
                </Form>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Form>
                  <SlideValue
                    range={this.state.range}
                    type="x"
                    value={this.state.velocity?.x}
                    onChangeValue={(val) => {
                      const { velocity } = this.state;
                      if (velocity) {
                        velocity[val.type] = val.value;
                        this.setState({ velocity });
                      }
                    }}
                  />
                  <SlideValue
                    range={this.state.range}
                    type="y"
                    value={this.state.velocity?.y}
                    onChangeValue={(val) => {
                      const { velocity } = this.state;
                      if (velocity) {
                        velocity[val.type] = val.value;
                        this.setState({ velocity });
                      }
                    }}
                  />
                  <SlideValue
                    range={this.state.range}
                    type="z"
                    value={this.state.velocity?.z}
                    onChangeValue={(val) => {
                      const { velocity } = this.state;
                      if (velocity) {
                        velocity[val.type] = val.value;
                        this.setState({ velocity });
                      }
                    }}
                  />
                </Form>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <video
                  style={{ width: '100%' }}
                  ref={this.video}
                  controls
                  autoPlay
                  muted
                  src={this.state.streamSource}
                ></video>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraView);
