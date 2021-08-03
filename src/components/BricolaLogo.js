import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import colors from 'src/constants/colors';
import logo from 'src/assets/images/logo.png';

const BricolaLogo = props => {
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={logo} />
      <Text style={styles.bricola_text}>Bricola DZ Partenaire</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logo: {
    width: 45,
    height: 45,
    margin: 5,
  },
  bricola_text: {
    fontSize: 20,
    marginTop: 10,
    color: colors.blue,
    fontFamily: 'segoe_ui_bold_italic',
    textAlign: 'center',
  },
  dz_text: {
    color: colors.blue,
  },
  icon: {
    marginLeft: 5,
    marginRight: 5,
  },
});

export default BricolaLogo;
