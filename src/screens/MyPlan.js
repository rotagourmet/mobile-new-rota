// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import moment from 'moment/min/moment-with-locales'
// REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import def_styles from '../assets/styles/theme.styles'
import Pageheader from '../components/Pageheader';
import Theme from '../constants/Theme';
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const api_key = 'ak_live_oxDVAhSHumPJ9gTKlT7R9R227eUD32'; //API_KEY
moment.locale('pt-BR');

class MyPlan extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            arrowSize: 15,
            loading: false
        }
    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    componentDidMount(){
        this._isMounted = true;
        console.log('subscription', this.props.subscription);
        if (this._isMounted) {
            if (this.props.subscription) {
                // this.returnSubscription();
            }else{
                this.setState({
                    cardBrand: null,
                    cardNumber: null,
                    card: null
                })
            }
        }

    }

    async returnSubscription(){
        //Requisição de retornar dados da assinatura
        let response = await fetch(`https://api.pagar.me/1/subscriptions/${this.props.userData.subscription.id}?api_key=${api_key}`);
        response = await response.json();

        this.props.storageCurrentSubscription(response)
    }

    dateFormat(date){
        let dia = moment(date).format("DD")
        let mes = moment(date).format("MMMM")
        let ano = moment(date).format("YYYY")
        let total = dia + " de " + mes + " de " + ano
        return total;
    }

    picture(){
        let pic = this.state.cardBrand == 'elo' ? require('../assets/cards/elo.png') :
        this.state.cardBrand == 'mastercard' ? require('../assets/cards/mastercard.png') :
        this.state.cardBrand == 'visa' ? require('../assets/cards/visa.png') :
        this.state.cardBrand == 'americanexpress' ? require('../assets/cards/american.png') :
        this.state.cardBrand == 'dinners' ? require('../assets/cards/dinners.png') :
        this.state.cardBrand == 'discover' ? require('../assets/cards/discover.png') : require('../assets/cards/aura.png');
        return pic
    }

    value(value){
        value = `${value}`
        if(value.length == 3){
            value = value[0] + ',' + value[1] + value[2]
        }else if (value.length == 4) {
            value = value[0] + value[1] + ',' + value[2] + value[3]
        }
        return value
    }

    render(){
        let { navigation, subscription } = this.props;
        return(
            <View style={[styles.flex1, styles.bgColorWhite,]}>
                <Pageheader title={"MEU PLANO"} navigation={navigation} statusBarColor={'transparent'}/>
                <View style={[def_styles.p_h_15, styles.flexMiddle]} >
                    <View style={[def_styles.m_t_20, styles.itemClickable]}>
                        <View style={styles.secondTitle}>
                            <Text style={styles.itemClickableLabel}>Plano Atual</Text>
                            <Image
                                style={styles.correctImage}
                                source={require('../assets/perfil/correct.png')}
                            />
                        </View>
                        {this.state.loading ? 
                            <View style={[def_styles.p_t_15, def_styles.p_b_15]}> 
                                <ActivityIndicator />
                            </View>
                        :
                            <View>
                                <Text style={[styles.description, def_styles.p_t_15]}>Nome: <Text style={def_styles.weight_fat}>{subscription.planTitle}</Text></Text>
                                <Text style={styles.description}>Valor: <Text style={def_styles.weight_fat}>R$ {this.value(subscription.planPrice)}</Text></Text>
                                <Text style={styles.description}>Data Inicial: <Text style={def_styles.weight_fat}>{this.dateFormat(subscription.createdAt)}</Text></Text>
                            </View>
                        }
                    </View>
                    {subscription && subscription.method !== 'boleto' ? 
                        <View style={[def_styles.m_t_20, styles.itemClickable]} >
                            <View style={styles.secondTitle}>
                                <Text style={styles.itemClickableLabel}>Cartão</Text>
                                {/* <Text style={styles.itemClickableLabel2}>Alterar</Text> */}
                                <Image
                                    style={styles.correctImage}
                                    source={require('../assets/perfil/correct.png')}
                                />
                            </View>
                            {this.state.loading ? 
                                <View style={[def_styles.p_t_15, def_styles.p_b_15]}> 
                                    <ActivityIndicator />
                                </View>
                            :
                                <View>

                                    {subscription.nextRecurrency ? <Text style={[styles.description, def_styles.p_t_15]}>Sua próxima cobrança é dia <Text style={def_styles.weight_fat}>{subscription.nextRecurrency}</Text></Text>: null}
                                    <Text style={styles.creditCardNum}>{subscription.cardHolderName}</Text>
                                    <View style={styles.creditCardContent}>
                                        <Image
                                            style={styles.correctImage}
                                            source={require('../assets/perfil/cardY.png')}
                                        />
                                        <Text style={styles.creditCardNum}>{subscription.cardFirstDigits[0] + subscription.cardFirstDigits[1] + subscription.cardFirstDigits[2] + subscription.cardFirstDigits[3]} •••• •••• •••• </Text>
                                    </View>
                                </View>
                            }
                        </View>
                    : null }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    creditCardNum: {
        paddingLeft: 10, 
        fontWeight: WEIGHT.THIN, 
        fontSize: FONT.SMALL, 
    },
    creditCardContent: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 10, 
        paddingLeft: 10, 
    },
    correctImage: {
        height: 20,
        width: 20
    },
    creditCardImage: {
        height: 30,
        width: 30
    },
    secondTitle: {
        flexDirection: 'row', 
        justifyContent: 'space-between'
    },
    description: {
        paddingLeft: 10, 
        fontWeight: WEIGHT.THIN, 
        fontSize: FONT.XSMALL, 
        paddingTop: 5,
        color: COLOR.GREY,
    },
    itemClickableLabel: {
        color: COLOR.GREY,
        paddingLeft: 10,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM
    },
    itemClickableLabel2: {
        color: COLOR.SECONDARY,
        paddingLeft: 15,
        // fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM
    },
    itemClickable1: {
        backgroundColor: COLOR.WHITE,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        paddingVertical: 15, 
        paddingHorizontal: 15 , 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
    },
    itemClickable: {
        backgroundColor: COLOR.WHITE,
        borderRadius: 6,
        paddingVertical: 15, 
        paddingHorizontal: 15 , 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
    },
    flexMiddle: {
        justifyContent: 'center',
        // alignItems: 'center'
    },
    bgColorWhite:{
        backgroundColor: COLOR.BACKGROUND,
    },
    flex1: {
        flex:1,
    }

});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    subscription: store.InfoReducer.subscription,
});


export default connect(mapStateToProps)(MyPlan);