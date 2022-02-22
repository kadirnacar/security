import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  Container,
  createStyles,
  CssBaseline,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { CameraAlt, Close, Save, Restore } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { connect } from 'react-redux';
import { withSize } from 'react-sizeme';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import LayoutItem from './LayoutItem';

const defaultLayout = [
  {
    i: 'cam1',
    x: 0,
    y: 0,
    w: 6,
    h: 2,
  },
  {
    i: 'cam2',
    x: 0,
    y: 2,
    w: 12,
    h: 2,
  },
  {
    i: 'cam3',
    x: 6,
    y: 0,
    w: 6,
    h: 2,
  },
];

interface HomeState {
  layout: any[];
}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

class Home extends Component<Props, HomeState> {
  constructor(props) {
    super(props);

    this.saveLayout = this.saveLayout.bind(this);
    this.layoutChange = this.layoutChange.bind(this);
    this.removeLayoutItem = this.removeLayoutItem.bind(this);
    this.loadLayout = this.loadLayout.bind(this);
    this.state = {
      layout: [],
    };
  }

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
    this.loadLayout();
  }

  loadLayout() {
    const savedLayout = localStorage.getItem('layout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        this.setState({ layout });
      } catch (err) {}
    }
  }

  saveLayout() {
    localStorage.setItem('layout', JSON.stringify(this.state.layout));
  }

  layoutChange(layout) {
    this.setState({ layout });
  }

  removeLayoutItem(i) {
    const { layout } = this.state;
    layout.splice(i, 1);
    this.setState({ layout });
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
                    <Button key={index} startIcon={<CameraAlt />}>
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
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          containerPadding={[0, 10]}
          width={this.props['size'].width}
          onLayoutChange={this.layoutChange}
          layouts={{ lg: this.state.layout }}
          draggableHandle={'.dragger'}
          resizeHandles={['se', 'e', 'w']}
        >
          {this.state.layout.map((item, index) => {
            return (
              <Paper key={item.i} data-grid={{ ...item }}>
                <LayoutItem
                  index={index}
                  item={item}
                  title={item.i}
                  onRemoveItem={this.removeLayoutItem.bind(this, index)}
                >
                  dldkkdl
                </LayoutItem>
              </Paper>
            );
          })}
        </ResponsiveGridLayout>
      </>
    );
  }
}

const styles = createStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Home))
);
