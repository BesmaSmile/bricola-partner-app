import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import MainTabNavigator from './MainTabNavigator';
import colors from 'src/constants/colors';
import BricolaLogo from 'src/components/BricolaLogo';
import Loading from 'src/components/Loading';
import OrderDetailsScreen from 'src/screens/OrderDetailsScreen';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAuth, getUser} from '../store/reducers/userReducer';
import userService from 'src/services/user.service';
import {useRequestState} from 'src/tools/hooks';

const Stack = createStackNavigator();

const AppStackNavigator = ({auth, user, getInfos, signOut}) => {
  const userRequest = useRequestState();

  useEffect(() => {
    if (auth) {
      userRequest.sendRequest(() => getInfos(auth));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    if (user?.status?.state === 'disabled') {
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {userRequest.pending && <Loading />}
      {user && !userRequest.pending && (
        <Stack.Navigator>
          <Stack.Screen
            name="App"
            options={{
              headerShown: true,
              headerTitle: props => <BricolaLogo />,
              headerStyle: {
                height: 60,
                borderBottomWidth: 7,
                borderBottomColor:
                  user.status.state === 'suspended'
                    ? colors.red
                    : user.available
                    ? colors.green
                    : colors.grayColor,
              },
            }}
            component={MainTabNavigator}
          />
          <Stack.Screen
            options={{
              headerTitle: props => <Text>Commande</Text>,
            }}
            name="OrderDetails"
            component={OrderDetailsScreen}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  auth: getAuth(state.user),
  user: getUser(state.user),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getInfos: userService.getInfos,
      signOut: userService.signOut,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppStackNavigator);
