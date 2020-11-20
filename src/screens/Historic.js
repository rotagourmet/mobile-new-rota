import React, { Component } from 'react'; 
import { StatusBar, View, Text, ActivityIndicator, Image, StyleSheet, TouchableOpacity, FlatList, Share, SafeAreaView } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'

import { LinearGradient } from 'expo-linear-gradient';

import { connect } from 'react-redux';
import moment from 'moment/min/moment-with-locales'

//IMPORTACOES LOCAIS
import { getApi } from '../environments/config'
import Theme from '../constants/Theme';
import def_styles from '../assets/styles/theme.styles';

//PRE-DEFINIÇÕES
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
moment.locale('pt-BR');

class Historic extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            meses: [],
            vouchers: null,
            mensagem1: 'Estou usando o Rota Gourmet e já economizei R$ &1 no total. Baixe na loja virtual e se cadastre gratuitamente.',
            mensagem2: 'Estou usando o Rota Gourmet e economizei R$ &1 no restaurante &2. Baixe na loja virtual e se cadastre gratuitamente.',       
        }
    }

    componentWillUnmount() {
        this._isMounted = false;    
    }
    
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.list();
            this.setupEconomia()
        }
    }

    setupEconomia(){
        let economia = 0;
        
        this.setState({ economiaLoading: true })

        if (!this.props.vouchers || this.props.vouchers && this.props.vouchers.error) {
            this.setState({economia: null, economiaLoading: false})
        }else{
            if (this.props.vouchers && this.props.vouchers.vouchers && this.props.vouchers.vouchers) {
                this.props.vouchers.vouchers.map((item) => {
                    economia = economia + (item.valorConta - item.valorDesconto);
                });
                economia = economia.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});   
                this.setState({economia, economiaLoading: false}) 
            } else {
                this.setState({economia: null, economiaLoading: false})
            }
        }
    }

    async list() {
        let vouchers = this.props.vouchers

        if (vouchers.error) {
            this.setState({vouchers: null, loading: false})
        } else {
            this.setState({vouchers: vouchers.vouchers, loading: false})
        }
    }

    handleLazyLoad = ({ viewableItems }) => {
        const newData = this.state.vouchers.map(image =>
        viewableItems.find(({ item }) => item._id === image._id)
            ? { ...image, loaded: true }
            : image
        );

        this.setState({ food: newData });
    }

    formatHour(date){
        const day = moment(date).format('DD');
        const month = moment(date).format('MMMM');
        const year = moment(date).format('YYYY');
        const hour = moment(date).format('HH:mm');

        return `${day} de ${month} de ${year} • ${hour}`
    }

    formatValue(value){
        value = value.toLocaleString('pt-BR')
        let verify = value.split(',');
        if(verify && verify[1] && verify[1].length == 1){
            return value = (verify[0] + ',' + verify[1] + '0')
        }
        return value
    }

    async shareBtn(msg, valor, name){
        msg = msg == "mensagem1" ? this.state.mensagem1 : this.state.mensagem2;
        if (msg == "mensagem1") {
            msg = msg.replace("&1", valor)
        } else {
            msg = msg.replace("&1", valor).replace("&2", name)
        }
        try {
            const result = await Share.share({
                message: msg,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                // shared with activity type of result.activityType
                } else {
                // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    }

    hora(data){
        var inicio = moment(data).add(3, 'hours');
        // Mostrando:

        let now = moment().add(3, 'hours')
        let yesterday = moment().subtract(1, 'days').add(3, 'hours')
        if (moment(now).format('DD/MM/YYYY') == moment(inicio).format('DD/MM/YYYY') || moment(yesterday).format('DD/MM/YYYY') == moment(inicio).format('DD/MM/YYYY')) {
            return true
        }else{
            return false
        }
    }

    render(){
        return(
            <SafeAreaView style={styles.mainContainer}>
                <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                
                {/* TOPBAR */}
                <View style={[styles.topBarContainer]}>
                    <LinearGradient colors={['#FFB31C', '#DDAA45']} style={styles.topBarDegradeContainer}>
                        <View style={styles.topBarFlexRow}>
                            {/* INICIO DO LADO DA LOGO */}
                            <TouchableOpacity style={styles.topBarBtnBack} onPress={() => {this.props.navigation.goBack()}}>
                                <View style={styles.pd_h_18}>
                                    <Icon name='chevron-left' type='font-awesome' color={COLOR.WHITE} size={18} />
                                </View>
                            </TouchableOpacity>
                            <View style={styles.topBarTitleContainer}>
                                <Text style={styles.topBarTitle}>HISTÓRICO</Text>
                            </View>
                            <TouchableOpacity style={styles.topBarShareContainer} onPress={() => this.shareBtn("mensagem1", this.state.economia, null)}>
                                <Icon name='share-alt' type='font-awesome' color={COLOR.WHITE} size={18} />
                                <Text style={styles.topBarShareLabel}>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.topBarFlexRow, styles.pd_h_18]}>
                            <View style={styles.topBarEconomizouContainer}>
                                <Text style={[def_styles.color_white, def_styles.font_smedium]}>Você já economizou</Text>
                                <Text style={[styles.topBarCifrao, def_styles.weight_fat]}>R$ <Text style={def_styles.font_xlarge}>{this.state.economia ? this.formatValue(this.state.economia) : '00,00'}</Text></Text>
                            </View>
                            <View style={styles.topBarVouchersContainer}>
                                <Text style={[def_styles.font_xlarge, def_styles.color_white, def_styles.weight_fat]}>{this.state.vouchers ? this.state.vouchers.length : 0}</Text>
                                <Text style={[def_styles.font_smedium, def_styles.color_white]}>{this.state.vouchers && this.state.vouchers.length == 1? 'Voucher utilizado' : 'Vouchers utilizados'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
                    <View style={styles.containerFlatList}>

                        { this.state.loading ? <ActivityIndicator style={{justifyContent: 'center', alignItems: 'center'}} size="large"/> :
                        <FlatList
                            data={this.state.vouchers}
                            keyExtractor={( item, index ) => index.toString()}
                            showsHorizontalScrollIndicator={false}
                            style={{paddingTop: responsiveHeight(18), paddingBottom: 1050}}
                            onViewableItemsChanged={this.handleLazyLoad}
                            onEndReachedThreshold={.7}
                            renderItem={({ item, index }) => {
                                return(
                                    <View style={[styles.flexMiddle, def_styles.p_h_20, { marginBottom: this.state.vouchers && (this.state.vouchers.length - 1) == index ? 800 : 30}]}>
                                        <View style={[styles.voucherCard, {height:  this.hora(item.createdAt) ? 230 : 180,}]}>
                                            <View style={styles.topCardVoucher}>
                                                <View style={styles.containerImage}>
                                                    <Image source={{uri: item.restaurante.logo }} style={styles.imagemRestaurante}/>
                                                </View>
                                                <View style={styles.headerContainer}>
                                                    <Text style={styles.restaurantTitle}>{item.restaurante.nomeRestaurante}</Text>
                                                    <View style={[{flexDirection: 'row', justifyContent: 'space-between'}, def_styles.p_t_5]}>
                                                        <Text style={styles.dateHourLabel}>{this.formatHour(item.createdAt)}</Text>
                                                        <TouchableOpacity style={styles.btnShareContainer} onPress={() => this.shareBtn("mensagem2", this.formatValue(item.valorDesconto), item.restaurante.nomeRestaurante)}>
                                                            <Icon name='share-alt' type='font-awesome' color={COLOR.GREY} size={14} />
                                                            <Text style={styles.shareLabel }>Compartilhar</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.divisao}/>
                                        <View style={[styles.containerCard,]}>
                                            <View style={styles.detailsContent}>
                                                <Text style={styles.labelDetails}>Conta: {(item.valorConta).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</Text>
                                                <Text style={styles.labelDetails}>Valor pago: {(item.valorDesconto).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</Text>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>    
                                                    <Text style={[styles.labelDetails, {color: 'green'}]}>Desconto: {(item.valorConta - item.valorDesconto).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</Text>
                                                    <Image style={styles.iconModalidade} source={ item.modeloNegocio == 'Acompanhado' ? require('../assets/icons/acompanhado.png') : item.modeloNegocio == 'Individual' ? require('../assets/icons/individual.png') : require('../assets/icons/delivery.png')}  />
                                                </View>
                                            </View>
                                        </View>
                                        {this.hora(item.createdAt)  ? 
                                            <TouchableOpacity style={styles.outlinedBtn} onPress={() => this.props.navigation.navigate("ConferirValidacao", {item})}>
                                                <Text style={styles.outlinedBtnLabel}>CONFERIR VALIDAÇÃO</Text>
                                            </TouchableOpacity> 
                                        : null}
                                    </View>
                                </View>
                                )
                            }}
                        />}
                </View> 
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    containerFlatList: {
        flex: 1, 
        backgroundColor: COLOR.BACKGROUND,
        
    },
    btnShareContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    containerCard: {
        flex: 1.5, 
        flexDirection: 'row',
        alignItems: 'center'
    },
    labelDetails: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.THIN,
        paddingBottom: 7
    },
    outlinedBtnLabel:{
        color: COLOR.PRIMARY,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    outlinedBtn: {
        borderColor: COLOR.PRIMARY,
        borderWidth: 1.7,
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 35,
        width: '100%',
        marginTop: 20,
        marginBottom: 7,
        flex: 0.5
    },
    iconModalidade: {
        height: 18,
        width: 18,
    },
    detailsContent: {
        flex: 1,
    },
    shareLabel: {
        color: COLOR.GREY,
        fontSize: FONT.XSMALL,
        paddingLeft: 5
    },
    dateHourLabel: {
        color: COLOR.GREY,
        fontSize: FONT.LABEL,
    },
    restaurantTitle: {
        fontSize: FONT.SMALL,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY
    },
    headerContainer: {
        paddingLeft: 10,
        flex: 1

    },
    divisao: {
        borderTopWidth: 0.7,
        borderTopColor: '#DCDCDC', 
        // marginHorizontal: 18, 
        marginVertical: 15
    },
    containerImage: {
        
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 4.68,
        elevation: 4,
    },
    imagemRestaurante: {
        borderRadius: 70,
        height: responsiveHeight(5),
        width:  responsiveHeight(5),
    },
    topCardVoucher: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    voucherCard: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        
        borderRadius: 5,
        backgroundColor: COLOR.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 4.68,
        elevation: 4,
    },
    topBarEconomizouContainer: {
    },
    topBarVouchersContainer: {
        alignItems: 'flex-end',
    },
    topBarCifrao: {
        color: COLOR.WHITE,
        fontSize: FONT.MEDIUM
    },
    topBarShareLabel: {
        color: COLOR.WHITE,
        paddingLeft: 10
    },
    topBarShareContainer: {
        flex: 1.5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 18
    },
    topBarTitleContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topBarTitle: {
        fontSize: FONT.SMEDIUM,
        color: COLOR.WHITE,
        fontWeight: WEIGHT.FAT
    },
    pd_h_18: {
        paddingHorizontal: 18
    },
    topBarBtnBack: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    topBarTitleEconomia: {
        color: COLOR.WHITE,
        fontSize: responsiveFontSize(1.82),
        paddingBottom: 5,

    },
    topBarFlexRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    topBarContainer: {
        height: responsiveHeight(18),
        position: 'absolute',
        zIndex: 10,
        left: 0,
        right: 0,
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 4.68,
        elevation: 4,
    },
    topBarDegradeContainer: {
        borderRadius: 15, 
        flex: 1,  
        // alignItems: 'flex-start',
        paddingBottom: responsiveHeight(2), 
        paddingTop: responsiveHeight(4), 
    },
    mainContainer: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#FFB31C',
        // borderRadius:120,
    },
    flexRow: {
        flexDirection: 'row'
    },
    flexMiddle: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center'
    },
})

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    vouchers: store.InfoReducer.vouchers,
});

export default connect(mapStateToProps )(Historic);