// LIB IMPORTS
import React, { Component } from 'react'; 
import { ActivityIndicator, Dimensions, SafeAreaView, StatusBar, View, Text, Platform, RefreshControl, StyleSheet, ScrollView, TouchableOpacity, Image, AsyncStorage, Share, Linking } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import moment from 'moment/min/moment-with-locales'
import * as Updates from 'expo-updates'
// REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageVouchers, storageUserToken, storageUserData, storageSubscription } from '../actions';
// LOCAL IMPORTS
import def_styles from '../assets/styles/theme.styles'
import { getApi } from '../environments/config'
import Theme from '../constants/Theme';
import Events from '../utils/Events';
// CONSTS DECLARING
const { width } = Dimensions.get('window');
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
moment.locale('pt-BR');

class Perfil extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            arrowSize: 15,
            phone: '553432553690',
            appVersion: Constants.manifest.version,
            platform: Platform.OS,
            platformVersion: Platform.Version,
            deviceName: Platform.OS == 'ios' ? Constants.platform.ios.model : Constants.deviceName,
            topbarColor: true,
            loadingSubscriptionData: true,
            subscription: null,
            vouchers: null
        }
        this.onRefresh = this.onRefresh.bind(this);
    }

    componentDidMount(){
        this._isMounted = true;
        this.UpdateName = Events.subscribe('UpdateName', () => { this.setState({ name: this.props.userData.name }) });
        this.UpdateSubscription = Events.subscribe('UpdateSubscription', () => { this.loadSubscriptionData() });

        this.setState({
            user: this.props.userData,
            name: this.props.userData.name,
        })
        if (this._isMounted) {
            this.loadSubscriptionData();
            this.loadVouchers(this.props.userData);
        }

    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async share(){
        try {
            const result = await Share.share({
                title: 'Rota Gourmet',
                message: 'O Rota Gourmet é o seu guia de pontos gastronômicos. \n Seja vip! Como associado Rota Gourmet, você economiza já planejando o próximo restaurante.',
                url: 'https://rotagourmet.app.link/experimente',
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

    suporte(){
        let text = `Olá, sou ${this.state.user.name}. Meu e-mail é ${this.state.user.email}, meu celular é sistema operacional ${this.state.platform} ${this.state.platformVersion}, modelo ${this.state.deviceName}.\nMinha dúvida é:`
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${this.state.phone}&text=${text}` : `whatsapp://send?phone=${this.state.phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }

    dateFormat(date){
        let dia = moment(date).format("DD")
        let mes = moment(date).format("MMMM")
        let ano = moment(date).format("YYYY")
        let total = dia + " de " + mes + " de " + ano
        return total;
    }

    async loadSubscriptionData(){
        if (this.props.userData && this.props.userData._id) {    
            this.setState({ loadingSubscriptionData: true });
            //Requisição de Search for Subscription
            let response = await fetch(server.url + `api/subscription/listByUser/${this.props.userData._id}?token=${this.props.userToken}`);
            response = await response.json();
            if (response.error) {
                this.setState({ loadingSubscriptionData: false });
            }else{
                this.props.storageSubscription(response.subscription);
                this.setState({
                    subscription: response.subscription,
                    loadingSubscriptionData: false
                });
            }
        }
    }

    loadVouchers(user){
        let now = moment();
        let voucher = user && user.voucher;
        let data = moment(voucher.expirateDate).format("DD/MM/YY");

        let voucherEndDate;
        voucherEndDate = moment(voucher.expirateDate);
        if(voucherEndDate && now <= voucherEndDate){
            if (voucher.number > 0 || voucher.number === "FREE") {
                this.setState({
                    voucher: true,
                    vouchersNumber: voucher.number === "FREE" ? "Ilimitados" : voucher.number,
                    vouchersExpirate: data,
                })
            }
        }else{
            this.setState({
                voucher: false,
                vouchersNumber: voucher.number,
                vouchersExpirate: data,
            })
        }
    }

    async onRefresh(){
        if (this.state.user && this.state.user._id) {    
            this.setState({refreshing: true})
            //Requisição de atualizar o usuario
            let response = await fetch(server.url + `api/user/atualiza/${this.state.user._id}?token=${this.props.userToken}`);
            response = await response.json();
            if (response.error) {
                this.setState({refreshing: false})
            } else {
                this.loadSubscriptionData();
                this.setState({refreshing: false, user: response.user});
                AsyncStorage.setItem("user", JSON.stringify(response.user));
            }
        }
    }

    deslogar(){
        this.props.storageVouchers(null);
        this.props.storageUserData(null);
        this.props.storageUserToken(null);
        AsyncStorage.removeItem("cidade"); 
        AsyncStorage.removeItem("user"); 
        AsyncStorage.removeItem("restaurantes"); 
        AsyncStorage.removeItem("vouchers"); 
        AsyncStorage.removeItem("categorias"); 
        this.checkUpdate();
        AsyncStorage.setItem("logged", "false"); 
        Events.publish("RefreshRouters")
    }

    async checkUpdate() {
      try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              Updates.reloadFromCache();
          }
      } catch (e) {
      }
    }

    render(){
        let { navigation } = this.props;
        let { subscription, voucher, vouchersNumber, vouchersExpirate } = this.state;
        return(
            <SafeAreaView style={styles.mainContainer}>
                <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                
                {/* TOPBAR */}
                <View style={[styles.containerTopBar]}>
                    <View style={{justifyContent: 'flex-end', flex: 1,}}>

                        {/* INICIO EDITAR PERFIL */}
                        <View style={[styles.flex1, def_styles.p_h_15]}>
                            <TouchableOpacity style={styles.contentTop} onPress={() => navigation.navigate("EditPerfil")}>
                                <View style={styles.rowCenter}>
                                    <Image style={styles.logoImg} source={this.state.user && this.state.user.foto ? {uri: this.state.user.foto} : require('../assets/perfil/Personagem.png')} />
                                    <View style={{paddingLeft: 15}}>
                                        <Text style={styles.labelName}>{this.state.name ? this.state.name : "Complete seu cadastro"}</Text>
                                        <Text style={styles.labelEdition}>Editar Perfil</Text>
                                    </View>
                                </View>
                                <View>
                                    <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        {/* TERMINAR EDITAR PERFIL */}
                        {/* SESSAO DE INFOS DE PAGAMENTO */}
                        { this.state.topbarColor && !this.state.loadingSubscriptionData ? 
                            <View style={[styles.infoPagamento, { backgroundColor: subscription ? COLOR.BACKGROUND : COLOR.PRIMARY }]}>
                                <View style={[def_styles.p_h_15, def_styles.p_t_10, def_styles.p_b_10, ]}>
                                {subscription ?
                                    <View>
                                        <Text numberOfLines={1} style={[styles.sejaAssinanteLabel2, {color: COLOR.GREY, paddingBottom: 4}]}>Assinatura ativa • {subscription.planTitle}</Text>
                                        <View style={{flexDirection: 'row', }}>
                                            {subscription.nextRecurrency ? <Image
                                                style={styles.correctImage}
                                                source={require('../assets/perfil/correct.png')}
                                            /> : null}
                                            {subscription.nextRecurrency ? <Text style={[styles.sejaAssinanteDescription, {color: COLOR.GREY, paddingLeft: 5, }]}>Proxima cobrança {moment(subscription.nextRecurrency).format("DD/MM/YYY")}</Text> : null}
                                        </View>
                                    </View>
                                : voucher ?

                                    <View style={[styles.rowCenter, styles.spaceBet]}>
                                        <View>
                                            <Text style={styles.sejaAssinanteLabel}>{`Você tem ${vouchersNumber} vouchers`}</Text>
                                            <Text style={[styles.sejaAssinanteDescription]}>Seus vouchers expiram dia {vouchersExpirate}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.sejaAssinanteContainerBtn} onPress={() => navigation.navigate("Plans")}>
                                            <Text style={[styles.sejaAssinanteBtnLabel]}>ASSINAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                :
                                <View style={[styles.rowCenter, styles.spaceBet]}>
                                        <View>
                                            <Text style={styles.sejaAssinanteLabel}>Seja um assinante Rota</Text>
                                            <Text style={[styles.sejaAssinanteDescription]}>{'Planos a partir de R$7,50/mês'}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.sejaAssinanteContainerBtn} onPress={() => navigation.navigate("Plans")}>
                                            <Text style={[styles.sejaAssinanteBtnLabel]}>ASSINAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                </View>
                            </View>
                            : 
                            <View style={[styles.infoPagamento]}>
                                <View style={[def_styles.p_h_15, def_styles.p_t_25, def_styles.p_b_15, ]}>
                                    <ActivityIndicator />
                                </View>
                            </View>
                        }
                    </View>
                </View>

                <ScrollView style={[styles.bgColorWhite,]} contentContainerStyle={[styles.flexMiddle,  def_styles.p_b_150]} 
                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} /> }>
                    {subscription && subscription.method !== "Boleto" ?
                        <TouchableOpacity style={styles.itemClickable} onPress={() => navigation.navigate("MyPlan", {subscription})}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/premium.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Meu Plano</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                    : null}
                    <TouchableOpacity style={[styles.itemClickable, def_styles.m_t_15,]} onPress={() =>  this.state.user && this.state.user.type && this.state.user.type == 'ADMIN' ? navigation.navigate("Indicar") : this.share() }>
                        <View style={[styles.flexRow, styles.alignCenter]}>
                            <Image source={require('../assets/perfil/convidar.png')} style={styles.iconItem} />
                            <Text style={styles.itemClickableLabel}>Convidar amigos</Text>
                        </View>
                        <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                    </TouchableOpacity>

                    {/* Dúvidas */}
                    <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Dúvidas?</Text>
                    <View style={[styles.dualBtnContent,]}>
                        <TouchableOpacity style={[styles.btnDual, styles.borderBottom]} onPress={() => this.suporte()}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/faleconosco.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Fale conosco</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnDual,]} onPress={() => navigation.navigate("Faq")}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/perguntas.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Perguntas Frequentes</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                    </View>


                    {/* Informações */}
                    <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Informações</Text>
                    <View style={[styles.dualBtnContent, def_styles.m_t_10]}>
                        <TouchableOpacity style={[styles.btnDual, styles.borderBottom]} onPress={() => {WebBrowser.openBrowserAsync('https://file-upload-rota.s3.amazonaws.com/arquivos/Regulamento.pdf')}}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/faleconosco.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Regulamento</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnDual, styles.borderBottom]} onPress={() => {WebBrowser.openBrowserAsync('https://file-upload-rota.s3.amazonaws.com/arquivos/Termos+de+Uso.pdf') }}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/perguntas.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Termos de Uso</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnDual,]} onPress={() => { navigation.navigate("About")}}>
                            <View style={[styles.flexRow, styles.alignCenter]}>
                                <Image source={require('../assets/perfil/info.png')} style={styles.iconItem} />
                                <Text style={styles.itemClickableLabel}>Sobre o Aplicativo</Text>
                            </View>
                            <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                        </TouchableOpacity>
                    </View>


                    <TouchableOpacity style={[styles.itemClickable, def_styles.m_t_20]} onPress={() => navigation.navigate("QueroParticipar")}>
                        <View style={[styles.flexRow, styles.alignCenter]}>
                            <Image source={require('../assets/perfil/parceiro.png')} style={styles.iconItem} />
                            <Text style={styles.itemClickableLabel}>Sou Estabelecimento, quero entrar</Text>
                        </View>
                        <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                    </TouchableOpacity>                    
                    {/* Dúvidas */}
                    {/* {this.state.user && this.state.user.type && this.state.user.type == 'ADMIN' ?  <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Acesso Administrativo</Text> : null }
                    {this.state.user && this.state.user.type && this.state.user.type == 'ADMIN' ? 
                    <TouchableOpacity style={[styles.itemClickable,]} onPress={() => navigation.navigate("Restaurantes")}>
                        <View style={[styles.flexRow, styles.alignCenter]}>
                            <Image source={require('../assets/perfil/unidades.png')} style={styles.iconItem} />
                            <Text style={styles.itemClickableLabel}>Restaurantes</Text>
                        </View>
                        <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                    </TouchableOpacity> : null }
                    {this.state.user && this.state.user.type && this.state.user.type == 'ADMIN' ? 
                    <TouchableOpacity style={[styles.itemClickable,]} onPress={() => navigation.navigate("CheckInRestaurants")}>
                        <View style={[styles.flexRow, styles.alignCenter]}>
                            <Image source={require('../assets/perfil/unidades.png')} style={styles.iconItem} />
                            <Text style={styles.itemClickableLabel}>Check In</Text>
                        </View>
                        <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                    </TouchableOpacity> : null } */}
                    <TouchableOpacity style={[styles.itemClickable, def_styles.m_t_20,]} onPress={() => {this.deslogar()}}>
                        <View style={[styles.flexRow, styles.alignCenter]}>
                            <Image source={require('../assets/perfil/deslogar.png')} style={styles.iconItem} />
                            <Text style={styles.itemClickableLabel}>Deslogar</Text>
                        </View>
                        <Icon name='chevron-right' type='font-awesome' color={COLOR.SECONDARY} size={this.state.arrowSize} />
                    </TouchableOpacity>
                </ScrollView>

            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    correctImage: {
        height: 15,
        width: 15
    },
    spaceBet: {
        justifyContent: 'space-between'
    },
    borderBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: COLOR.GREY_WHITE,
    },
    btnDual: {
        paddingVertical: 15, 
        marginHorizontal: 15, 
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    dualBtnContent:{
        backgroundColor: COLOR.WHITE,
        marginHorizontal: 15, 
        borderRadius: 6,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,

    },
    sejaAssinanteLabel2: {
        color: COLOR.WHITE,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMALL,
    },
    sejaAssinanteLabel: {
        color: COLOR.WHITE,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
    },
    sejaAssinanteContainerBtn: {
        backgroundColor: COLOR.WHITE,
        paddingHorizontal: 15, 
        paddingVertical: 10,
        borderRadius: 6
    },
    sejaAssinanteDescription: {
        color: COLOR.WHITE,
        fontWeight: WEIGHT.THIN,
        fontSize: FONT.XSMALL,
    },
    sejaAssinanteBtnLabel: {
        color: COLOR.SECONDARY,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.XSMALL,
    },
    label: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
    },
    alignCenter: {
        alignItems: 'center'
    },

    itemClickableLabel: {
        color: COLOR.GREY,
        paddingLeft: 15,
        fontSize: FONT.SMEDIUM
    },
    itemClickable: {
        backgroundColor: COLOR.WHITE,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        paddingVertical: 15, 
        paddingHorizontal: 15 , 
        marginHorizontal: 15 ,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,

    },
    iconItem: {
        height: 22,
        width: 22,
    },
    assinanteAtivoLabel: {
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY,
    },
    assinanteHaLabel: {
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY,
    },
    infoPagamento: {
        borderBottomRightRadius:10,
        borderBottomLeftRadius:10,
    },
    correctIcon: {
        height: responsiveHeight(1.5),
        width: responsiveHeight(1.5),
    },
    labelEdition: {
        fontSize: FONT.SMALL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY
    },
    labelName: {
        fontSize: FONT.MEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY
    },
    flex1: {
        flex: 1,
        width: '100%'
        // flexDirection: 'row', 
    },
    rowCenter: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    withoutNetBtnContainer: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        margin:20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '80%'
    },
    withoutNetImage: {
        height:responsiveHeight(20),
        width:responsiveHeight(20),
    },
    bgColorWhite:{
        backgroundColor: COLOR.BACKGROUND,
    },
    logoImg: {
        borderRadius: 50,
        height: responsiveWidth(13),
        width: responsiveWidth(13),
    },
    contentTop:{
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexDirection: 'row',
        marginBottom: 10,
    },
    flexRow: {
        flexDirection: 'row'
    },
    flexMiddle: {
        paddingTop: responsiveHeight(21),
        justifyContent: 'center',
        // alignItems: 'center'
    },
    
    containerTopBar: {
        // paddingBottom: responsiveHeight(2), 
        paddingTop: 38,
        borderRadius: 15, 
        backgroundColor: COLOR.BACKGROUND,
        height: responsiveHeight(22),
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
    mainContainer: {
        flex: 1,
        paddingTop: 40,
        // borderRadius:120,
    },
    
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageVouchers, storageUserToken, storageUserData, storageSubscription }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Perfil);