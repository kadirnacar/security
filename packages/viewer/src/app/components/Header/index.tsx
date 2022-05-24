import {
  AppBar,
  Box,
  Button,
  CardMedia,
  IconButton,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import { withStyles, createStyles } from '@mui/styles';
import { Brightness4, Brightness7, Menu } from '@mui/icons-material';
import React, { Component } from 'react';
import { WithRouter, withRouter } from '../../withRouter';

type Props = {
  handleDrawerToggle: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
  classes: any;
};

type State = {};

class Header extends Component<Props & WithRouter, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppBar position="fixed" className={this.props.classes.appbar}>
        <Toolbar>
          {/* <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.props.handleDrawerToggle}
            edge="start"
          >
            <Menu />
          </IconButton> */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <CardMedia
              component="img"
              height="65"
              image="/assets/logo.png"
              alt="green iguana"
              onClick={(ev) => {
                if (this.props.navigate && ev.shiftKey) this.props.navigate('/settings')
              }}
            />
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => {
                if (this.props.navigate) this.props.navigate('/');
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Takip
            </Button>
            <Button
              onClick={() => {
                if (this.props.navigate) this.props.navigate('/report');
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Olay Geçmişi
            </Button>
            {/* <Button
              onClick={() => {
                if (this.props.navigate) this.props.navigate('/settings');
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Ayarlar
            </Button> */}
          </Box>
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

export default withStyles<any>(styles)(withRouter(Header));
