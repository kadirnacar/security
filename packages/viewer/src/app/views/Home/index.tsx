import { CameraAlt, Restore, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CssBaseline,
  Divider,
  Grid,
  Paper,
  Theme,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withSize } from 'react-sizeme';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { CamContext } from '../../utils';
import CameraView from './CameraView';
import LayoutItem from './LayoutItem';

interface HomeState {
  layout: any[];
  pos: any;
}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

const Tags = {
  CameraView: CameraView,
};
class Home extends Component<Props, HomeState> {
  constructor(props) {
    super(props);

    this.saveLayout = this.saveLayout.bind(this);
    this.layoutChange = this.layoutChange.bind(this);
    this.removeLayoutItem = this.removeLayoutItem.bind(this);
    this.loadLayout = this.loadLayout.bind(this);
    this.imageDiv = React.createRef<any>();
    this.state = {
      layout: [],
      pos: null,
    };
  }

  imageDiv: React.RefObject<any>;
  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
    await this.props.DataActions?.getItem('Settings');
    this.loadLayout();
  }

  loadLayout() {
    const savedLayout = localStorage.getItem('layout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        if (layout) this.setState({ layout });
      } catch (err) {}
    }
  }

  saveLayout() {
    localStorage.setItem('layout', JSON.stringify(this.state.layout));
  }

  layoutChange(currentLayout) {
    const { layout } = this.state;
    const newLayout: any[] = [];
    currentLayout.forEach((l, i) => {
      let d = layout.find((x) => x.i == l.i);
      if (d) {
        newLayout.push({ ...d, ...l });
      } else {
        newLayout.push(l);
      }
    });
    this.setState({ layout: newLayout });
  }

  removeLayoutItem(i) {
    const { layout } = this.state;
    layout.splice(i, 1);
    this.setState({ layout });
  }

  addCamLayout(cam: Camera) {
    const { layout } = this.state;
    const hasCamItem = !!layout.find((x) => x.i == cam.id);

    if (!hasCamItem) {
      layout.push({
        i: `${cam.id}`,
        x: 0,
        y: 0,
        w: 6,
        h: 6,
        type: 'cam',
      });
      this.setState({ layout });
    }
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Card className={this.props['classes'].root}>
          <CardHeader
            title="Kameralar"
            action={
              <ButtonGroup>
                {this.props.Data?.Camera.List.map((cam, index) => {
                  return (
                    <Button
                      key={index}
                      startIcon={<CameraAlt />}
                      onClick={this.addCamLayout.bind(this, cam)}
                    >
                      {cam.name}
                    </Button>
                  );
                })}
                <Button
                  title="Görünümü Sıfırla"
                  startIcon={<Restore />}
                  onClick={this.loadLayout}
                ></Button>
                <Button
                  title="Görünümü Kaydet"
                  startIcon={<Save />}
                  onClick={this.saveLayout}
                ></Button>
              </ButtonGroup>
            }
          ></CardHeader>
        </Card>
        <CamContext.Provider
          value={{
            camera: this.props.Data?.Camera.List.find((x) => x.isPtz),
            boxes: [],
            camOptions: {},
            render: (state) => {
              this.setState({});
            },
          }}
        >
          <Box sx={{ my: 2 }}>
            <Card>
              <CardHeader title="PTZ" />
              <Divider />
              <CardContent
                style={{ maxHeight: 600, height: 600, position: 'relative' }}
              >
                <CameraView
                  hideControls={true}
                  showPtz={true}
                  activateDetection={true}
                  settings={this.props.Data?.Settings.CurrentItem}
                />
              </CardContent>
            </Card>
          </Box>
          <Grid container spacing={0}>
            {this.props.Data?.Camera.List.filter((x) => !x.isPtz).map(
              (scam, i) => {
                return (
                  <CamContext.Provider
                    key={i}
                    value={{
                      camera: scam,
                      boxes: [],
                      camOptions: {},
                      render: (state) => {
                        this.setState({});
                      },
                    }}
                  >
                    <Grid
                      item
                      xs={Math.floor(
                        12 /
                          (this.props.Data?.Camera.List.filter((x) => !x.isPtz)
                            .length || 1)
                      )}
                      key={0}
                    >
                      <Box sx={{ my: 2 }}>
                        <Card>
                          <CardHeader title={scam.name} />
                          <Divider />
                          <CardContent
                            style={{
                              maxHeight: 600,
                              height: 600,
                              position: 'relative',
                            }}
                          >
                            <CameraView
                              hideControls={true}
                              showPtz={false}
                              activateDetection={true}
                              settings={this.props.Data?.Settings.CurrentItem}
                            />
                          </CardContent>
                        </Card>
                      </Box>
                    </Grid>
                  </CamContext.Provider>
                );
              }
            )}
          </Grid>
        </CamContext.Provider>
        <Paper>
          <LayoutItem
            index={0}
            title={''}
            onRemoveItem={this.removeLayoutItem.bind(this, 2)}
          >
            <div ref={this.imageDiv}></div>
          </LayoutItem>
        </Paper>
      </>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  });

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Home))
);
