import { Delete, Save } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Görüntü Analiz Tipi</InputLabel>
              <Select
                value={this.state.settings?.type || 'client'}
                label="Görüntü Analiz Tipi"
                name="type"
                onChange={this.handleChange}
              >
                <MenuItem value={'client'}>Önyüz</MenuItem>
                <MenuItem value={'server'}>Server</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Analiz Modeli</InputLabel>
              <Select
                value={this.state.settings?.architecture || 'MobileNetV1'}
                label="Analiz Modeli"
                name="architecture"
                onChange={this.handleChange}
              >
                <MenuItem value={'MobileNetV1'}>MobileNetV1</MenuItem>
                <MenuItem value={'ResNet50'}>ResNet50</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Output Stride</InputLabel>
              <Select
                value={this.state.settings?.outputStride || 16}
                label="Output Stride"
                name="outputStride"
                onChange={this.handleChange}
              >
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={16}>16</MenuItem>
                <MenuItem value={32}>32</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Multiplier</InputLabel>
              <Select
                value={this.state.settings?.multiplier || 0.75}
                label="Multiplier"
                name="multiplier"
                onChange={this.handleChange}
              >
                <MenuItem value={0.5}>0.5</MenuItem>
                <MenuItem value={0.75}>0.75</MenuItem>
                <MenuItem value={1}>1</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Quant Bytes</InputLabel>
              <Select
                value={this.state.settings?.quantBytes || 2}
                label="Quant Bytes"
                name="quantBytes"
                onChange={this.handleChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Internal Resolution</InputLabel>
              <Select
                value={this.state.settings?.internalResolution || 'high'}
                label="Internal Resolution"
                name="internalResolution"
                onChange={this.handleChange}
              >
                <MenuItem value={'low'}>Low</MenuItem>
                <MenuItem value={'medium'}>Medium</MenuItem>
                <MenuItem value={'high'}>High</MenuItem>
                <MenuItem value={'Full'}>full</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Segmentation Threshold"
              margin="normal"
              value={this.state.settings?.segmentationThreshold || '0.7'}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0, max: 1, step: 0.1 }}
              name="segmentationThreshold"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Max Detections"
              margin="normal"
              value={this.state.settings?.maxDetections || 5}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 1, step: 1 }}
              name="maxDetections"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Score Threshold"
              margin="normal"
              value={this.state.settings?.scoreThreshold || 0.3}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0, max: 1, step: 0.1 }}
              name="scoreThreshold"
              type="number"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Nms Radius"
              margin="normal"
              value={this.state.settings?.nmsRadius || 20}
              onChange={this.handleChange}
              inputProps={{ inputMode: 'numeric', min: 0, step: 1 }}
              name="nmsRadius"
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
