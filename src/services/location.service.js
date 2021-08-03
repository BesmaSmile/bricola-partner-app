import api from 'src/constants/api';
import handleResponse from 'src/helpers/handleResponse';

export default {
  sendLocation,
};

function sendLocation(location, auth, parked) {
  const requestUrl = `${api.bricolaApiUrl}/partner/location`;
  const requestOptions = {
    method: 'POST',
    headers: {
      authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({location, parked}),
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
