// LIB IMPORTS
import React, { Component } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Animated, 
    AsyncStorage, 
    Platform, 
    Alert, 
    Linking, 
    ActivityIndicator, 
    RefreshControl,
    Dimensions
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useScrollToTop } from '@react-navigation/native';
import moment from 'moment/min/moment-with-locales'
// EXPO
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
// REDUX IMPORTS
import { connect } from 'react-redux';
import { storageUserData, storageUserToken, storageCity, storageRestaurants, storageNavigation, setCurrentScreen } from '../actions';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import { CATEGORIAS } from '../static/entries';
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import StatusBarCustom from '../components/StatusBarCustom';
import TopBarHome from "../components/TopBarHome";
import HighlightsCarousel from '../components/HighlightsCarousel';
import EatSomeHour from '../components/EatSomeHour';
import Modal from '../components/AnimatedModal';
import SkeletonContentHome from "../components/SkeletonContentHome";
import DiasAceitacao from "../components/DiasAceitacao";
import PopupVouchers from "../components/PopupVouchers";
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
const { width } = Dimensions.get('window')
moment.locale('pt-BR');

class Home extends Component {

    _isMounted = false;
    _timeout;

    constructor(props) {
        super(props);
        this.state = { 
            highlights: null,
            selectedCity: null,
            economiaLoading: true,
            fadeAllContent: new Animated.Value(0),
            fadeSkeleton: new Animated.Value(1),
			skeletonContentLoading: true,
            fadeAllowLocation: new Animated.Value(0),
            completeLoading: false,
            modalVoucherRegistered: true,
            userWithVoucher: false
        };
        this.openModal = this.openModal.bind(this);
        this.setUserName = this.setUserName.bind(this);
        this.setupLocation = this.setupLocation.bind(this);
        this.setSkeleton = this.setSkeleton.bind(this);
        this.updateSelectedCity = this.updateSelectedCity.bind(this);
    }

    fadeOutAllContent(){
		Animated.timing( this.state.fadeAllContent, { toValue: 0, duration: 0, useNativeDriver: false }).start();
	}

    fadeInAllContent(){
		Animated.timing( this.state.fadeAllContent, { toValue: 1, duration: 50,useNativeDriver: false }).start();
	}

    fadeOutSkeleton(){
		Animated.timing( this.state.fadeSkeleton, { toValue: 0, duration: 200,useNativeDriver: false }).start();
	}

    fadeInAllowLocation(){
		Animated.timing( this.state.fadeAllowLocation, { toValue: 1, duration: 1000 ,useNativeDriver: false}).start();
	}

	fadeOutAllowLocation(){
		Animated.timing( this.state.fadeAllowLocation, { toValue: 0, duration: 400,useNativeDriver: false }).start();
	}

    startPoint(){
        NetInfo.fetch().then((state) => {
            this.setState({
                network: state.isConnected,
                loadingWithoutNet: false
            });
            if (!state.isConnected) {
                this.setState({
                    skeletonContentLoading: true
                })
            }else{
                if ((Platform.OS == 'ios' && Constants.platform && Constants.platform.ios && Constants.platform.ios.model !== 'Simulator') || Platform.OS == 'android') {
                    this.sendLocationNotifyData()
                }
            }
        });
    }

    async sendLocationNotifyData(){
        // SEND INFOS DE LOCATION E NOTIFICATIONS
        const { statusLoca } = await Permissions.askAsync(Permissions.LOCATION);
        let reverseGeocodeAsync;
        if (statusLoca === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocodeAsync = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude});
        }
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        let token;
        let localizacaoInfos = {}
        // Stop here if the user did not grant permissions
        if (status == 'granted') {
            token = await Notifications.getExpoPushTokenAsync();
        }
        // Get the token that identifies this device
        let notificacoesInfos = await registerForPushNotificationsAsync();
        if(reverseGeocodeAsync && reverseGeocodeAsync[0]){
            localizacaoInfos = {
                street: reverseGeocodeAsync[0].street,
                city: reverseGeocodeAsync[0].city,
                region: reverseGeocodeAsync[0].region,
                postalCode: reverseGeocodeAsync[0].postalCode,
                country: reverseGeocodeAsync[0].country,
                name: reverseGeocodeAsync[0].name,
                isoCountryCode: reverseGeocodeAsync[0].isoCountryCode,
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                accuracy: location.coords.accuracy
            }
        }
        if (this.props.userData && this.props.userData._id) {    
            //Requisição de registar informações do localizacao
            let response = await fetch(server.url + `api/user/locationData?token=` + this.props.userToken, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({_id: this.props.userData._id, location: localizacaoInfos, notifications: notificacoesInfos })
            });
            response = await response.json();
            if (response && response.error) {
                this.setState({loading: false}); 
                
            }else{
                this.setState({loading: false}); 
            }
        }
    }

    _handleNotification = async (notification) => {

        if (notification.data) {
            if (notification.data.route && notification.data.route !== "Nenhum") { //ABRE A TELA DE ALGUM RESTAURANTE
                this.setState({completeLoading: true})
                //Requisição de encontrar 1 restaurante
                let response = await fetch(server.url + `api/restaurants/listOneRestaurant/${notification.data.route}?token=${this.props.userToken}`);
                response = await response.json()
                if (response.error) {
                    this.setState({completeLoading: false})
                } else {
                    this.setState({completeLoading: false})
                    this.props.navigation.navigate("Restaurant", {restaurant: response.restaurant})
                }
                
            }
            //Requisição de confirmação de recebimento de Push
            let response = await fetch(server.url + `notifications/confirmTouched/${notification.data.notificationId}`);
            response = await response.json()
            this.setState({completeLoading: false})
        }
    };

    componentWillUnmount(){
        this._isMounted = false;
        Events.remove('LocationLoaded')
        this.LocationLoaded = null;
        
        Events.remove('UpdateName')
        this.UpdateName = null;
        
        Events.remove('LoadingScreen')
        this.LoadingScreen = null;
        
        Events.remove('OpenModalCity')
        this.OpenModalCity = null;
    }

    openModal(){
        this.setState({modal: true})
    }

    setUserName(){
        this.setState({ name: this.props.userData.name })
    }

    setSkeleton(){
        this.fadeOutAllContent();
        this.setState({
            skeletonContentLoading: true
        })
    }

    updateSelectedCity(){
        this.fadeOutAllowLocation()
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            // this._notificationSubscription = Notifications.addListener((event) => this._handleNotification(event));
            this.UpdateScroll = Events.subscribe('UpdateScroll', () => {
                this && this.refs && this.refs.homeScroll && this.refs.homeScroll.scrollTo && this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
            });
            this.UpdateSelectedCity = Events.subscribe('UpdateSelectedCity', this.updateSelectedCity);
            this.LocationLoaded = Events.subscribe('LocationLoaded', this.setupLocation);
            this.LoadingScreen = Events.subscribe('LoadingScreen', this.setSkeleton );
            this.UpdateName = Events.subscribe('UpdateName', this.setUserName );
            this.OpenModalCity = Events.subscribe('OpenModalCity', this.openModal);

            this.props.storageNavigation(this.props.navigation);
            this.startPoint();
            this.setupLocation();

            
        }
    }

    setupLocation(){
        AsyncStorage.getItem("cidade").then((response) => {
            if (response) {
                console.log('[STATUS 1]:: SELECIONOU CIDADE | ABRE DIRETAMENTE A TELA HOME');
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    locationPermission: true,
                    localizacao: response
                });
                this.newListByCity();
            } else {
                console.log('[STATUS 2]:: NÃO SELECIONOU CIDADE | ABRE MODAL DE SELECIONAR');
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    locationPermission: false,
                    localizacao: 'not allowed'
                });
                setTimeout(() => {
                    this.fadeInAllowLocation();
                    this.fadeOutSkeleton();
                    this.setState({
                        skeletonContentLoading: false,
                    })
                    this.setState({modal: true}); 
                    Events.publish("OpacityBottomTabFalse")
                }, 4000);
            }
        });
    }

    setupLocation2(){ // UTILIZADA APENAS QUANDO A SELECAO DA CIDADE FOR AUTOMATICA
        if(this.props.selectedCity instanceof Promise || typeof this.props.selectedCity == 'promise'){
            this.props.selectedCity.then((response) => {
                let propsSelectedCity = response;

                console.log('[STATUS 5]:: NÃO SELECIONOU CIDADE, NEM ATIVOU LOCALIZAÇÃO, SELECTEDCITY VEM COMO PROMISE');
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    locationPermission: false,
                    localizacao: 'not allowed'
                });
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    locationPermission: false,
                    localizacao: 'not allowed'
                });
                
                this.newListByCity();
            });

        }else{
            if (!Constants.isDevice) { // LOCALIZAÇÃO NO SIMULADOR TENDE A SER PROBLEMÁTICA
                console.log('[Location] No location when running on virtual device');
                
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    localizacao: "Uberlândia",
                    locationPermission: false,
                })
            }else if (this.props.location && this.props.location.locationPermission && !this.props.selectedCity) { //  QUANDO ATIVOU A LOCALIZAÇÃO, PORÉM NÃO SELECIONOU UMA CIDADE
                console.log('[STATUS 1]:: ATIVOU A LOCALIZAÇÃO, PORÉM NÃO SELECIONOU UMA CIDADE - CIDADE:', this.props.selectedCity);
                
                this.setState({ 
                    location: this.props.location.location, 
                    localizacao: this.props.location.localizacao.city,
                    locationPermission: true,
                });
            }else if (this.props.location && this.props.location.locationPermission && this.props.selectedCity){ // QUANDO ATIVOU A LOCALIZAÇÃO E SELECIONOU UMA CIDADE
                console.log('[STATUS 2]:: ATIVOU A LOCALIZAÇÃO E SELECIONOU UMA CIDADE - CIDADE:', this.props.selectedCity);
                
                this.setState({ 
                    location: this.props.location.location, 
                    localizacao: this.props.selectedCity,
                    locationPermission: true,
                });
            }else if(this.props.location && !this.props.location.locationPermission && this.props.selectedCity){ // QUANDO NÃO ATIVOU A LOCALIZAÇÃO E SELECIONOU UMA CIDADE COM A LOCALIZAO ATIVA
                console.log('[STATUS 3]:: NÃO ATIVOU A LOCALIZAÇÃO E SELECIONOU UMA CIDADE COM A LOCALIZAO ATIVA - CIDADE:', this.props.selectedCity);
                
                this.setState({
                    errorMessage: 'Permission to access location was denied',
                    locationPermission: false,
                    localizacao: this.props.selectedCity
                });
            }else{ // QUANDO NÃO SELECIONOU CIDADE, NEM ATIVOU LOCALIZAÇÃO
                console.log('[STATUS 4]:: NÃO SELECIONOU CIDADE, NEM ATIVOU LOCALIZAÇÃO');
                
            }
            this.newListByCity();
        }

    }   

    async newListByCity(){
        let restaurants = this.props.restaurantesList;
        if (restaurants.error) {
            console.log("[HOME - fn: newListByCity | ERROR:]", this.state.selectedCity);
            this.setState({ restaurantes: null, highlights: [] });
        }else{
            if (!restaurants.cidade) {
                this.setState({ restaurantes: null, highlights: []  });
                // AQUI FAZ APARECER A TELA DE  "NÃO SABENMOS ONDE VOCÊ ESTÁ"
                setTimeout(() => {
                    this.fadeInAllowLocation();
                    
                }, 3000);
            }else{
                let destaques = [];
                restaurants.restaurantes.map((res) => {
                    if (res.destaque) {
                        destaques.push(res)
                    }
                });
                this.setState({ restaurantes: restaurants.restaurantes, highlights: destaques });
                setTimeout(() => {
                    this.fadeOutAllowLocation();
                    this.fadeOutSkeleton();
                    this.setState({
                        skeletonContentLoading: false,
                    })
                    this.fadeInAllContent();
                
                    // SERVE PARA MOSTRAR O POPUP INFORMATIVO SOBRE OS VOUCHERS NA PRIMEIRA SESSAO
                    AsyncStorage.getItem("modalVoucherRegistered").then(response => {
                        let user = this.props.userData;
                        let userWithVoucher = false;
                        if(user && moment(user.voucher.expirateDate) > moment() && (user.voucher.number > 0 || user.voucher.number === "FREE") && !user.subscriptionId){
                            userWithVoucher = true
                        }
                        this.setState({
                            modalVoucherRegistered: response ? true : false,
                            userWithVoucher: userWithVoucher
                        })
                    })
                }, 1000);
            }
        }
    }

    scrollTo = (index, destaque, item) => {
        for (let i = 0; i < destaque.length; i++) {
            if (index == i) {
                index = (i * 70);
            }
        }
        this.refs.categoriasItems.scrollTo({ x: index, y: 0, animated: true });
        setTimeout(() => {
             this.props.navigation.navigate("Categories", {item})
        }, 100);
    }

    categoriasItems() {
        let { categorias } = this.props;
        let destaque = []
        destaque = categorias && categorias.filter((res) => res.destaque === true);

        if (destaque && destaque.length ) {
            return (
                <View style={styles.categoriasContentContainer1}>
                    <Text style={styles.categoriasTitle}>Categorias</Text>
                        <ScrollView 
                            ref={"categoriasItems"} 
                            contentContainerStyle={[styles.categoriasContentContainer2, {paddingRight: width*2.7,}]} 
                            horizontal={true} 
                            showsHorizontalScrollIndicator={false} >
                            <View style={styles.flexRow}>
                            {destaque.map((item, index) => {
                                return (
                                    <TouchableOpacity key={index} style={styles.categoriasBox} onPress={() => this.scrollTo(index, destaque, item)}>
                                        <View>
                                            {item.foto ? <Image source={{uri: item.foto}} style={styles.categoriasBoxImage} /> : null}
                                        </View>
                                        <View style={styles.categoriasBoxContentText}>
                                            <Text style={styles.categoriasBoxText}>{item.nomeTipo}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )})}
                            </View>
                    </ScrollView>
                </View>
            )
        } else {
            return (
                <View></View>
            )   
        }
    };

    novoTarja(data){
        const now = new Date(); // Data de hoje
        const past = new Date(data); // Outra data no passado
        const diff = Math.abs(now.getTime() - past.getTime()); // Subtrai uma data pela outra
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 30) {  
            return(
                <Text style={[styles.detailsRestaurante, {color: COLOR.SECONDARY}]}>Novo!</Text>
            );
        }else{
            return null;
        }
    }

    async restaurantesOrganizados(restaurantes){
        let hoje = moment(new Date()).format("ddd");
        let arrayRestAberto = [];
        let arrayRestFechado = [];
        await Promise.all(restaurants.restaurantes.map( async (item, index) => {
            await Promise.all(item.modeloNegocio.map( (mdn, index) => {
                if (mdn.status && (mdn[hoje+'Dia'] || mdn[hoje+'Noite'])) {
                    return arrayRestAberto.push(item);
                }else{
                    return arrayRestFechado.push(item);
                }
            }));
        }));

        // 
        arrayRestAberto = arrayRestAberto.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null))
        arrayRestFechado = arrayRestFechado.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null));

        let total = arrayRestAberto.concat(arrayRestFechado);
        this.setState({restaurantes: total})
        return total;

    }

    restaurantesFn(restaurantes){
        return(
            <View style={[styles.restauranteContentContainer1]}>
                <Text style={styles.destaquesTitle}>Restaurantes</Text>
                {restaurantes.map((item, index) => {
                    return (
                        <TouchableOpacity key={index} style={styles.contentItemRestaurante} onPress={() => this.props.navigation.navigate("Restaurant", { restaurant: item})}>
                            <View style={styles.contentItem}>
                                <View style={styles.restauranteBoxImage}>
                                    <Image source={{uri: item.restaurante.logo}} style={styles.restauranteImage} />
                                </View>
                                <View style={styles.internoItemRestaurante}>
                                    <View style={{flex: 1}}>
                                        <View style={styles.flexRowRestaurante}>
                                            <Text style={styles.nameRestaurant}>{item.nomeUnidade}</Text>
                                            {this.novoTarja(item.createdAt)}
                                        </View>
                                        
                                        <View style={styles.flexRowRestaurante}>
                                            <Text style={styles.detailsRestaurante}>{item.culinariaPrincipal.nomeTipo} {item.distance ? " • " +  item.distance : ""}</Text>
                                        </View>
                                        
                                    </View>

                                    <View style={styles.flexRowRestaurante}>
                                        <View style={styles.iconsContainer}>
                                            { item.modeloNegocio && item.modeloNegocio[0] && item.modeloNegocio[0].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/acompanhado.png')}/> : null}
                                            { item.modeloNegocio && item.modeloNegocio[1] && item.modeloNegocio[1].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/individual.png')}/> : null }
                                            { item.modeloNegocio && item.modeloNegocio[2] && item.modeloNegocio[2].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/delivery.png')}/> : null}
                                        </View>
                                        <DiasAceitacao item={item} />
                                    </View>
                                </View>
                            </View>
                    </TouchableOpacity>
                )})}
            </View>
        )
    }

    render(){
        let { network, restaurantes, skeletonContentLoading } = this.state;
        return(
            <View style={styles.mainContainer}>
                <StatusBarCustom color={COLOR.SECONDARY}/>
                <TopBarHome 
                    network={network} 
                    localizacao={this.state.localizacao} 
                    vouchers={this.props.vouchers} 
                    navigation={this.props.navigation}
                />

                <View style={[{ flex: 1, }, styles.bgWhiteGrey ]}>
                    { skeletonContentLoading ?  <SkeletonContentHome />  : null}
                    {this.state.localizacao == 'not allowed' ?
                        <Animated.View style={{opacity: this.state.fadeAllowLocation, position: 'absolute', top:0, bottom: 0, right: 0, left: 0, zIndex: 2}}>
                            <View style={styles.flexMiddle}>
                                <Image style={styles.openMapImage} source={require('../assets/images/map.png')}/>
                                <Text style={styles.subtitlesDefault}>{'Não sabemos onde você está!\nPermita sua localização ou escolha\numa cidade, para poder usar o app.'}</Text>
                                {/* <TouchableOpacity style={[styles.btnChooseCity, {width: '80%'}]} onPress={() => {Events.publish("UpdateSelectedCity")}}>
                                    <Text style={styles.withoutNetBtnLabel}>PERMITIR LOCALIZAÇÃO</Text>
                                </TouchableOpacity> */}
                                <TouchableOpacity style={[styles.btnChooseCity, {width: '80%'}]} onPress={() => {this.setState({modal: true}); Events.publish("OpacityBottomTabFalse")}}>
                                    <Text style={styles.withoutNetBtnLabel}>ESCOLHER CIDADE</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={[styles.btnChooseCityOutline, {width: '80%'}]} onPress={() => {this.setState({modal: true}); Events.publish("OpacityBottomTabFalse")}}>
                                    <Text style={styles.withoutNetBtnLabelPrimary}>ESCOLHER CIDADE</Text>
                                </TouchableOpacity> */}
                            </View>
                        </Animated.View>
                    : null} 
                        
                    {!this.state.modalVoucherRegistered && this.state.userWithVoucher ? <PopupVouchers close={() => this.setState({modalVoucherRegistered:true})}/> : null}
                    <Animated.View style={{opacity: this.state.fadeAllContent, flex: 1}}>
                    
                        <ScrollView ref='homeScroll' scrollEnabled={true} style={[styles.container, styles.bgWhiteGrey]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => {this.setState({refreshing: false}); Events.publish("UpdateSelectedCity")}} /> }>
                            
                            {this.state.restaurantes ? this.categoriasItems()  : null}

                            {this.state.highlights && this.state.highlights.length > 2 ? <View style={styles.divisao} /> : null}

                            {this.state.highlights && this.state.highlights.length > 2 ? <HighlightsCarousel content={this.state.highlights} navigation={this.props.navigation}/> : null}

                            {/* PARA COMER AGORA */}
                            {restaurantes ? <EatSomeHour title={"Para comer agora"} time={"eatNow"} restaurantesList={restaurantes} navigation={this.props.navigation} /> : null}
                            
                            {/* PARA COMER A NOITE */}
                            {restaurantes ? <EatSomeHour title={"Para comer a noite"} time={"eatTonight"} restaurantesList={restaurantes} navigation={this.props.navigation}/> : null}

                            <View style={[styles.divisao, { marginTop: 20, marginBottom: 20}]} />

                            {restaurantes ? this.restaurantesFn(restaurantes) : null}

                        </ScrollView>
                    </Animated.View>

                <Modal 
                    title={"CIDADES"}
                    show={this.state.modal}
                    close={() => {
                        this.setState({modal: false});
                        Events.publish("OpacityBottomTabTrue")
                    }}
                />
                </View>

                {this.state.completeLoading ? 
                    <View style={styles.contentModalLoading}>
                        <View style={styles.containerInsideLoading}>
                            <ActivityIndicator size="large" color={COLOR.SECONDARY}/>
                        </View>
                    </View>
                :null}

            </View>
        )
    }

}

async function registerForPushNotificationsAsync() {

    const { status: existingStatus } = await Permissions.getAsync( Permissions.NOTIFICATIONS );
    let finalStatus = existingStatus;
    let tokenNotification;
    let viewNotify = true;
    if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;

        if (viewNotify) {

            if (Platform.OS == 'ios') {
                Alert.alert(
                    "Notificações",
                    "Você precisa ativar as notificações do aplicativo nas configurações.",
                    [
                        { text: 'Pergunte depois', onPress: () => null },
                        { text: 'Ajustes', onPress: () => Linking.openURL('app-settings:') },
                    ],
                    { cancelable: false },
                );
            } else {
                Alert.alert(
                    "Notificações",
                    "Você precisa ativar as notificações do aplicativo nas configurações.",
                    [
                        { text: 'OK', onPress: () => null },
                    ],
                    { cancelable: false },
                );
            }
            viewNotify = false;

        }
    }

    if (finalStatus !== 'granted') {
        return {};
    }
    // Get the token that uniquely identifies this device
    tokenNotification = await Notifications.getExpoPushTokenAsync();
    const osInfo = {
        "os": Platform.OS,
        "version": Platform.Version,
        "pushToken": tokenNotification ? tokenNotification : null,
        "appVersion": Constants.manifest.version,
        // "model": Platform.OS == 'ios' ? Constants.platform.ios.model : Constants.deviceName
    };
    return osInfo;

}

const styles = StyleSheet.create({
    containerInsideLoading: {
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        borderRadius: 4, 
        padding: 20, 
        width: responsiveWidth(20),
        height: responsiveWidth(20),
    },
    contentModalLoading: {
        position: 'absolute', 
        zIndex: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        top: 0, 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: "rgba(0,0,0,0.5)" 
    },
    withoutNetBtnLabelPrimary:{
        color: COLOR.PRIMARY,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    withoutNetBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    btnChooseCityOutline: {
        borderColor: COLOR.PRIMARY,
        borderWidth: 2,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 35,
        width: '100%'
    },
    btnChooseCity: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        margin:20,
        paddingVertical: 14,
        paddingHorizontal: 35,
        width: '100%'
    
    },
    bgColorWhite:{
        backgroundColor: COLOR.BACKGROUND,
    },
    flexMiddle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    openMapImage:{
        height: responsiveHeight(30),
        width: responsiveHeight(30),
    },
    subtitlesDefault: {
        fontSize: FONT.SMEDIUM,
        textAlign: 'center',
        color: COLOR.BLACK,
        paddingTop: 20
    },
    // RESTAURANTES LIST
    iconsContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-end'
        },
    contentItem: {
        padding:5, 
        paddingRight:10, 
        flexDirection: 'row',
        flex: 1
    },
    iconModalidade: {
        height: 18,
        width: 18,
        marginRight: 5
    },
    flexRowRestaurante: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detailsRestaurante: {
        fontSize: FONT.XSMALL,
        paddingBottom: 5,
        color: COLOR.GREY,
    },
    nameRestaurant:{
        paddingVertical: 5,
        fontSize: FONT.SMEDIUM,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
    },
    internoItemRestaurante: {
        paddingLeft: responsiveHeight(1.5),
        paddingBottom: 5,
        justifyContent: 'space-between',
        flex: 2.7
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
    restauranteImage: {
        height: 75,
        width: 75,
        backgroundColor: 'white',
        borderRadius: 5
    },
    contentItemRestaurante: {
        flex: 1,
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.36,
        shadowRadius: 3.18,
        elevation: 8,
    },
    destaquesTitle: {
        fontSize: FONT.XLARGE,
        fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY,
        paddingHorizontal: 20,
        paddingBottom: responsiveHeight(1.5),
    },
    restauranteContentContainer1: {
        flex: 1,
        paddingTop: 5, 
        
    },



    divisao: {
        borderTopWidth: 0.7,
        borderTopColor: '#DCDCDC', 
        // marginHorizontal: 18, 
        // marginTop: 10
    },
    flexRow: {
        flexDirection: 'row'
    },
    //CATEGORIAS STYLES
    categoriasBoxText:{
        fontSize: FONT.LABEL,
        color: COLOR.GREY,
        paddingLeft: responsiveWidth(2.0),
    },
    categoriasBoxContentText: {
        flex: 1,
        justifyContent: 'center'
    },
    categoriasBoxImage: {
        height: responsiveHeight(8.5),
        width: responsiveHeight(12),
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    categoriasBox: {
        height: responsiveHeight(12),
        width: responsiveHeight(12),
        backgroundColor: COLOR.WHITE,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.36,
        shadowRadius: 4.68,
        elevation: 11,
        marginRight: 15
    },
    categoriasTitle: {
        fontSize: FONT.XMLARGE,
        fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY,
        paddingHorizontal: 20,
        paddingTop: responsiveHeight(1.5),
    },
    categoriasContentContainer2: {
        flex: 1,
        alignItems: 'center',
        paddingLeft: 20,
    },
    categoriasContentContainer1: {
        marginTop:85,
        height: responsiveHeight(22),
    },
    contentContainer: {
        paddingBottom: 130,
    },
    container: {
        flex: 2
    },
    bgWhiteGrey:{
        backgroundColor: COLOR.BACKGROUND, 
    },
    mainContainer: {
        flex: 1,
    },
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    restaurantesList: store.AuthReducer.restaurantesList,
    selectedCity: store.InfoReducer.selectedCity,
    vouchers: store.InfoReducer.vouchers,
    location: store.InfoReducer.location,
    categorias: store.InfoReducer.categorias,
});

const mapDispatchToProps = dispatch => bindActionCreators({ 
        storageUserData, 
        storageUserToken, 
        storageCity, 
        storageRestaurants, 
        storageNavigation,
        setCurrentScreen
    }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Home);