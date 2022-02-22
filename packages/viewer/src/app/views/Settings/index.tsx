import {
  Card,
  CardHeader,
  Container,
  createStyles,
  CssBaseline,
  IconButton,
  Typography,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { withRouter } from '../../withRouter';
import Form from './Form';

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

const styles = createStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withStyles(styles)(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings))
);
