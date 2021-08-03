import {constants} from './actions';

function userReducer(state = {}, action) {
  switch (action.type) {
    case constants.SIGNIN:
      return {
        ...state,
        auth: action.auth,
        signInPending: false,
      };

    case constants.SIGNOUT:
      return {};
    case constants.TOGGLE_AVAILABILITY:
      return {
        ...state,
        user: {
          ...state.user,
          available: action.available,
        },
      };
    case constants.START_ORDER:
      return {
        ...state,
        user: {
          ...state.user,
          busy: true,
        },
      };
    case constants.FINISH_ORDER:
      return {
        ...state,
        user: {
          ...state.user,
          busy: false,
        },
      };
    case constants.GET_INFOS:
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
}

export const getAuth = state => state.auth;
export const getUser = state => state.user;
export default userReducer;
