import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import {searchDirection} from 'src/services/map.service';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getOrders} from 'src/store/reducers/orderReducer';
import orderService from 'src/services/order.service';
import ServiceCategoryThemes from 'src/constants/ServiceCategoryThemes';
import Loading from 'src/components/Loading';
import MapMarker from 'src/components/MapMarker';
import Icon from 'src/components/Icon';
import sizes from 'src/constants/sizes';
import colors from 'src/constants/colors';
import workService from 'src/services/work.service';
import {getUser, getAuth} from 'src/store/reducers/userReducer';
import {formatPhone} from 'src/helpers/handlePhoneNumber';
import {useRequestState} from 'src/tools/hooks';

const HomeScreen = ({
  location,
  user,
  auth,
  orders,
  loadOrders,
  toggleAvailability,
}) => {
  const availabilityRequest = useRequestState();

  const currentOrder = orders?.find(
    order =>
      order.status.state === 'accepted' || order.status.state === 'ongoing',
  );

  let theme = {
    iconName: currentOrder?.service.icon,
    color: ServiceCategoryThemes[(currentOrder?.service.category)]?.color,
  };

  const position = currentOrder && {
    longitude: currentOrder?.position.coordinate[0],
    latitude: currentOrder?.position.coordinate[1],
  };
  const destination = currentOrder?.destination && {
    longitude: currentOrder?.destination?.coordinate[0],
    latitude: currentOrder?.destination?.coordinate[1],
  };

  const [directions, setDirections] = useState({
    toPosition: [],
    toDestination: [],
  });
  useEffect(() => {
    loadOrders(auth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (position && location && directions.toPosition.length === 0) {
      searchDirection(location, position).then(result => {
        setDirections({...directions, toPosition: result.direction});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, location]);

  useEffect(() => {
    if (destination && directions.toDestination.length === 0) {
      searchDirection(position, destination).then(result => {
        setDirections({...directions, toDestination: result.direction});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, location]);

  const handleToggleAvailability = () => {
    availabilityRequest.sendRequest(() =>
      toggleAvailability(auth, !user.available),
    );
  };
  if (!user) {
    return <></>;
  }

  return (
    <View style={styles.main_container}>
      <View style={styles.row_container}>
        <Icon
          viewBox="0 0 32 32"
          width="50px"
          height="50px"
          name="avatar"
          fill="#000"
        />

        <View style={styles.infos_container}>
          <Text style={styles.name_text}>
            {user.firstname} {user.lastname}
          </Text>
          <Text style={styles.phone_text}>
            +213 {formatPhone(user.phoneNumber.slice(4))}
          </Text>
          {user.company && (
            <Text style={styles.phone_text}>{user.company.name}</Text>
          )}
          <Text style={styles.phone_text}>{user.province?.name}</Text>
        </View>
        {/* <TouchableOpacity style={styles.edit_button}>
          <Icon
            viewBox="0 0 32 32"
            width="25px"
            height="25px"
            name="pencil"
            fill="#000"
          />
          </TouchableOpacity> */}
      </View>
      <View style={styles.row_container}>
        <Text style={styles.status_text}>{user.busy ? 'Occupé' : 'Libre'}</Text>
        {user.status.state === 'enabled' && !user.isPaymentLate && (
          <>
            <Text style={styles.switch_text}>
              {user.available ? 'Disponible' : 'Non disponible'}
            </Text>
            <View style={styles.switch_container}>
              {availabilityRequest.pending && <Loading size={20} />}
              {!availabilityRequest.pending && (
                <Switch
                  thumbColor="#fff"
                  value={user.available}
                  trackColor={{true: colors.green, false: colors.grayColor}}
                  onValueChange={handleToggleAvailability}
                />
              )}
            </View>
          </>
        )}
        {user.isPaymentLate && (
          <Text style={styles.suspended_account}>Compte suspnedu</Text>
        )}
      </View>
      {!location && <Loading />}
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...location,
            latitudeDelta: 0.0565,
            longitudeDelta: 0.0505,
          }}>
          {!currentOrder && (
            <Marker coordinate={location}>
              <Icon
                viewBox="0 0 32 32"
                width="45px"
                height="45px"
                name="maps"
                fill={colors.red}
              />
            </Marker>
          )}
          {currentOrder?.status.state === 'accepted' && (
            <Polyline
              coordinates={directions.toPosition}
              strokeWidth={5}
              strokeColor="orange"
            />
          )}
          {(currentOrder?.status.state === 'accepted' || currentOrder?.status.state === 'ongoing') && (
            <Polyline
              coordinates={directions.toDestination}
              strokeWidth={5}
              strokeColor={
                currentOrder?.status.state === 'ongoing'
                  ? colors.route
                  : colors.grey
              }
            />
          )}
          {position && (
            <Marker coordinate={position}>
              <Icon
                viewBox="0 0 32 32"
                width="45px"
                height="45px"
                name="maps"
                fill={colors.position}
              />
            </Marker>
          )}
          {destination && (
            <Marker coordinate={destination}>
              <Icon
                viewBox="0 0 32 32"
                width="45px"
                height="45px"
                name="maps"
                fill={colors.destination}
              />
            </Marker>
          )}
          {currentOrder && <MapMarker coordinate={location} theme={theme} />}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
  },
  row_container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.mediumSpace,
  },
  user_picture: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infos_container: {
    flex: 1,
    marginLeft: sizes.mediumSpace,
    marginRight: sizes.mediumSpace,
  },
  name_text: {
    fontWeight: 'bold',
    fontSize: sizes.defaultTextSize,
  },
  phone_text: {
    fontSize: sizes.smallText,
  },
  /* edit_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  }, */
  status_text: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: sizes.defaultTextSize,
  },
  suspended_account: {
    color: colors.red,
  },
  switch_text: {
    fontSize: sizes.smallText,
    marginRight: sizes.smallSpace,
    marginLeft: sizes.smallSpace,
  },
  switch_container: {
    width: 40,
  },
  map: {
    flex: 1,
  },
});

const mapStateToProps = state => ({
  auth: getAuth(state.user),
  user: getUser(state.user),
  orders: getOrders(state.order),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      toggleAvailability: workService.toggleAvailability,
      loadOrders: orderService.loadOrders,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
