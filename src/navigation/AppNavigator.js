import React from 'react';

import 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import {connect} from 'react-redux';
import {getAuth} from 'src/store/reducers/userReducer';

import SignInScreen from 'src/screens/SignInScreen';
import AppStackNavigator from './AppStackNavigator';

const Stack = createStackNavigator();

function AppNavigator({auth}) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {auth ? (
          <Stack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const mapStateToProps = state => ({
  auth: getAuth(state.user),
});

export default connect(mapStateToProps)(AppNavigator);
