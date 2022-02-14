import { reducer as DataReducer } from '../reducers/Data/reducer';
import { DataState } from '../reducers/Data/state';

export interface ApplicationState {
  Data: DataState;
}

export const reducers = {
  Data: DataReducer,
};

export interface AppThunkAction<TAction> {
  (
    dispatch: (action: TAction) => void,
    getState: () => ApplicationState
  ): Promise<any>;
}

export interface AppThunkActionAsync<TAction, TResult> {
  (
    dispatch: (action: TAction) => void,
    getState: () => ApplicationState
  ): Promise<TResult>;
}
