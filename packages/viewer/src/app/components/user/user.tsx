import { Users } from '@security/models';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataService } from '../../services/DataService';
import { ApplicationState } from '../../store';

import './user.module.css';

/* eslint-disable-next-line */
export interface UserProps {
  DataActions?: DataActions<Users>;
}

export class UserComp extends Component<UserProps> {
  async componentDidMount() {
    // await DataService.create('User', { name: 'kadir' });
    // await DataService.getList('User');
    this.props.DataActions?.getList('User');
  }
  render() {
    return (
      <div>
        <p>Welcome to User!</p>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  ...state.Data.User,
});

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Users>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserComp);
