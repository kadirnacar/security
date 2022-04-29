import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CssBaseline,
  Divider,
  Grid,
  Stack,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera, Capture } from '@security/models';
import moment from 'moment';
import { Component, default as React } from 'react';
import { connect } from 'react-redux';
import { withSize } from 'react-sizeme';
import { AutoSizer, List } from 'react-virtualized';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';

import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

interface ReportState {
  ptzCam?: Camera;
  range: any;
  min?: any;
  max?: any;
}

interface Props {
  DataActions?: DataActions<Capture>;
  Data?: DataState;
  classes: any;
}

export class Report extends Component<Props, ReportState> {
  constructor(props) {
    super(props);

    this.state = {
      range: new Date(),
    };
  }

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera', undefined, true);

    const ptzCam = this.props.Data?.Camera.List.find((x) => x.isPtz);

    if (ptzCam) {
      await this.props.DataActions?.getList('Capture', ptzCam.id);

      this.setState({ ptzCam: ptzCam });
    }
  }

  componentWillUnmount() {}

  render() {
    const imageHeight = 100;
    const ratio = 1920 / 1080;
    return (
      <>
        <CssBaseline />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box sx={{}}>
              <Card>
                <CardHeader subheader="Liste" style={{ height: 40 }} />
                <Divider />
                <CardContent
                  style={{
                    position: 'relative',
                    height: 650,
                  }}
                >
                  {/* <Box>
                    <Stack spacing={3}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateRangePicker
                          startText="Check-in"
                          endText="Check-out"
                          value={[new Date(),new Date()]}
                          onChange={(newValue) => {
                              console.log(newValue)
                          }}
                          renderInput={(startProps, endProps) => (
                            <React.Fragment>
                              <TextField {...startProps} />
                              <Box sx={{ mx: 2 }}> to </Box>
                              <TextField {...endProps} />
                            </React.Fragment>
                          )}
                        />
                      </LocalizationProvider>
               
                    </Stack>
                  </Box> */}
                  <AutoSizer>
                    {({ width, height }) => (
                      <List
                        width={width}
                        height={height}
                        className={this.props.classes.list}
                        rowCount={this.props.Data?.Capture.List.length || 0}
                        rowHeight={imageHeight + 30}
                        style={{ padding: 10, margin: 0 }}
                        rowRenderer={(row) => {
                          const ix =
                            (this.props.Data?.Capture.List.length || 0) - 1;
                          const data =
                            this.props.Data?.Capture.List[ix - row.index];
                          return (
                            <div key={row.key} style={row.style}>
                              <Card
                                sx={{
                                  display: 'flex',
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  style={{
                                    height: imageHeight,
                                    width: imageHeight * ratio,
                                  }}
                                  image={`/api/camera/capture/image/${this.state.ptzCam?.id}/${data?.id}/${imageHeight}`}
                                />
                                <Box sx={{}}>
                                  <CardContent sx={{ flex: '1', padding: 1 }}>
                                    <Typography
                                      component="div"
                                      variant="subtitle2"
                                    >
                                      {moment(data?.date).format(
                                        'HH:mm:ss DD.MM.YYYY'
                                      )}
                                    </Typography>

                                    <Typography
                                      variant="subtitle1"
                                      color="text.secondary"
                                      component="div"
                                    >
                                      {data?.plateResult &&
                                      data?.plateResult.results &&
                                      data?.plateResult.results.length > 0 ? (
                                        data?.plateResult.results.map(
                                          (item, i) => {
                                            return (
                                              <p key={i}>Plaka: {item.plate}</p>
                                            );
                                          }
                                        )
                                      ) : (
                                        <p>Şahıs: Bilinmiyor</p>
                                      )}
                                    </Typography>
                                  </CardContent>
                                </Box>
                                <Box sx={{}}>
                                  <CardContent sx={{ flex: '1', padding: 1 }}>
                                    <Typography
                                      component="div"
                                      variant="subtitle2"
                                    >
                                      X: {data?.pos.x}
                                    </Typography>

                                    <Typography
                                      component="div"
                                      variant="subtitle2"
                                    >
                                      Y: {data?.pos.y}
                                    </Typography>
                                    <Typography
                                      component="div"
                                      variant="subtitle2"
                                    >
                                      Z: {data?.pos.z}
                                    </Typography>
                                  </CardContent>
                                </Box>
                              </Card>
                            </div>
                          );
                        }}
                      />
                      //   <VGrid
                      //     cellRenderer={(cell) => {
                      //       const data =
                      //         this.props.Data?.Capture.List[cell.rowIndex];
                      //       if (cell.columnIndex === 0) {
                      //         return (
                      //           <CardMedia
                      //             component="img"
                      //             style={{
                      //               height: imageHeight,
                      //               width: imageHeight * ratio,
                      //             }}
                      //             image={`/api/camera/capture/image/${this.state.ptzCam?.id}/${data?.id}/${imageHeight}`}
                      //           />
                      //         );
                      //       } else {
                      //         return (
                      //           <div key={cell.key} style={cell.style}>
                      //             {data?.id}
                      //           </div>
                      //         );
                      //       }
                      //     }}
                      //     columnWidth={200}
                      //     columnCount={1}
                      //     height={height + 5}
                      //     rowHeight={imageHeight}
                      //     rowCount={this.props.Data?.Capture.List.length || 0}
                      //     width={width}
                      //   />
                    )}
                  </AutoSizer>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  }
}

const styles = (theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
  });
};
const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Report))
);
