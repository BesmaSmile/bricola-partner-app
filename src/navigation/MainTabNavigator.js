import React, {useEffect, useState} from 'react';

import {
  Alert,
  ToastAndroid,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Geolocation from 'react-native-geolocation-service';
import {EventRegister} from 'react-native-event-listeners';
import messaging from '@react-native-firebase/messaging';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import ClientResponseModal from 'src/components/ClientResponseModal';
import Icon from 'src/components/Icon';
import HomeScreen from 'src/screens/HomeScreen';
import HistoryScreen from 'src/screens/HistoryScreen';
import StatisticsScreen from 'src/screens/StatisticsScreen';
import TabBarIcon from 'src/components/TabBarIcon';
import colors from 'src/constants/colors';
import locationService from 'src/services/location.service';
import orderService from 'src/services/order.service';
import {getAuth, getUser} from 'src/store/reducers/userReducer';
import userService from 'src/services/user.service';
import NotificationService from '../services/notification.service';
import ClientRequestModal from 'src/components/ClientRequestModal';
import {useRequestState} from 'src/tools/hooks';
import {formatPhone} from 'src/helpers/handlePhoneNumber';

const Tab = createMaterialBottomTabNavigator();

function MainTabNavigator({auth, available, loadOrders, getInfos}) {
  const [newRequest, setNewRequest] = useState();
  const [location, setLocation] = useState();
  const [clientDetailsModal, setClientDetailsModal] = useState({open: false});
  const [clientResponseModal, setClientResponseModal] = useState({open: false});
  const ordersRequest = useRequestState();

  const onNotif = notif => {
    Alert.alert(notif.title, notif.message);
  };

  const notif = new NotificationService(() => {}, onNotif);

  async function hasLocationPermission() {
    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  }

  async function getCurrentLocation() {
    const permission = await hasLocationPermission();
    if (permission) {
      Geolocation.getCurrentPosition(
        position => {
          let coordinate = {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
            latitudeDelta: 0.0165,
            longitudeDelta: 0.0105,
          };
          setLocation(coordinate);
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 50,
          forceRequestLocation: true,
        },
      );
    }
  }

  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (available) {
      BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        distanceFilter: 50,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        debug: false,
        startOnBoot: false,
        stopOnTerminate: true,
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        interval: 10 * 1000, //10 s
        fastestInterval: 5 * 1000, //5 s
        activitiesInterval: 5 * 1000, //5s
        url: '',
        httpHeaders: {
          'X-FOO': 'bar',
        },
        // customize post properties
        postTemplate: {
          lat: '@latitude',
          lon: '@longitude',
          foo: 'bar', // you can also add your own properties
        },
      });
      BackgroundGeolocation.on('location', newLocation => {
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        setLocation(newLocation);
        BackgroundGeolocation.startTask(taskKey => {
          locationService
            .sendLocation(newLocation, auth, false)
            .then(response => {
              ToastAndroid.show(
                'location sent :' +
                  newLocation.longitude +
                  ',' +
                  newLocation.latitude,
                ToastAndroid.SHORT,
              );
            });

          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          BackgroundGeolocation.endTask(taskKey);
        });
      });

      BackgroundGeolocation.on('stationary', stationaryLocation => {
        setLocation(stationaryLocation);
        locationService
          .sendLocation(stationaryLocation, auth, true)
          .then(response => {
            ToastAndroid.show(
              'location sent :' +
                stationaryLocation.longitude +
                ',' +
                stationaryLocation.latitude,
              ToastAndroid.SHORT,
            );
          });

        // handle stationary locations here
        //Actions.sendLocation(stationaryLocation);
      });

      BackgroundGeolocation.on('error', error => {
        console.log('[ERROR] BackgroundGeolocation error:', error);
      });

      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
      });

      BackgroundGeolocation.on('stop', () => {
        console.log('[INFO] BackgroundGeolocation service has been stopped');
      });

      BackgroundGeolocation.on('authorization', status => {
        console.log(
          '[INFO] BackgroundGeolocation authorization status: ' + status,
        );
        if (status !== BackgroundGeolocation.AUTHORIZED) {
          // we need to set delay or otherwise alert may not be shown
          setTimeout(
            () =>
              Alert.alert(
                'App requires location tracking permission',
                'Would you like to open app settings?',
                [
                  {
                    text: 'Yes',
                    onPress: () => BackgroundGeolocation.showAppSettings(),
                  },
                  {
                    text: 'No',
                    onPress: () => console.log('No Pressed'),
                    style: 'cancel',
                  },
                ],
              ),
            1000,
          );
        }
      });

      BackgroundGeolocation.on('background', () => {
        console.log('[INFO] App is in background');
      });

      BackgroundGeolocation.on('foreground', () => {
        console.log('[INFO] App is in foreground');
      });

      BackgroundGeolocation.on('abort_requested', () => {
        console.log('[INFO] Server responded with 285 Updates Not Required');

        // Here we can decide whether we want stop the updates or not.
        // If you've configured the server to return 285, then it means the server does not require further update.
        // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
        // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
      });

      BackgroundGeolocation.on('http_authorization', () => {
        console.log('[INFO] App needs to authorize the http requests');
      });

      BackgroundGeolocation.checkStatus(status => {
        console.log(
          '[INFO] BackgroundGeolocation service is running',
          status.isRunning,
        );
        console.log(
          '[INFO] BackgroundGeolocation services enabled',
          status.locationServicesEnabled,
        );
        console.log(
          '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
        );

        // you don't need to check status before start (this is just the example)
        if (!status.isRunning) {
          BackgroundGeolocation.start(); //triggers start on start event
        }
      });

      // you can also just start without checking for status
      // BackgroundGeolocation.start();

      return () => BackgroundGeolocation.removeAllListeners();
    }
  }, [auth, available]);

  useEffect(() => {
    if (auth) {
      const unsubscribe = userService.storeToken(auth);
      return unsubscribe;
    }
  }, [auth]);

  useEffect(() => {
    requestNotifPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const requestNotifPermissions = async () => {
    await hasLocationPermission();
    await notif.requestPermissions();
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      const content = JSON.parse(remoteMessage.data.content);
      if (
        ['client_reclamation', 'client_rating', 'canceled_order'].some(
          type => type === remoteMessage.data.type,
        )
      ) {
        ordersRequest.sendRequest(() => loadOrders(auth));
        getInfos(auth);
        const notification = remoteMessage.notification;
        notif.localNotif({
          title: notification.title,
          message: notification.body,
          largeIconUrl: notification.android.imageUrl,
        });
        return;
      }
      switch (remoteMessage.data.type) {
        case 'client_request':
          setNewRequest(content);
          break;
        case 'client_price_acceptance':
          setClientResponseModal({
            open: true,
            content,
          });
          ordersRequest.sendRequest(() => loadOrders(auth));
          getInfos(auth);
          break;
      }
    });
    return unsubscribe;
  });

  useEffect(() => {
    EventRegister.on('client_request', request => {
      setNewRequest(request);
      //setMapModalVisible(true)
    });

    EventRegister.on('client_price_acceptance', content => {
      setClientResponseModal({
        open: true,
        content,
      });
    });

    return () => {
      EventRegister.rmAll();
    };
  }, []);

  function putResponse(accepted, client) {
    setNewRequest({
      ...newRequest,
      accepted,
    });
    if (accepted) {
      setClientDetailsModal({
        open: true,
        client,
      });
    }
  }

  useEffect(() => {
    if (newRequest?.accepted) {
      ordersRequest.sendRequest(() => loadOrders(auth));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRequest?.accepted]);

  const closeClientResponseModal = () => {
    setClientResponseModal({
      open: false,
    });
  };

  const handleCallClick = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <>
      {clientResponseModal.open && (
        <ClientResponseModal
          response={clientResponseModal.content}
          close={closeClientResponseModal}
        />
      )}
      {newRequest && newRequest.accepted === undefined && (
        <ClientRequestModal order={newRequest} putResponse={putResponse} />
      )}
      {clientDetailsModal.open && (
        <Modal
          isVisible={clientDetailsModal.open}
          style={styles.modal_container}>
          <View style={styles.modal_content}>
            <Text>Veuillez contacter le client que vous venez d'accepter</Text>
            <View style={styles.details_container}>
              <View style={styles.row_container}>
                <Icon
                  style={styles.icon}
                  viewBox="0 0 32 32"
                  width="25px"
                  height="25px"
                  name="client"
                  fill={colors.darkColor}
                />
                <Text style={styles.detail_text}>
                  {clientDetailsModal.client.firstname}
                </Text>
              </View>
              <View style={styles.row_container}>
                <Icon
                  style={styles.icon}
                  viewBox="0 0 32 32"
                  width="25px"
                  height="25px"
                  name="phone"
                  fill={colors.darkColor}
                />
                <Text style={styles.detail_text_bordered}>
                  +213{' '}
                  {formatPhone(clientDetailsModal.client.phoneNumber.slice(4))}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleCallClick(clientDetailsModal.client.phoneNumber)
                  }>
                  <Icon
                    style={styles.icon}
                    viewBox="0 0 32 32"
                    width="35px"
                    height="35px"
                    name="call"
                    fill={colors.green}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setClientDetailsModal({open: false})}>
            <Text>Ok</Text>
          </TouchableOpacity>
        </Modal>
      )}
      <Tab.Navigator
        barStyle={styles.bar}
        activeColor={colors.darkColor}
        inactiveColor={colors.disabledColor}>
        <Tab.Screen
          name="Home"
          options={{
            tabBarLabel: 'Accueil',
            tabBarIcon: ({color}) => <TabBarIcon name="home" color={color} />,
          }}>
          {() => <HomeScreen location={location} />}
        </Tab.Screen>
        <Tab.Screen
          name="History"
          options={{
            tabBarLabel: 'Historique',
            tabBarIcon: ({color}) => <TabBarIcon name="clock" color={color} />,
          }}
          component={HistoryScreen}
        />
        <Tab.Screen
          name="Statistics"
          options={{
            tabBarLabel: 'Statistique',
            tabBarIcon: ({color}) => <TabBarIcon name="graph" color={color} />,
          }}
          component={StatisticsScreen}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#eee',
  },
  modal_container: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modal_content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row_container: {
    flexDirection: 'row',
    padding: 5,
    alignItems: 'center',
  },
  details_container: {
    width: '100%',
  },
  icon: {
    margin: 10,
  },
  detail_text_bordered: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.disabledColor,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    marginVertical: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  detail_text: {
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#fff',
    height: 50,
    borderWidth: 1,
    borderColor: colors.disabledColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = state => ({
  available: getUser(state.user)?.available,
  auth: getAuth(state.user),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadOrders: orderService.loadOrders,
      setRating: orderService.setRating,
      getInfos: userService.getInfos,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainTabNavigator);
