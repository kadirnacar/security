import {
  createStyles,
  createTheme,
  CssBaseline,
  ThemeProvider,
  withStyles,
} from '@material-ui/core';
import clsx from 'clsx';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Home from '../../views/Home';
import Settings from '../../views/Settings';

const drawerWidth = 240;

type Props = {
  classes?: any;
};

type State = {
  open: boolean;
  darkMode: boolean;
};

class Main extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    this.toggleDarkMode = this.toggleDarkMode.bind(this);
    this.state = {
      darkMode: true,
      open: true,
    };
  }

  handleDrawerToggle = () => {
    this.setState({ open: !this.state.open });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  classes;

  toggleDarkMode = () => {
    this.setState({ darkMode: !this.state.darkMode });
  };

  render() {
    const theme = createTheme({
      palette: {
        type: this.state.darkMode ? 'dark' : 'light',
      },
    });
    return (
      <>
        <ThemeProvider theme={theme}>
          <div className={this.props.classes.root}>
            <CssBaseline />
            <Header
              handleDrawerToggle={this.handleDrawerToggle}
              toggleDarkMode={this.toggleDarkMode}
              darkMode={this.state.darkMode}
            />
            <Sidebar
              handleDrawerClose={this.handleDrawerClose}
              open={this.state.open}
            />
            <main
              className={clsx(this.props.classes.content, {
                [this.props.classes.contentShift]: open,
              })}
            >
              <div className={this.props.classes.drawerHeader} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings/*" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </>
    );
  }
}

const styles = createStyles((theme) => ({
  root: {
    display: 'flex',
  },

  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Main)
);
