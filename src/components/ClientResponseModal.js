import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal';

import colors from '../constants/colors';

const ClientResponseModal = ({close, response}) => {
  const {message, imageUrl, title} = response;
  return (
    <Modal isVisible={true} hasBackdrop={false} style={styles.response_modal}>
      <View style={styles.modal_container}>
        <View style={styles.modal_content}>
          <Image source={{uri: imageUrl}} style={styles.image} />
          <View style={styles.text_container}>
            <Text style={styles.title}>{title}</Text>
            <Text>{message}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={close}>
          <Text>Ok</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  response_modal: {
    justifyContent: 'flex-start',
  },
  modal_container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modal_content: {
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text_container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  button: {
    backgroundColor: '#fff',
    height: 50,
    borderTopWidth: 1,
    borderColor: colors.disabledColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClientResponseModal;
