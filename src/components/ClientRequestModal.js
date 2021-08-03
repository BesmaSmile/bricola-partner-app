import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import SoundPlayer from 'react-native-sound-player';
import {Bar} from 'react-native-progress';
import Icon from '../components/Icon';
import sizes from '../constants/sizes';
import colors from '../constants/colors';
import numeral from 'numeral';
import orderService from 'src/services/order.service';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getAuth} from 'src/store/reducers/userReducer';
import {useRequestState} from 'src/tools/hooks';
import Loading from './Loading';

const ClientRequestModal = ({auth, order, putResponse, acceptClientOrder}) => {
  const maxDelay = 15000; //wait for 5 seconds
  const [accepted, setAccepted] = useState();
  const [delay, setDelay] = useState(0);
  const acceptClientRequest = useRequestState();
  const map = useRef();

  useEffect(() => {
    try {
      SoundPlayer.playSoundFile('sound', 'mp3');
    } catch (e) {
      console.log(`cannot play the sound file`, e);
    }
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      if (delay < maxDelay && accepted === undefined) {
        setDelay(delay + 1000);
      }
      if (delay === maxDelay) {
        setDelay(0);
        clearInterval(interval);
        setAccepted(false);
        setTimeout(() => {
          putResponse(false);
        }, 1000);
      }
    }, 1000);
    console.log(accepted);
    if (accepted !== undefined) {
      console.log("clear");
      clearInterval(interval);
      SoundPlayer.stop();
      //clear
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, accepted]);

  const handleAccept = () => {
    setAccepted(true);
    acceptClientRequest.sendRequest(
      () => acceptClientOrder(auth, order._id),
      client => putResponse(true, client),
    );
  };

  const handleReject = () => {
    setAccepted(false);
    setTimeout(() => {
      putResponse(false);
    }, 500);
  };
  const midPoint =
    order &&
    (order.destination
      ? {
          longitude:
            (order.destination.coordinate[0] + order.position.coordinate[0]) /
            2,
          latitude:
            (order.destination.coordinate[1] + order.position.coordinate[1]) /
            2,
        }
      : {
          longitude: order.position.coordinate[0],
          latitude: order.position.coordinate[1],
        });
  const region = order && {
    ...midPoint,
    latitudeDelta: 0.0565,
    longitudeDelta: 0.0505,
  };

  function formatDuration(secondsDuration) {
    const hours = Math.floor(secondsDuration / 3600);
    secondsDuration %= 3600;
    const minutes = Math.floor(secondsDuration / 60);
    return (hours > 0 ? `${hours} h ` : '') + `${minutes} min`;
  }

  let reduction, toPay;
  if (order.cost?.variable) {
    reduction = 0;
    const cost = Object.values(order.cost)
      .filter(price => price)
      .reduce((p1, p2) => p1 + p2, 0);
    if (order.promoCode) {
      if (order.promoCode.unity === 'amount') {
        reduction = Math.min(order.promoCode.reduction, cost);
      } else {
        reduction = Math.round((cost * order.promoCode.reduction) / 100);
      }
    }
    toPay = Math.max(0, cost - (reduction || 0));
  }

  return (
    <Modal
      isVisible={true}
      hasBackdrop={false}
      style={styles.map_modal_container}>
      <Bar
        width={null}
        height={10}
        indeterminate={false}
        style={styles.progress_bar}
        progress={delay / maxDelay}
        color={colors.red}
        borderWidth={0}
      />
      <View style={styles.top_container}>
        <Text>Service : {order.service.name}</Text>
        <Text style={styles.delay_text}>
          {numeral(maxDelay / 1000 - Math.floor(delay / 1000))
            .format('00:00:00')
            .slice(2)}
        </Text>
        <View style={styles.row_container}>
          <View style={[styles.row_inner_container, styles.cost_container]}>
            <Icon
              viewBox="0 0 25 25"
              width="25px"
              height="25px"
              name="cost"
              fill={colors.darkColor}
            />
            <View>
              <Text style={styles.row_inner_text}>
                Prix variable :{' '}
                {order.cost?.variable !== undefined
                  ? order.cost?.variable
                  : '---'}{' '}
                DA
              </Text>
              {order.cost?.deplacement > 0 && (
                <Text style={styles.row_inner_text}>
                  Déplacement/diagnostic : {order.cost?.deplacement} DA
                </Text>
              )}
              {order.cost?.loadingPrice > 0 && (
                <Text style={styles.row_inner_text}>
                  Chargement : {order.cost?.loadingPrice} DA
                </Text>
              )}
              {order.cost?.unloadingPrice > 0 && (
                <Text style={styles.row_inner_text}>
                  Déchargement : {order.cost?.unloadingPrice} DA
                </Text>
              )}
              {order.cost?.assemblyPrice > 0 && (
                <Text style={styles.row_inner_text}>
                  Montage : {order.cost?.assemblyPrice} DA
                </Text>
              )}
              {order.cost?.disassemblyPrice > 0 && (
                <Text style={styles.row_inner_text}>
                  Démontage : {order.cost?.disassemblyPrice} DA
                </Text>
              )}
              {reduction > 0 && (
                <Text style={styles.row_inner_text}>
                  Réduction : {reduction} DA
                </Text>
              )}
              <Text style={[styles.row_inner_text, styles.bold_text]}>
                À payer : {toPay || '---'} DA
              </Text>
            </View>
          </View>
          {order.duration && (
            <View
              style={[styles.row_inner_container, styles.duration_container]}>
              <View>
                <Text style={styles.row_inner_text}>
                  {formatDuration(order.duration)}
                </Text>
              </View>
              <Icon
                viewBox="0 0 25 25"
                width="25px"
                height="25px"
                name="time"
                fill={colors.darkColor}
              />
            </View>
          )}
        </View>
      </View>
      <View style={{flex: 1}}>
        {order && (
          <>
            <MapView
              ref={map}
              style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
              }}
              provider={PROVIDER_GOOGLE}
              region={region}>
              <Marker
                coordinate={{
                  longitude: order.position.coordinate[0],
                  latitude: order.position.coordinate[1],
                }}>
                <Icon
                  viewBox="0 0 32 32"
                  width="45px"
                  height="45px"
                  name="maps"
                  fill={colors.darkColor}
                />
              </Marker>
              {order.destination && (
                <Marker
                  coordinate={{
                    longitude: order.destination.coordinate[0],
                    latitude: order.destination.coordinate[1],
                  }}>
                  <Icon
                    viewBox="0 0 32 32"
                    width="45px"
                    height="45px"
                    name="maps"
                    fill={colors.green}
                  />
                </Marker>
              )}
            </MapView>

            <View style={styles.details_container}>
              <View style={styles.details_content}>
                <View>
                  <Icon
                    viewBox="0 0 25 25"
                    width="25px"
                    height="25px"
                    name="maps"
                    fill={colors.darkColor}
                  />
                </View>
                <Text style={styles.position_text_container}>
                  {order.position.name} {order.position.province}
                </Text>
              </View>
              {order.destination && (
                <View style={styles.details_content}>
                  <Icon
                    viewBox="0 0 25 25"
                    width="25px"
                    height="25px"
                    name="maps"
                    fill={colors.green}
                  />
                  <Text style={styles.position_text_container}>
                    {order.destination.name} {order.destination.province}
                  </Text>
                </View>
              )}
              {order.message?.length > 0 && (
                <Text style={styles.details_content}>{order.message}</Text>
              )}
            </View>
          </>
        )}
      </View>
      <View style={styles.actions_container}>
        {acceptClientRequest.pending ? (
          <Loading size={25} />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.reject_button]}
              onPress={handleReject}>
              <Text style={styles.button_text}>Rejeter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.accept_button]}
              onPress={handleAccept}>
              <Text style={styles.button_text}>Accepter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  map_modal_container: {
    flex: 1,
    margin: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress_bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  top_container: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  delay_container: {
    backgroundColor: '#fff',
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
  delay_text: {
    backgroundColor: '#fff',
    color: colors.red,
    fontWeight: 'bold',
    fontSize: sizes.largeText,
    textAlign: 'center',
  },
  row_container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  row_inner_container: {
    padding: 5,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  cost_container: {
    marginLeft: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
  },
  duration_container: {
    height: 40,
    marginRight: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },

  row_inner_text: {
    flex: 1,
    fontSize: sizes.defaultTextSize,
    marginLeft: 10,
    marginRight: 10,
  },
  bold_text: {
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  details_container: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingLeft: sizes.smallSpace,
    paddingRight: sizes.smallSpace,
  },
  details_content: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.grayColor,
    color: colors.strongGrayColor,
    marginBottom: 5,
    padding: 10,
  },
  position_text_container: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 10,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  actions_container: {
    height: 50,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_text: {
    color: '#fff',
  },
  accept_button: {
    backgroundColor: colors.stronggreen,
  },
  reject_button: {
    backgroundColor: colors.red,
  },
});

const mapStateToProps = state => ({
  auth: getAuth(state.user),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      acceptClientOrder: orderService.acceptClientOrder,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientRequestModal);
