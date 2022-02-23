import { Grid, IconButton, Paper } from '@material-ui/core';
import {
  ArrowDownwardRounded,
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  CenterFocusStrong,
  ZoomIn,
  ZoomOut,
} from '@material-ui/icons';
import { Camera } from '@security/models';
import React, { Component } from 'react';

type Props = {
  camera: Camera;
};
function FormRow() {
  return (
    <React.Fragment>
      <Grid item xs={4}>
        <Paper>item</Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper>item</Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper>item</Paper>
      </Grid>
    </React.Fragment>
  );
}
class CamSettings extends Component<Props, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div style={{ width: '100%', padding: 20 }}>
        <Grid container spacing={1}>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={2}></Grid>
            <Grid item xs={2} style={{ textAlign: 'center' }}>
              <IconButton style={{ border: '1px solid' }}>
                <ArrowUpward />
              </IconButton>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={3} style={{ textAlign: 'center' }}>
              <IconButton style={{ border: '1px solid' }}>
                <ZoomIn />
              </IconButton>
            </Grid>
            <Grid item xs={3} style={{ textAlign: 'center' }}>
              <IconButton style={{ border: '1px solid' }}>
                <ZoomOut />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={2} style={{ textAlign: 'right' }}>
              <IconButton style={{ border: '1px solid' }}>
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs={2} style={{ textAlign: 'center' }}>
              <IconButton style={{ border: '1px solid' }}>
                <CenterFocusStrong />
              </IconButton>
            </Grid>
            <Grid item xs={2}>
              <IconButton style={{ border: '1px solid' }}>
                <ArrowForward />
              </IconButton>
            </Grid>
            <Grid item xs={6}></Grid>
          </Grid>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={2}></Grid>
            <Grid item xs={2} style={{ textAlign: 'center' }}>
              <IconButton style={{ border: '1px solid' }}>
                <ArrowDownwardRounded />
              </IconButton>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={6} style={{ textAlign: 'center' }}></Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default CamSettings;
