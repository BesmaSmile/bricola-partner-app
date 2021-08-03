import {actions} from 'src/store/reducers/actions';
import api from 'src/constants/api';
import handleResponse from 'src/helpers/handleResponse';

export default {
  toggleAvailability,
};

function toggleAvailability(auth, available) {
  const requestUrl = `${api.bricolaApiUrl}/partner/availability`;
  return dispatch => {
    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({available}),
    })
      .then(handleResponse)
      .then(data => {
        dispatch(actions.toggleAvailability(available));
        return data;
      })
      .catch(error => {
        console.log(error);
        throw 'Echec de mise à jour de disponibilité';
      });
  };
}
