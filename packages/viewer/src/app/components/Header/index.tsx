import { AppBar, IconButton, Theme, Toolbar, Typography } from '@mui/material';
import { withStyles, createStyles } from '@mui/styles';
import { Brightness4, Brightness7, Menu } from '@mui/icons-material';
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
            <Menu />
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
            {this.props.darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles({
    appbar: {
      backgroundColor: theme.palette.background.default + ' !important',
      color: theme.palette.text.primary + ' !important',
      zIndex: theme.zIndex.drawer + 1 + ' !important',
      // [theme.breakpoints.up('sm')]: {
      //   zIndex: theme.zIndex.drawer + 1,
      // },
    },
    rightIcons: {
      marginLeft: theme.spacing(0.5) + ' !important',
    },
    spacer: {
      flexGrow: 1 + ' !important',
    },
  });

export default withStyles<any>(styles)(Header);
