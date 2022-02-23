import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
} from '@material-ui/core';
import { Delete, Save } from '@material-ui/icons';
import { Camera } from '@security/models';
import React, { Component } from 'react';

interface State {
  camera?: Camera;
}

interface Props {
  camera: Camera;
  onRemove: (item) => void;
  onSave: (item) => void;
}

class Form extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.state = { camera: undefined };
  }

  async componentDidMount() {
    if (this.props.camera) this.setState({ camera: this.props.camera });
  }

  handleChange = (event) => {
    let camera: any = this.state.camera;
    if (!camera) {
      camera = {};
    }
    camera[event.target.name] = event.target.value;
    this.setState({ camera });
  };

  handleCheck = (event) => {
    let camera: any = this.state.camera;
    if (!camera) {
      camera = {};
    }
    camera[event.target.name] = event.target.checked;
    this.setState({ camera });
  };

  render() {
    return (
      <Box sx={{ my: 2 }}>
        <Card>
          <CardHeader
            title={this.state.camera?.name}
            action={
              <>
                <IconButton
                  title="Kaydet"
                  onClick={this.props.onSave.bind(this, this.state.camera)}
                >
                  <Save />
                </IconButton>
                <IconButton
                  title="Sil"
                  onClick={this.props.onRemove.bind(this, this.props.camera)}
                >
                  <Delete />
                </IconButton>
              </>
            }
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Adı"
              margin="normal"
              name="name"
              type="text"
              onChange={this.handleChange}
              value={this.state.camera?.name || ''}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Adres"
              margin="normal"
              value={this.state.camera?.url || ''}
              onChange={this.handleChange}
              name="url"
              type="text"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Port"
              margin="normal"
              value={this.state.camera?.port || ''}
              onChange={this.handleChange}
              name="port"
              type="number"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="RTSP Port"
              margin="normal"
              value={this.state.camera?.rtspPort || ''}
              onChange={this.handleChange}
              name="rtspPort"
              type="number"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              margin="normal"
              value={this.state.camera?.username || ''}
              onChange={this.handleChange}
              name="username"
              type="text"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Şifre"
              margin="normal"
              value={this.state.camera?.password || ''}
              onChange={this.handleChange}
              name="password"
              type="password"
              variant="outlined"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    this.state.camera?.isPtz != undefined
                      ? this.state.camera?.isPtz
                      : false
                  }
                  onChange={this.handleCheck}
                  name="isPtz"
                  color="primary"
                />
              }
              label="PTZ"
            />
          </CardContent>
        </Card>
      </Box>
    );
  }
}

export default Form;
