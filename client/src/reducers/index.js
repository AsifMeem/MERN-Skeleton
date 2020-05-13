import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import profile from "./profile";

//This is root reducer file
export default combineReducers({
  alert,
  auth,
  profile,
});
