import { clickReducer } from './clickReducer';
import { Auth } from './Auth';
import { Infos } from './Infos';
import { combineReducers } from 'redux';

export const Reducers = combineReducers({
  AuthReducer: Auth,
  InfoReducer: Infos,
});
