import { Add, Save } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Container,
  CssBaseline,
  IconButton,
  Theme,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera, Settings as SettingsModel } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { withRouter } from '../../withRouter';
import Form from './Form';
import SettingsForm from './SettingsForm';

interface SettingsState {}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}
class Settings extends Component<Props, SettingsState> {
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
              <IconButton title="Yeni Kamera Ekle" onClick={this.onCreate}>
                <Add />
              </IconButton>
            }
          ></CardHeader>
        </Card>
        <Container maxWidth={false}>
          <div>
            {this.props.Data?.Camera.List.map((cam, index) => {
              return (
                <Form
                  key={index}
                  camera={cam}
                  onRemove={this.onDelete}
                  onSave={this.onSave}
                />
              );
            })}
          </div>
        </Container>
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
