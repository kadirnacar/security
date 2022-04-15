import {
  AutoAwesomeMotion,
  Close,
  Delete,
  FindInPage,
  Photo,
  PhotoCamera,
  Screenshot,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  Slider,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Camera, ICamPosition, IGlRect } from '@security/models';
import React, { Component } from 'react';

type Props = {
  camera?: Camera;
  panorama?: any;
  selectedBoxIndex?: number;
  onFocalChange?: (val) => void;
  onClearImages?: () => void;
  onRemoveImage?: (img, index) => void;
  onRemoveSearch?: (img, index) => void;
  onClickImage?: (item, index) => void;
  onClickFindImage?: (item, index) => void;
  onCheckPhoto?: () => void;
  onGotoPosition?: (pos?: ICamPosition) => void;
  boxes?: IGlRect[];
  searchBoxes?: IGlRect[];
};

type State = {
  focal: ICamPosition;
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
      style={{ position: 'relative', width: '100%', height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{ p: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default class CameraController extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handlePhoto = this.handlePhoto.bind(this);
    this.state = {
      focal: { x: 0.0, y: 0.0, z: 1.0 },
      activeTab: 0,
    };
  }

  componentDidMount() {
    this.setState({
      focal: this.props.panorama || { x: 0.0, y: 0.0, z: 1.0 },
    });
  }

  handlePhoto(item) {
    console.log(item);
  }

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
            <Tab label={<AutoAwesomeMotion />} />
            {/* <Tab label={<HighlightAlt />} /> */}
          </Tabs>
        </Box>
        <TabPanel value={this.state.activeTab} index={0}>
          <IconButton title="Temizle" onClick={this.props.onClearImages}>
            <Delete />
          </IconButton>
          <IconButton title="Çek" onClick={this.props.onCheckPhoto}>
            <Screenshot />
          </IconButton>
          <Box>
            <ImageList cols={3} variant="masonry">
              {this.props.boxes ? (
                this.props.boxes?.map((item, index) => (
                  <ImageListItem
                    key={index}
                    style={{
                      border:
                        this.props.selectedBoxIndex == index + 1
                          ? '1px solid red'
                          : '',
                    }}
                  >
                    <IconButton
                      style={{ position: 'absolute', right: 0 }}
                      onClick={() => {
                        if (this.props.onRemoveImage) {
                          this.props.onRemoveImage(item, index);
                        }
                      }}
                    >
                      <Close />
                    </IconButton>
                    <IconButton
                      style={{ position: 'absolute', right: 25 }}
                      onClick={() => {
                        if (this.props.onClickFindImage) {
                          this.props.onClickFindImage(item, index);
                        }
                      }}
                    >
                      <FindInPage />
                    </IconButton>
                    <img
                      src={item.image?.toDataURL()}
                      // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      // alt={item.title}
                      loading="lazy"
                      onClick={this.props.onClickImage?.bind(this, item, index)}
                    />
                  </ImageListItem>
                ))
              ) : (
                <ImageListItem>
                  <img loading="lazy" />
                </ImageListItem>
              )}
            </ImageList>
          </Box>
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
            value={this.state.focal.z}
            max={2.0}
            min={0.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.z = val as number;
              this.setState({ focal });
              if (this.props.onFocalChange) {
                this.props.onFocalChange(focal);
              }
            }}
          />
        </TabPanel>
        <TabPanel value={this.state.activeTab} index={2}>
          <Box>
            <ImageList cols={2} variant="masonry">
              {this.props.searchBoxes ? (
                this.props.searchBoxes?.map((item, index) => (
                  <ImageListItem
                    key={index}
                    style={{
                      border:
                        this.props.selectedBoxIndex == index + 1
                          ? '1px solid red'
                          : '1px solid gray',
                    }}
                  >
                    <IconButton
                      style={{ position: 'absolute', right: 0 }}
                      onClick={() => {
                        if (this.props.onRemoveSearch) {
                          this.props.onRemoveSearch(item, index);
                        }
                      }}
                    >
                      <Close />
                    </IconButton>
                    <IconButton
                      style={{ position: 'absolute', right: 25 }}
                      onClick={this.props.onGotoPosition?.bind(
                        this,
                        item.camPos ? { ...item.camPos } : undefined
                      )}
                    >
                      <FindInPage />
                    </IconButton>
                    {item.image ? (
                      <img
                        src={item.image?.toDataURL()}
                        // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                        // alt={item.title}
                        loading="lazy"
                        onClick={this.props.onClickImage?.bind(
                          this,
                          item,
                          index
                        )}
                      />
                    ) : (
                      <Photo
                        style={{ minWidth: 120, minHeight: 70 }}
                        onClick={this.props.onClickImage?.bind(
                          this,
                          item,
                          index
                        )}
                      ></Photo>
                    )}
                  </ImageListItem>
                ))
              ) : (
                <ImageListItem>
                  <img loading="lazy" />
                </ImageListItem>
              )}
            </ImageList>
          </Box>
        </TabPanel>
      </>
    );
  }
}
