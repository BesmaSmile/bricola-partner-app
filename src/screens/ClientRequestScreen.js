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
import {Bar} from 'react-native-progress';

import Icon from 'src/components/Icon';
import sizes from 'src/constants/sizes';
import colors from 'src/constants/colors';

const ClientRequestScreen = ({content, putResponse}) => {
  const maxDelay = 5; //wait for 5 seconds
  const [accepted, setAccepted] = useState();
  const [delay, setDelay] = useState(0);
  const map = useRef();
  useEffect(() => {
    const interval = setInterval(() => {
      setDelay(delay + 1);
      if (delay === maxDelay) {
        setDelay(0);
      }
    }, 1000);
    if (accepted) {
      clearInterval(interval);
      //clear
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const midPoint =
    content &&
    (content.request.destination
      ? {
          longitude:
            (content.request.destination.coordinate.longitude +
              content.request.position.coordinate.longitude) /
            2,
          latitude:
            (content.request.destination.coordinate.latitude +
              content.request.position.coordinate.latitude) /
            2,
        }
      : content.request.position.coordinate);
  const region = content && {
    ...midPoint,
    latitudeDelta: 0.0565,
    longitudeDelta: 0.0505,
  };

  function handleAccept(e) {
    setAccepted(true);
    putResponse(true);
  }
  function handleReject(e) {
    setAccepted(false);
    putResponse(false);
  }

  return (
    <Modal
      isVisible={content !== undefined && accepted === undefined}
      hasBackdrop={false}
      style={styles.map_modal_container}>
      <Bar
        width={null}
        height={10}
        indeterminate={false}
        style={styles.progress_bar}
        progress={delay / maxDelay}
        color={colors.green}
        borderWidth={0}
      />
      <View style={{flex: 1, backgroundColor: 'yellow'}}>
        {content && (
          <>
            <MapView
              ref={map}
              style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
              }}
              provider={PROVIDER_GOOGLE}
              region={region}>
              <Marker coordinate={content.request.position.coordinate}>
                <Icon
                  viewBox="0 0 32 32"
                  width="45px"
                  height="45px"
                  name="maps"
                  fill={colors.darkColor}
                />
              </Marker>
              {content.request.destination && (
                <Marker coordinate={content.request.destination.coordinate}>
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
                  {content.request.position.name}
                </Text>
              </View>
              {content.request.destination && (
                <View style={styles.details_content}>
                  <Icon
                    viewBox="0 0 25 25"
                    width="25px"
                    height="25px"
                    name="maps"
                    fill={colors.green}
                  />
                  <Text style={styles.position_text_container}>
                    {content.request.destination.name}
                  </Text>
                </View>
              )}
              <Text style={styles.details_content}>details</Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.actions_container}>
        <TouchableOpacity style={styles.button} onPress={handleReject}>
          <Text>Rejeter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAccept}>
          <Text>Accepter</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ClientRequestScreen;
