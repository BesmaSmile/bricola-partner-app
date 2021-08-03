import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import PriceSuggestionModal from 'src/components/PriceSuggestionModal';
import Loading from 'src/components/Loading';
import colors from 'src/constants/colors';
import sizes from 'src/constants/sizes';
import Icon from 'src/components/Icon';
import {format} from 'date-fns';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAuth} from 'src/store/reducers/userReducer';
import {getOrders} from 'src/store/reducers/orderReducer';
import {useRequestState} from 'src/tools/hooks';
import orderService from 'src/services/order.service';
import _ from 'lodash';

const OrderDetailsScreen = props => {
  const {orderId} = props.route.params;
  const order = props.orders.find(ord => ord._id === orderId) ?? {};
  let reduction, toPay;
  if (
    order.status.state === 'finished' ||
    order.status.state === 'not_completed'
  ) {
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
  const [isModalOpen, setModalOpen] = useState(false);
  const orderRequest = useRequestState();
  const closeModal = () => {
    setModalOpen(false);
  };
  const openModal = () => {
    setModalOpen(true);
  };

  const handleFinish = () => {
    orderRequest.sendRequest(() => props.finishOrder(props.auth, order._id));
  };

  const handleStartRace = () => {
    orderRequest.sendRequest(() => props.startRace(props.auth, order._id));
  };
  const orderStatus = {
    finished: 'Terminée',
    pending: 'En attente',
    accepted: 'Acceptée',
    ongoing: 'En cours',
    not_satisfied: 'Non satisfaite',
    canceled: 'Annulée',
    not_completed: 'Non complétée',
  };
  return (
    <View style={styles.main}>
      {isModalOpen && (
        <PriceSuggestionModal orderId={order._id} close={closeModal} />
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.borderedContainer, styles.statusContainer]}>
          <Text style={styles.text}>Statut</Text>
          <Text style={styles.statusText}>
            {orderStatus[order.status.state]}
          </Text>
        </View>
        <View style={[styles.borderedContainer, styles.positionContainer]}>
          <Icon
            viewBox="0 0 25 25"
            width="25px"
            height="25px"
            name="maps"
            fill={colors.position}
          />
          <Text style={styles.text}>{order.position.name}</Text>
        </View>
        {order.destination && (
          <View style={[styles.borderedContainer, styles.positionContainer]}>
            <Icon
              viewBox="0 0 25 25"
              width="25px"
              height="25px"
              name="maps"
              fill={colors.destination}
            />
            <Text style={styles.text}>{order.destination.name}</Text>
          </View>
        )}
        <View style={styles.borderedContainer}>
          <Text style={styles.text}>Commande N° {order.reference}</Text>
          <Text style={styles.text}>
            {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
          </Text>
          <Text style={styles.text}>{_.get(order, 'service.name')}</Text>
          {order.message && <Text style={styles.text}>{order.message}</Text>}
        </View>
        <View style={styles.borderedContainer}>
          <View style={styles.priceContainer}>
            <View style={styles.rowContainer}>
              <Icon
                viewBox="0 0 25 25"
                width="40px"
                height="40px"
                name="cost"
                fill={colors.red}
              />
              <Text style={styles.titleText}>À payer</Text>
            </View>
            <Text style={styles.priceText}>
              {toPay ?? '---'}{' '}
              <Text style={{fontSize: sizes.smallText}}>DA</Text>
            </Text>
          </View>
          <View style={styles.borderedContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.text}>Prix du service</Text>
              <Text style={[styles.text, styles.priceDetail]}>
                {order.cost?.variable ?? '---'}
                <Text style={{fontSize: sizes.smallText}}> DA</Text>
              </Text>
            </View>
            {order.cost?.deplacement && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Déplacement/diagnostic</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {order.cost?.deplacement}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}
            {order.cost?.loadingPrice && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Chargement</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {order.cost?.loadingPrice}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}
            {order.cost?.unloadingPrice && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Déchargement</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {order.cost?.unloadingPrice}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}

            {order.cost?.assemblyPrice && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Montage</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {order.cost?.assemblyPrice}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}

            {order.cost?.disassemblyPrice && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Démontage</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {order.cost?.disassemblyPrice}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}
            {!!reduction && (
              <>
                <View style={styles.divider} />
                <View style={styles.priceContainer}>
                  <Text style={styles.text}>Réduction coupon</Text>
                  <Text style={[styles.text, styles.priceDetail]}>
                    {reduction}
                    <Text style={{fontSize: sizes.smallText}}> DA</Text>
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        {order.promoCode && (
          <View style={styles.borderedContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.text}>Coupon</Text>
              <Text style={[styles.text, styles.priceDetail]}>
                {order.promoCode.reduction}{' '}
                <Text style={{fontSize: sizes.smallText}}>
                  {order.promoCode.unity === 'amount' ? 'DA' : '%'}
                </Text>
              </Text>
            </View>
          </View>
        )}
        <View style={[styles.borderedContainer, styles.commissionContainer]}>
          <View style={styles.rowContainer}>
            <Icon
              viewBox="0 0 25 25"
              width="40px"
              height="40px"
              name="cost"
              fill={colors.blue}
            />
            <Text style={styles.titleText}>Commission</Text>
          </View>
          <Text style={styles.commissionText}>
            {order.commission ?? '---'}{' '}
            <Text style={{fontSize: sizes.smallText}}>DA</Text>
          </Text>
        </View>
        {order.reclamation && (
          <View style={styles.borderedContainer}>
            <Text style={styles.reclamation_title}>Reclamation</Text>
            <Text>
              Créée le{' '}
              {format(
                new Date(order.reclamation.createdAt),
                'dd/MM/yyyy HH:mm',
              )}
            </Text>
            <View style={styles.reclamation_status}>
              <View
                style={[
                  styles.reclamation_point,
                  {
                    backgroundColor:
                      order.reclamation.status === 'pending'
                        ? colors.red
                        : colors.green,
                  },
                ]}
              />
              <Text>
                {order.reclamation.status === 'pending'
                  ? 'Ouverte'
                  : `Clôturée le ${format(
                      new Date(order.reclamation.closedAt),
                      'dd/MM/yyyy HH:mm',
                    )}`}
              </Text>
            </View>
            {order.reclamation.comments.map((comment, i) => (
              <View key={i} style={styles.comment_container}>
                <Text style={styles.comment_date}>
                  {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                </Text>
                <Text style={styles.comment_text}>{comment.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {order.status.state === 'accepted' &&
        order.service.category === 'Transport' && (
          <View style={styles.actions_container}>
            <TouchableOpacity style={styles.button} onPress={handleStartRace}>
              {orderRequest.pending && <Loading size={25} />}
              {!orderRequest.pending && <Text>Commencer la course </Text>}
            </TouchableOpacity>
          </View>
        )}
      {order.status.state === 'accepted' &&
        order.service.category !== 'Transport' &&
        !order.cost?.variable && (
          <View style={styles.actions_container}>
            <TouchableOpacity style={styles.button} onPress={openModal}>
              <Text>Suggérer un prix </Text>
            </TouchableOpacity>
          </View>
        )}
      {order.status.state === 'ongoing' && order.cost?.variable !== undefined && (
        <View style={styles.actions_container}>
          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            {orderRequest.pending && <Loading size={25} />}
            {!orderRequest.pending && <Text>Marquer comme terminée</Text>}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderedContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.grey,
    padding: 10,
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: 'bold',
  },
  positionContainer: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
  },
  priceContainer: {
    borderColor: colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commissionContainer: {
    borderColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    marginHorizontal: 10,
    fontSize: sizes.defaultTextSize,
  },
  titleText: {
    marginLeft: 5,
    color: colors.stronggrey,
  },
  priceText: {
    fontWeight: 'bold',
    color: colors.red,
    fontSize: sizes.mediumText,
    textAlignVertical: 'center',
  },
  commissionText: {
    fontWeight: 'bold',
    color: colors.blue,
    fontSize: sizes.mediumText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey,
    marginVertical: 5,
  },
  priceDetail: {
    fontWeight: 'bold',
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
  reclamation_status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reclamation_title: {
    fontSize: sizes.mediumText,
  },
  reclamation_point: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  comment_container: {
    marginVertical: 5,
  },
  comment_text: {
    borderColor: colors.grey,
    borderWidth: 1,
    backgroundColor: '#5af2fa10',
    borderRadius: 5,
    padding: 5,
  },
  comment_date: {
    color: colors.stronggrey,
  },
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      finishOrder: orderService.finishOrder,
      startRace: orderService.startRace,
    },
    dispatch,
  );

const mapStateToProps = state => ({
  auth: getAuth(state.user),
  orders: getOrders(state.order),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrderDetailsScreen);
