import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import StarsRating from 'src/components/StarsRating';
import colors from 'src/constants/colors';
import sizes from 'src/constants/sizes';
import Loading from 'src/components/Loading';
import {VictoryPie, VictoryLabel} from 'victory-native';
import {Svg} from 'react-native-svg';
import {useRequestState} from 'src/tools/hooks';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAuth, getUser} from 'src/store/reducers/userReducer';
import {getOrders, getPayments} from 'src/store/reducers/orderReducer';
import orderService from 'src/services/order.service';

const RatingCard = ({title, ratings}) => {
  const total = Object.values(ratings).reduce((n1, n2) => n1 + n2, 0);
  const ratingAverage = total
    ? Math.round(
        (Object.keys(ratings)
          .map(key => parseInt(key, 10) * ratings[key])
          .reduce((r1, r2) => r1 + r2, 0) /
          total) *
          10,
      ) / 10
    : 0;
  return (
    <View style={styles.ratingCardContainer}>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingValue}>{ratingAverage}</Text>
        <StarsRating
          backgroundColor={colors.lightColor}
          rating={ratingAverage}
          size={30}
        />
        <Text style={styles.ratingNumber}>{total}</Text>
      </View>
      <View style={styles.ratingBarContainer}>
        <View>
          {Object.keys(ratings).map(key => (
            <Text key={key} style={styles.ratingLevel}>
              {key}
            </Text>
          ))}
        </View>
        <View style={styles.ratingsContainer}>
          <Text style={styles.serviceName}>{title}</Text>
          {Object.keys(ratings).map(key => (
            <View key={key} style={styles.ratingBar}>
              <View
                style={[
                  styles.greenRatingBar,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {width: total ? `${(ratings[key] * 100) / total}%` : 0},
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const WorkingChart = ({ordersData, total}) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.chartContainer}>
      <Svg width={screenWidth - 40} height={270}>
        {total > 0 && (
          <VictoryPie
            animate={true}
            colorScale="qualitative"
            data={ordersData}
            width={screenWidth - 40}
            height={270}
            innerRadius={60}
            labelRadius={100}
            standalone={false}
            style={{
              labels: {
                fill: colors.stronggrey,
                fontSize: 12,
                padding: 3,
                fontWeight: 'bold',
              },
            }}
          />
        )}
        <VictoryLabel
          textAnchor="middle"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            fontSize: sizes.hugeText,
            fill: colors.stronggrey,
            fontWeight: 'bold',
          }}
          x={(screenWidth - 40) / 2}
          y={135}
          text={total}
        />
      </Svg>
    </View>
  );
};

const StatisticsScreen = props => {
  const {auth, user, orders, payments, loadOrders, loadPayments} = props;
  const ordersRequest = useRequestState();
  const paymentsRequest = useRequestState();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = () => {
    ordersRequest.sendRequest(() => loadOrders(auth));
    paymentsRequest.sendRequest(() => loadPayments(auth));
  };

  const ratingCountOf = (serviceId, rating) => {
    return orders?.filter(
      order => order.service._id === serviceId && order.rating === rating,
    ).length;
  };

  let ordersData = [];

  if (user && orders) {
    ordersData = user?.providedServices.map((providedService, i) => {
      const providedServiceId = providedService.service._id;
      const orderCount = orders?.filter(
        order => order.service._id === providedServiceId,
      ).length;
      const element = {
        serviceId: providedServiceId,
        label: `${providedService.service.name}(${orderCount} - ${Math.round(
          (orderCount * 100) / orders.length,
        )}%)`,
        x: i,
        y: orderCount,
        commission: orders
          ?.filter(order => order.service._id === providedServiceId)
          .map(order => order.commission || 0)
          .reduce((com1, com2) => com1 + com2, 0),
        ratings: {
          '1': ratingCountOf(providedServiceId, 1),
          '2': ratingCountOf(providedServiceId, 2),
          '3': ratingCountOf(providedServiceId, 3),
          '4': ratingCountOf(providedServiceId, 4),
          '5': ratingCountOf(providedServiceId, 5),
        },
      };
      return element;
    });
  }

  const totalCommissions =
    Math.round(
      orders
        ?.map(order => order.commission || 0)
        .reduce((com1, com2) => com1 + com2, 0) * 100,
    ) / 100;
  const totalPaid =
    payments
      ?.map(payment => payment.amount)
      .reduce((amount1, amount2) => amount1 + amount2, 0) ?? 0;

  const restant = totalCommissions - totalPaid;
  return (
    <View style={styles.main}>
      {orders && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Note d'évaluation</Text>
            <View style={styles.divider} />
          </View>
          {user?.providedServices.map((providedService, i) => {
            const ratings = ordersData.find(
              element => element.serviceId === providedService.service._id,
            )?.ratings;
            return (
              <RatingCard
                key={i}
                title={providedService.service.name}
                ratings={ratings}
              />
            );
          })}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Nombre de commandes</Text>
            <View style={styles.divider} />
          </View>
          <WorkingChart ordersData={ordersData} total={orders?.length || 0} />
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Somme à payer</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.sumContainer}>
            {user?.providedServices.map((providedService, i) => {
              const commission = ordersData.find(
                element => element.serviceId === providedService.service._id,
              )?.commission;
              return (
                <View key={i} style={styles.priceContainer}>
                  <Text style={styles.text}>
                    {providedService.service.name}
                  </Text>
                  <Text style={styles.priceText}>
                    {commission?.toFixed(2)} DA
                  </Text>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.priceContainer}>
              <Text style={styles.text}>Total</Text>
              <Text style={styles.priceText}>
                {totalCommissions?.toFixed(2)} DA
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.text}>Montant payé</Text>
              <Text style={[styles.priceText, {color: colors.green}]}>
                {totalPaid?.toFixed(2)} DA
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.text}>Reste à payer</Text>
              <Text style={[styles.priceText, {color: colors.red}]}>
                {restant?.toFixed(2)} DA
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 10,
  },
  ratingCardContainer: {
    borderWidth: 0.5,
    borderColor: colors.grey,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  ratingContainer: {
    flex: 4,
    alignItems: 'center',
    marginRight: 10,
  },
  ratingValue: {
    fontSize: sizes.hugeText,
    fontWeight: 'bold',
    color: colors.stronggrey,
  },
  ratingNumber: {
    fontSize: sizes.smallText,
  },
  ratingsContainer: {
    flex: 1,
  },
  serviceName: {
    borderRadius: 8,
    backgroundColor: colors.statGreenColor,
    paddingVertical: 3,
    color: '#fff',
    textAlign: 'center',
  },
  ratingBarContainer: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ratingLevel: {
    fontSize: 10,
    color: colors.stronggrey,
    marginRight: 5,
    marginTop: 10,
    height: 12,
  },
  ratingBar: {
    marginTop: 10,
    flex: 1,
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.grey,
  },
  greenRatingBar: {
    backgroundColor: colors.statGreenColor,
    borderRadius: 8,
    height: '100%',
  },
  chartContainer: {
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: colors.grey,
    borderWidth: 0.5,
  },
  sumContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.grey,
    borderWidth: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey,
    marginVertical: 5,
  },
  text: {
    marginHorizontal: 10,
    fontSize: sizes.defaultTextSize,
  },
  priceText: {
    fontWeight: 'bold',
    color: colors.stronggrey,
    fontSize: sizes.defaultTextSize,
  },
  titleContainer: {
    marginBottom: 10,
  },
  titleText: {
    color: colors.darkColor,
    fontWeight: 'bold',
    fontSize: sizes.defaultTextSize,
  },
});

const mapStateToProps = state => ({
  auth: getAuth(state.user),
  user: getUser(state.user),
  orders: getOrders(state.order),
  payments: getPayments(state.order),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadOrders: orderService.loadOrders,
      loadPayments: orderService.loadPayments,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatisticsScreen);
