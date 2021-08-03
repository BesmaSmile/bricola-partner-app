import {actions} from 'src/store/reducers/actions';
import api from 'src/constants/api';
import handleResponse from 'src/helpers/handleResponse';
import messaging from '@react-native-firebase/messaging';

export default {
  signIn,
  getInfos,
  signOut,
  storeToken,
};

function signIn(phoneNumber, password) {
  const requestUrl = `${api.bricolaApiUrl}/user/login`;
  return dispatch => {
    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phoneNumber, password, role: 'Partner'}),
    })
      .then(handleResponse)
      .then(data => {
        dispatch(actions.signIn(data));
        return data;
      })
      .catch(error => {
        console.log(error);
        let message = '';
        switch (error.field) {
          case 'phoneNumber':
            switch (error.code) {
              case 'invalid_phone_number':
                message = 'Numéro de téléphone invalide';
                break;
              default:
                message = 'Ehec de connexion';
            }
            break;
          default:
            switch (error.code) {
              case 'incorrect_credentials':
                message = 'Numéro de téléphone ou mot de passe incorrecte';
                break;
              case 'disabled_account':
                message = 'Votre compte a été désactivé';
                break;
              default:
                message = 'Ehec de connexion';
            }
        }
        throw message;
      });
  };
}

function getInfos(auth) {
  const requestUrl = `${api.bricolaApiUrl}/user/get_infos`;
  return dispatch => {
    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Bearer ${auth.token}`,
      },
    })
      .then(handleResponse)
      .then(data => {
        dispatch(actions.getInfos(data));
        return data;
      })
      .catch(error => {
        console.log(error);
        if (error.code === 'unauthorized') {
          dispatch(actions.signOut());
        } else {
          throw 'Echec de chargement des données utilisateurs';
        }
      });
  };
}

function signOut() {
  return dispatch => {
    dispatch(actions.signOut());
  };
}

function storeToken(auth) {
  messaging()
    .getToken()
    .then(async fcmToken => {
      if (fcmToken) {
        console.log(fcmToken);
        await _storeToken(auth, fcmToken);
      }
    });

  return messaging().onTokenRefresh(token => {
    _storeToken(auth, token).then(() => console.log('token stored'));
  });
}

function _storeToken(auth, token) {
  const requestUrl = `${api.bricolaApiUrl}/user/token`;
  const requestOptions = {
    method: 'POST',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({token}),
  };
  return fetch(requestUrl, requestOptions)
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log(error);
    });
}
