import {
  AppBar,
  createStyles,
  IconButton,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import MenuIcon from '@material-ui/icons/Menu';
import React, { Component } from 'react';

type Props = {
  handleDrawerToggle: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
  classes: any;
};

type State = {};

class Header extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppBar position="fixed" className={this.props.classes.appbar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.props.handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Kartal
          </Typography>
          <div className={this.props.classes.spacer} />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.props.toggleDarkMode}
            edge="start"
            className={this.props.classes.rightIcons}
          >
            {this.props.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = createStyles((theme) => ({
  appbar: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    [theme.breakpoints.up('sm')]: {
      zIndex: theme.zIndex.drawer + 1,
    },
  },
  rightIcons: {
    marginLeft: theme.spacing(0.5),
  },
  spacer: {
    flexGrow: 1,
  },
}));

export default withStyles(styles)(Header);
