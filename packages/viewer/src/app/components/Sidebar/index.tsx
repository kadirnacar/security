import {
  createStyles,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
} from '@material-ui/core';
import { Camera, Settings } from '@material-ui/icons';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import React, { Component } from 'react';
import { WithRouter, withRouter } from '../../withRouter';
const drawerWidth = 240;

type Props = {
  open: boolean;
  handleDrawerClose: () => void;
  classes?: any;
};

type State = {};

class Sidebar extends Component<Props & WithRouter, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Drawer
        className={this.props.classes.drawer}
        variant="persistent"
        anchor="left"
        open={this.props.open}
        classes={{
          paper: this.props.classes.drawerPaper,
        }}
      >
        <div className={this.props.classes.drawerHeader}>
          <IconButton onClick={this.props.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <div className="">
          <List>
            <ListItem
              button
              onClick={() => {
                if (this.props.navigate) this.props.navigate('/');
              }}
            >
              <ListItemIcon>
                <Camera />
              </ListItemIcon>
              <ListItemText primary="Ekran" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                if (this.props.navigate) this.props.navigate('/settings');
              }}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Ayarlar" />
            </ListItem>
          </List>
        </div>
      </Drawer>
    );
  }
}

const styles = createStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));

export default withRouter(withStyles(styles)(Sidebar));
