import api from 'src/constants/api';
import handleResponse from 'src/helpers/handleResponse';
import {actions} from 'src/store/reducers/actions';

export default {
  loadOrders,
  loadPayments,
  acceptClientOrder,
  suggestPrice,
  startRace,
  finishOrder,
  setRating,
};

function loadOrders(auth) {
  const requestUrl = `${api.bricolaApiUrl}/order/get_own`;
  const requestOptions = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  };
  return dispatch => {
    return fetch(requestUrl, requestOptions)
      .then(handleResponse)
      .then(orders => {
        dispatch(
          actions.loadOrders(
            orders.sort(
              (o1, o2) => new Date(o2.createdAt) - new Date(o1.createdAt),
            ),
          ),
        );
        return orders;
      })
      .catch(error => {
        throw 'Echec de chargement des commandes';
      });
  };
}

function loadPayments(auth) {
  const requestUrl = `${api.bricolaApiUrl}/payment/get_own`;
  const requestOptions = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  };
  return dispatch => {
    return fetch(requestUrl, requestOptions)
      .then(handleResponse)
      .then(payments => {
        dispatch(actions.loadPayments(payments));
        return payments;
      })
      .catch(error => {
        throw 'Echec de chargement des payments';
      });
  };
}

function acceptClientOrder(auth, orderId) {
  const requestUrl = `${api.bricolaApiUrl}/order/accept/${orderId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  return dispatch => {
    return fetch(requestUrl, requestOptions)
      .then(handleResponse)
      .then(client => {
        dispatch(actions.startOrder());
        return client;
      })
      .catch(error => {
        console.log(error);
        throw "Echec d'envoi de votre réponse";
      });
  };
}

function suggestPrice(auth, orderId, price) {
  const requestUrl = `${api.bricolaApiUrl}/order/suggest_price/${orderId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({price}),
  };
  return fetch(requestUrl, requestOptions)
    .then(handleResponse)
    .catch(error => {
      console.log(error);
      throw "Echec d'envoi de la proposition";
    });
}

function finishOrder(auth, orderId) {
  const requestUrl = `${api.bricolaApiUrl}/order/finish/${orderId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  return dispatch => {
    return fetch(requestUrl, requestOptions)
      .then(handleResponse)
      .then(order => dispatch(actions.finishOrder(order)))
      .catch(error => {
        console.log(error);
        throw 'Echec de finalisation de la commande';
      });
  };
}

function startRace(auth, orderId) {
  const requestUrl = `${api.bricolaApiUrl}/order/start_race/${orderId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  return dispatch => {
    return fetch(requestUrl, requestOptions)
      .then(handleResponse)
      .then(order => dispatch(actions.startRace(order)))
      .catch(error => {
        console.log(error);
        throw 'Echec de démarrage de la course';
      });
  };
}

function setRating(order) {
  return dispatch => dispatch(actions.setRating(order));
}
