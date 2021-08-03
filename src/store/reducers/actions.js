export const constants = {
  SIGNIN: 'SIGNIN',
  GET_INFOS: 'GET_INFOS',
  SIGNOUT: 'SIGNOUT',
  TOGGLE_AVAILABILITY: 'TOGGLE_AVAILABILITY',
  LOAD_ORDERS: 'LOAD_ORDERS',
  LOAD_PAYMENTS: 'LOAD_PAYMENTS',
  START_ORDER: 'START_ORDER',
  START_RACE: 'START_RACE',
  FINISH_ORDER: 'FINISH_ORDER',
  SET_RATING: 'SET_RATING',
};

export const actions = {
  signIn,
  getInfos,
  signOut,
  toggleAvailability,
  loadOrders,
  loadPayments,
  startOrder,
  startRace,
  finishOrder,
  setRating,
};

function signIn(auth) {
  return {
    type: constants.SIGNIN,
    auth,
  };
}

function getInfos(user) {
  return {
    type: constants.GET_INFOS,
    user,
  };
}
function signOut() {
  return {
    type: constants.SIGNOUT,
  };
}

function toggleAvailability(available) {
  return {
    type: constants.TOGGLE_AVAILABILITY,
    available,
  };
}

function startOrder() {
  return {
    type: constants.START_ORDER,
  };
}

function loadOrders(orders) {
  return {
    type: constants.LOAD_ORDERS,
    orders,
  };
}

function loadPayments(payments) {
  return {
    type: constants.LOAD_PAYMENTS,
    payments,
  };
}

function startRace(order) {
  return {
    type: constants.START_RACE,
    order,
  };
}

function finishOrder(order) {
  return {
    type: constants.FINISH_ORDER,
    order,
  };
}

function setRating(order) {
  return {
    type: constants.SET_RATING,
    order,
  };
}
