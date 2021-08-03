import api from 'src/constants/api';

export function searchDirection(start, end) {
  const requestUrl = `${api.mapboxApiUrl}/directions/v5/mapbox/driving/
        ${start.longitude},${start.latitude};
        ${end.longitude},${end.latitude}?geometries=geojson&access_token=${
    api.mapboxAccessToken
  }`;
  return fetch(requestUrl)
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw response.error;
      }
      const result = {
        direction: response.routes[0].geometry.coordinates.map(crd => {
          return {longitude: crd[0], latitude: crd[1]};
        }),
        duration: response.routes[0].duration,
        distance: response.routes[0].distance,
      };
      return result;
    })
    .catch(error => {
      console.error(error);
    });
}
