import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';
import SettingsForm from './SettingsForm';

interface SettingsState {}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}
class Settings extends Component<Props & WithRouter, SettingsState> {
  constructor(props) {
    super(props);

    this.onDelete = this.onDelete.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.state = {};
  }

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
  }

  async onSave(item: Camera) {
    await this.props.DataActions?.updateItem('Camera', item);
    await this.props.DataActions?.getList('Camera');
  }

  async onDelete(item: Camera) {
    if (item.id) await this.props.DataActions?.deleteItem('Camera', item.id);
  }

  async onCreate() {
    await this.props.DataActions?.createItem('Camera', {});
    await this.props.DataActions?.getList('Camera');
  }

  render() {
    return (
      <>
        <CssBaseline />
        <SettingsForm />
        <Card className={this.props['classes'].root}>
          <CardHeader
            title="Kameralar"
            action={
              <IconButton
                title="Yeni Kamera Ekle"
                onClick={() => {
                  if (this.props.navigate) this.props.navigate('/camera/new');
                }}
              >
                <Add />
              </IconButton>
            }
          ></CardHeader>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Adı</TableCell>
                    <TableCell align="center">Adres</TableCell>
                    <TableCell align="center">Port</TableCell>
                    <TableCell align="center">RTSP Port</TableCell>
                    <TableCell align="center">PTZ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.Data?.Camera.List.map((row, i) => {
                    return (
                      <TableRow key={i} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="center">{row.url}</TableCell>
                        <TableCell align="center">{row.port}</TableCell>
                        <TableCell align="center">{row.rtspPort}</TableCell>
                        <TableCell align="center">
                          {row.isPtz?.toString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            title="Düzenle"
                            onClick={() => {
                              if (this.props.navigate)
                                this.props.navigate('/camera/' + row.id);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            title="Sil"
                            onClick={this.onDelete.bind(this, row)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        <Container maxWidth={false}></Container>
      </>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  });

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Settings))
);
