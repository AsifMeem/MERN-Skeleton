import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';

//This is root reducer file
export default combineReducers({
  alert,
  auth,
});
