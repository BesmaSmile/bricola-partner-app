import {constants} from './actions';

function orderReducer(state = {}, action) {
  switch (action.type) {
    case constants.LOAD_ORDERS:
      return {
        ...state,
        orders: action.orders,
      };
    case constants.LOAD_PAYMENTS:
      return {
        ...state,
        payments: action.payments,
      };
    case constants.FINISH_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.order._id ? action.order : order,
        ),
      };
    case constants.START_RACE:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.order._id ? action.order : order,
        ),
      };
    case constants.SET_RATING:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.order._id
            ? {...order, rating: action.order.rating}
            : order,
        ),
      };
    default:
      return state;
  }
}

export const getOrders = state => state.orders;
export const getPayments = state => state.payments;

export default orderReducer;
