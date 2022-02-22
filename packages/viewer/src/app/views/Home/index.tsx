import {
  AppBar,
  Box,
  Card,
  Container,
  createStyles,
  CssBaseline,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { CameraAlt, Close, Save } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import React, { Component } from 'react';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { withSize } from 'react-sizeme';

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

class Home extends Component<any, HomeState> {
  constructor(props) {
    super(props);

    this.saveLayout = this.saveLayout.bind(this);
    this.layoutChange = this.layoutChange.bind(this);
    this.removeLayoutItem = this.removeLayoutItem.bind(this);
    this.state = {
      layout: defaultLayout,
    };
  }

  componentDidMount() {
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
          <IconButton title="Kamera Aç">
            <CameraAlt />
          </IconButton>
          <IconButton title="Görünümü Kaydet" onClick={this.saveLayout}>
            <Save />
          </IconButton>
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
        >
          {this.state.layout.map((item, index) => {
            return (
              <Paper key={item.i} data-grid={{ ...item }}>
                <AppBar
                  className={'dragger'}
                  color="transparent"
                  style={{ height: 42 }}
                >
                  <Toolbar className={this.props['classes'].toolbar}>
                    <Typography variant="h6" color="textSecondary">
                      {item.i}
                    </Typography>
                    <div className={this.props['classes'].grow} />
                    <IconButton
                      edge="end"
                      title="Kapat"
                      size="small"
                      onClick={this.removeLayoutItem.bind(this, index)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Toolbar>
                </AppBar>
                <Toolbar />
                <Container>
                  <Box sx={{ my: 2 }}>
                    Cras mattis consectetur purus sit amet fermentum. Cras justo
                    odio, dapibus ac facilisis in, egestas eget quam. Morbi leo
                    risus, porta ac consectetur ac, vestibulum at eros. Praesent
                    commodo cursus magna, vel scelerisque nisl consectetur et.
                  </Box>
                </Container>
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
    padding: theme.spacing(1),
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  toolbar: {
    height: 42,
    minHeight: 42,
  },
  grow: {
    flexGrow: 1,
  },
}));

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(Home)
);
