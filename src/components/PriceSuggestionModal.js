import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';

import Icon from '../components/Icon';
import Loading from 'src/components/Loading';
import colors from '../constants/colors';
import orderService from 'src/services/order.service';
import {connect} from 'react-redux';
import {getAuth} from 'src/store/reducers/userReducer';
import {useRequestState} from 'src/tools/hooks';

const PriceSuggestionModal = ({auth, orderId, close}) => {
  const sendPriceRequest = useRequestState();
  const [price, setPrice] = useState('');
  const [isSuccessMessageVisible, setSuccessMessageVisible] = useState(false);
  const handlePriceChange = value => {
    setPrice(value);
  };

  const handleSendSuggestion = () => {
    sendPriceRequest.sendRequest(
      () => orderService.suggestPrice(auth, orderId, price),
      () => setSuccessMessageVisible(true),
    );
  };

  return (
    <Modal isVisible={true} style={styles.modal_container}>
      <View style={styles.modal_content}>
        {!isSuccessMessageVisible ? (
          <View style={styles.inner_container}>
            <Icon
              viewBox="0 0 25 25"
              width="25px"
              height="25px"
              name="cost"
              fill={colors.darkColor}
            />
            <TextInput
              style={styles.price_input}
              value={price}
              placeholder="Prix"
              keyboardType={'number-pad'}
              onChangeText={handlePriceChange}
              onSubmitEditing={handleSendSuggestion}
            />
            <Text>DA</Text>
          </View>
        ) : (
          <View style={styles.inner_container}>
            <Text>Votre suggestion a été envoyée au client !</Text>
          </View>
        )}
        <View style={styles.actions_container}>
          {!isSuccessMessageVisible ? (
            <>
              {sendPriceRequest.pending ? (
                <Loading size={25} />
              ) : (
                <>
                  <TouchableOpacity style={styles.button} onPress={close}>
                    <Text>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSendSuggestion(false)}>
                    <Text>Envoyer au client</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={close}>
              <Text>Fermer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal_container: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  modal_content: {
    borderRadius: 5,
    backgroundColor: 'white',
    paddingBottom: 0,
  },
  row_container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  inner_container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  price_input: {
    width: 200,
    marginLeft: 5,
    fontSize: 16,
    textAlignVertical: 'center',
    padding: 10,
    borderWidth: 0.8,
    borderRadius: 5,
    borderColor: colors.grey,
    marginRight: 5,
  },
  actions_container: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
});

const mapStateToProps = state => ({
  auth: getAuth(state.user),
});

export default connect(mapStateToProps)(PriceSuggestionModal);
