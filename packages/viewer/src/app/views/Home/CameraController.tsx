import {
  HighlightAlt,
  PanoramaHorizontal,
  Photo,
  PhotoCamera,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';

type Props = {
  camera?: Camera;
  panorama?: any;
  onFocalChange?: (val) => void;
};

type State = {
  focal: { x: number; y: number; scale: number };
  activeTab: number;
};

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index?: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      // id={`simple-tabpanel-${index}`}
      // aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export default class CameraController extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handlePhoto = this.handlePhoto.bind(this);
    this.state = {
      focal: { x: 0.0, y: 0.0, scale: 1.0 },
      activeTab: 0,
    };
  }

  componentDidMount() {
    this.setState({
      focal: this.props.panorama || { x: 0.0, y: 0.0, scale: 1.0 },
    });
  }

  handlePhoto() {}

  render() {
    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={this.state.activeTab}
            onChange={(ev, val) => {
              this.setState({ activeTab: val });
            }}
          >
            <Tab label={<PhotoCamera />} />
            <Tab label={<Visibility />} />
            <Tab label={<HighlightAlt />} />
          </Tabs>
        </Box>
        <TabPanel value={this.state.activeTab} index={0}>
          <IconButton title="Çek" onClick={this.handlePhoto}>
            <Photo />
          </IconButton>

          <ImageList cols={3} rowHeight={164}>
            <ImageListItem>
              <img
                // src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                // alt={item.title}
                loading="lazy"
              />
            </ImageListItem>
            {/* {itemData.map((item) => (
              <ImageListItem key={item.img}>
                <img
                  src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  alt={item.title}
                  loading="lazy"
                />
              </ImageListItem>
            ))} */}
          </ImageList>
        </TabPanel>
        <TabPanel value={this.state.activeTab} index={1}>
          <Typography id="input-slider" gutterBottom>
            Yatay
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.x}
            max={2.0}
            min={-2.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.x = val as number;
              this.setState({ focal });
              if (this.props.onFocalChange) {
                this.props.onFocalChange(focal);
              }
            }}
          />
          <Typography id="input-slider" gutterBottom>
            Dikey
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.y}
            max={2.0}
            min={-2.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.y = val as number;
              this.setState({ focal });
              if (this.props.onFocalChange) {
                this.props.onFocalChange(focal);
              }
            }}
          />
          <Typography id="input-slider" gutterBottom>
            Boyut
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.scale}
            max={2.0}
            min={0.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.scale = val as number;
              this.setState({ focal });
              if (this.props.onFocalChange) {
                this.props.onFocalChange(focal);
              }
            }}
          />
        </TabPanel>
        <TabPanel value={this.state.activeTab} index={2}>
          Item Two
        </TabPanel>
      </>
    );
  }
}
