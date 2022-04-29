import { CssBaseline, Theme } from '@mui/material';
import { createStyles, WithStyles, withStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import Header from '../../components/Header';
import Home from '../../views/Home';
import Report from '../../views/Report';
import Settings from '../../views/Settings';
import SettingsForm from '../../views/Settings/Form';

const drawerWidth = 240;

const styles = (theme: Theme) =>
  createStyles({
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
  });

interface Props extends WithStyles<typeof styles> {}

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
    return (
      <div className={this.props.classes.root}>
        <CssBaseline />
        <Header
          handleDrawerToggle={this.handleDrawerToggle}
          toggleDarkMode={this.toggleDarkMode}
          darkMode={this.state.darkMode}
        />
        <main
          className={clsx(this.props.classes.content, {
            [this.props.classes.contentShift]: this.state.open,
          })}
        >
          <div className={this.props.classes.drawerHeader} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/camera/:id" element={<SettingsForm />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withStyles<any>(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Main)
);
