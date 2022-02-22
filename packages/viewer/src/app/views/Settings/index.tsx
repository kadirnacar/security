import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../withRouter';

interface SettingsState {}
class Settings extends Component<any, SettingsState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container maxWidth={false}>
        <Card>
          <CardHeader subheader="Update password" title="Password" />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Password"
              margin="normal"
              name="password"
              type="password"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Confirm password"
              margin="normal"
              name="confirm"
              type="password"
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button color="primary" variant="contained">
              Update
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
);
