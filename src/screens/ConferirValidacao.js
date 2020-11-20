import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { connect } from 'react-redux';
import { NavigationActions, StackActions } from '@react-navigation/stack'
import moment from 'moment/min/moment-with-locales'
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import Pageheader from '../components/Pageheader'
import def_styles from '../assets/styles/theme.styles'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
moment.locale('pt-BR');

class ConferirValidacao extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            let item = this.props.route && this.props.route.params && this.props.route.params.item;
            this.setState({
                item
            })
        }

    }

    componentWillUnmount(){
        this._isMounted = false;
    }


    formatDate(date){
        let dia = moment(date).format("DD")
        let mes = moment(date).format("MMMM")
        let ano = moment(date).format("YYYY")
        let hora = moment(date).format("HH")
        let minuto = moment(date).format("mm")
        let total = dia + " de " + mes + " de " + ano + " • " + hora + ":" + minuto;
        return total;
    }

    render(){
        let { currentRestaurant, voucherInfo } = this.props;
        let { item } = this.state;
        console.log('item', item);
        return(
            <View style={[styles.flex1, {backgroundColor: 'white'}]}>
                <Pageheader title={"VOUCHER VALIDADO"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <View style={[styles.flex1, def_styles.align_items_center, {bottom: 30}]}>
                    {item ?
                        <View style={[def_styles.justify_content_center, {flex: 1}]} >
                            <View style={[def_styles.justify_content_center, def_styles.align_items_center, styles.restauranteBoxImage]}>
                                <Image style={{height: 180, width: 240}} source={require('../assets/icons/qr_code-vali.png')}/>
                            </View>
                            {/* RESTAIRANTE */}
                            <View style={[def_styles.flexRow, def_styles.align_items_center, def_styles.p_t_20, ]}>
                                <View style={styles.restauranteBoxImage}>
                                    <Image style={styles.imgRest} source={{uri: item.restaurante.logo }}/>
                                </View>
                                <View style={def_styles.m_l_10}>
                                    <Text style={styles.nomeRest}>{item.restaurante.nomeRestaurante}</Text>
                                    <Text style={styles.dataRest}>{this.formatDate(item.createdAt)}</Text>
                                </View>
                            </View>
                            <Text style={ [def_styles.m_t_20, def_styles.m_b_10, styles.datasFonts]}>Código: {item.codigo}</Text>
                            <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                                <Text style={styles.datasFonts}>Valor da conta sem desconto</Text>
                                <Text style={styles.datasFonts}>R$ {(item.valorConta).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                            </View>
                            <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                                <Text style={styles.datasFonts}>Pago com desconto</Text>
                                <Text style={styles.datasFonts}>R$ {(item.valorDesconto).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                            </View>
                            <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                                <Text style={styles.datasEconomia}>Desconto</Text>
                                <Text style={styles.datasEconomia}>R$ {(item.valorConta - item.valorDesconto).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                            </View>
                        </View>
                    : null}

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    mainBtn: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        marginVertical:20,
        marginHorizontal: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
    }, 
    restauranteBoxImage: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.26,
        shadowRadius: 3.18,
        elevation: 4,
    },
    txtTitle: {
        fontSize: FONT.MEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY,
        textAlign: 'center',
        paddingTop: 10,
    },
    datasEconomia: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.FAT,
        color: 'green',
        paddingTop: 5
    },
    datasFonts: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY,
        paddingTop: 5
    },
    dataRest: {
        fontSize: FONT.LABEL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY
    },
    nomeRest: {
        fontSize: FONT.SMALL,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY
    },
    imgRest: {
        height: 60, 
        width: 60, 
        borderRadius: 50
    },
    flex1: {
        flex: 1,
    }
});


const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    currentRestaurant: store.InfoReducer.currentRestaurant,
    voucherInfo: store.InfoReducer.voucherInfo,
    modeloNegocio: store.InfoReducer.modeloNegocio,
});

export default connect(mapStateToProps)(ConferirValidacao);