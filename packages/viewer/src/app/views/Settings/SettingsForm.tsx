import { Save } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  TextField,
} from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';

interface State {
  settings?: Settings;
}

interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

class SettingsForm extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.state = { settings: undefined };
  }

  async componentDidMount() {
    await this.props.DataActions?.getItem('Settings');
    this.setState({ settings: this.props.Data?.Settings.CurrentItem });
  }

  handleChange = (event) => {
    let settings: any = this.state.settings;
    if (!settings) {
      settings = {};
    }
    settings[event.target.name] = event.target.value;
    this.setState({ settings });
  };

  handleCheck = (event) => {
    let settings: any = this.state.settings;
    if (!settings) {
      settings = {};
    }
    settings[event.target.name] = event.target.checked;
    this.setState({ settings });
  };

  async handleSave() {
    const { settings } = this.state;

    if (settings) {
      settings.updateDate = new Date();
      await this.props.DataActions?.updateItem('Settings', settings);
    }

    await this.props.DataActions?.getItem('Settings');
    this.setState({ settings: this.props.Data?.Settings.CurrentItem });
  }

  render() {
    return (
      <Box sx={{ my: 2 }}>
        <Card>
          <CardHeader
            title={'Ayarlar'}
            action={
              <>
                <IconButton title="Kaydet" onClick={this.handleSave}>
                  <Save />
                </IconButton>
              </>
            }
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Max Boxes"
              margin="normal"
              value={this.state.settings?.maxBoxes || '20'}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 1, max: 50, step: 1 }}
              name="maxBoxes"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Score Threshold"
              margin="normal"
              value={this.state.settings?.scoreThreshold || 0.5}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0.1, step: 0.1 }}
              name="scoreThreshold"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Iou Threshold"
              margin="normal"
              value={this.state.settings?.iouThreshold || 0.3}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0, step: 0.1 }}
              name="iouThreshold"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Num Classes"
              margin="normal"
              value={this.state.settings?.numClasses || 80}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0, step: 1 }}
              name="numClasses"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Frame Per Second"
              margin="normal"
              value={this.state.settings?.framePerSecond || 0.5}
              inputProps={{ inputMode: 'numeric', min: 0, step: 0.1 }}
              onChange={this.handleChange}
              name="framePerSecond"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Resim Küçültme Katsayısı"
              margin="normal"
              value={this.state.settings?.imageResizeDivider || 2}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 1, step: 1 }}
              name="imageResizeDivider"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Yakalama Süre Aralığı"
              margin="normal"
              value={this.state.settings?.pursuitTimeout || 3000}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 1000, step: 500 }}
              name="pursuitTimeout"
              type="number"
              variant="outlined"
            />
          </CardContent>
        </Card>
      </Box>
    );
  }
}
const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators(
      { ...new DataActions<Settings>() },
      dispatch
    ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsForm as any);
