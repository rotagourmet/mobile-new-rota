import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Alert, Linking, Platform } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment/min/moment-with-locales'
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
// REDUX IMPORTS
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import { storageRestaurants, } from '../actions';

import { getApi } from '../environments/config'
import Pageheader from '../components/Pageheader'
import Theme from '../constants/Theme';
import Events from '../utils/Events';
// CONSTS DECLARING
const server = getApi('api');
moment.locale('pt-BR');

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class CloseToMe extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            fadeAllowLocation: new Animated.Value(0),
            loading: true
        }
    }

    fadeInAllowLocation(){
		Animated.timing( this.state.fadeAllowLocation, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
	}

	fadeOutAllowLocation(){
		Animated.timing( this.state.fadeAllowLocation, { toValue: 0, duration: 400, useNativeDriver: false }).start();
	}

    async componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            if (this.props.closeToMe && this.props.closeToMe.length > 0) {
                this.setState({
                    appliedFilters: this.props.closeToMe,
                    loading: false
                });
            }else if(this.props.restaurantesList && this.props.restaurantesList.restaurantes && this.props.restaurantesList.restaurantes.length > 0){
                this.getCurrentPositionAsync()
                console.log('this.props.restaurantesList.restaurantes.length', this.props.restaurantesList.restaurantes.length);

                let list = this.props.restaurantesList.restaurantes;
                let newlist  = []
                list.map( (item, index) => {
                    if (item.distance) {
                        newlist.push(item)
                    }
                });
                newlist = newlist.sort((a, b) => {
                    let aDist = a.distance ? a.distance.replace(/[^\d]+/g, '') : "0";
                    let bDist = b.distance ? b.distance.replace(/[^\d]+/g, '') : "0";
                    return parseFloat(aDist) - parseFloat(bDist)
                })
                this.setState({
                    appliedFilters: newlist
                })   
            }
        }
    }

    async getCurrentPositionAsync(){
        this.setState({
            loading: true
        })
        const { status: existingStatus } = await Permissions.getAsync( Permissions.LOCATION );
        let finalStatus = existingStatus;
        let viewNotify = true;
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        console.log('status', existingStatus, status);
        if (existingStatus !== 'granted' && status !== 'granted') {
            finalStatus = status;
            this.setState({
                localizacao: 'not allowed',
            })
            this.fadeInAllowLocation()

            if (viewNotify) {
                this.setState({
                    loading: false
                })

                if (Platform.OS == 'ios') {
                    Alert.alert(
                        "Localização",
                        "Você precisa ativar o uso de localização do aplicativo nas configurações.",
                        [
                            { text: 'Pergunte depois', onPress: () => null },
                            { text: 'Ajustes', onPress: () => {Linking.openURL('app-settings:') }},
                        ],
                        { cancelable: false },
                    );
                } else {
                    Alert.alert(
                        "Localização",
                        "Você precisa ativar o uso de localização do aplicativo nas configurações.",
                        [
                            { text: 'OK', onPress: () => null },
                        ],
                        { cancelable: false },
                    );
                }
                viewNotify = false;

            }
        }else{
            if (Platform.OS == 'ios' && Constants.platform.ios && Constants.platform.ios.model === 'Simulator' ) {
                    this.setState({
                        // loading: false,
                        localizacao: 'not allowed'
                    })
                this.fadeInAllowLocation();
            }else{
                this.fadeOutAllowLocation();
                let location = await Location.getCurrentPositionAsync({});
                let reverseGeocodeAsync = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude});
                
                this.listByCity(reverseGeocodeAsync[0])
            }
        }
    }

    async listByCity(infos){
        let newArray = [];
        let newlist = [];
        this.setState({
            loading: true
        })
        
        let restaurants = await fetch(server.url + `api/restaurants/listByCity/` + infos.city + '?token=' + this.props.userToken)
        restaurants = await restaurants.json()
        if (restaurants.error) {
            console.log("[LOADREDUCERS - fn: listByCity | ERROR AFTER LOAD THE REQSITION:]");
            this.props.storageRestaurants(restaurants);
        }else if(!restaurants.cidade){
            console.log("[LOADREDUCERS - fn: listByCity | NO CITY AFTER LOAD THE REQSITION:]");
            this.props.storageRestaurants(restaurants);
        }else {
            
            await Promise.all(restaurants.restaurantes.map( async (item, index) => {
                // console.log('item', item);
                
                if (infos && infos.postalCode && item.address && item.address.logradouro && item.address.logradouro.length > 4) {
                    
                    let address = item.address.logradouro + ', ' + item.address.numero + ' - ' + item.address.cep;
                    let dataMaps = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?language=pt&origins=${infos.postalCode}&destinations=${address}&key=AIzaSyAgODAT2JGMFgpJHmUN-v_4GtXZXo-WQo8`);
                    dataMaps = await dataMaps.json();
                    // console.log('dataMapo', dataMaps);
                    item.distance = dataMaps && dataMaps.rows && dataMaps.rows[0] && dataMaps.rows[0].elements[0] && dataMaps.rows[0].elements[0].distance && dataMaps.rows[0].elements[0].distance.text ? dataMaps.rows[0].elements[0].distance.text : null
                    item.duration = dataMaps && dataMaps.rows && dataMaps.rows[0] && dataMaps.rows[0].elements[0] && dataMaps.rows[0].elements[0].duration && dataMaps.rows[0].elements[0].duration.text ? dataMaps.rows[0].elements[0].duration.text : null
                    newArray.push(item)
                } else {
                    item.distance = "";
                    item.duration = ""
                    newArray.push(item)
                }
            }));
        }

        let hoje = moment(new Date()).format("ddd");
        let arrayRestAberto = [];
        let arrayRestFechado = [];
        await Promise.all(newArray.map( async (item, index) => {
            await Promise.all(item.modeloNegocio.map( (mdn, index) => {
                if (mdn.status && (mdn.diasAceitacao[hoje+'Dia'] || mdn.diasAceitacao[hoje+'Noite'])) {
                    return arrayRestAberto.push(item);
                }else{
                    return arrayRestFechado.push(item);
                }
            }));
        }));

        arrayRestAberto = arrayRestAberto.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null))

        arrayRestAberto.map( (item, index) => {
            if (item.distance) {
                newlist.push(item)
            }
        });
        newlist = newlist.sort((a, b) => {
            let aDist = a.distance ? a.distance.replace(/[^\d]+/g, '') : "0";
            let bDist = b.distance ? b.distance.replace(/[^\d]+/g, '') : "0";
            return parseFloat(aDist) - parseFloat(bDist)
        })
        
        let total = newlist;
        total = total.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null));
        this.setState({
            appliedFilters: total,
            localizacao: true,
            loading: false
        })   

        let form = {
            restaurantes: total,
            error: false,
            cidade: true
        }
        this.props.storageRestaurants(form);
        Events.publish("LoadRestaurants")
        Events.publish("LocationLoaded");
        Events.publish("UpdateCityName")
  
    }

    componentWillUnmount() {
        this._isMounted = false;
        
    }

    selectedRestaurant(item){
        this.props.navigation.navigate("Restaurant", { restaurant: item } )
    }
    
    
    novoTarja(data){
        const now = new Date(); // Data de hoje
        const past = new Date(data); // Outra data no passado
        const diff = Math.abs(now.getTime() - past.getTime()); // Subtrai uma data pela outra
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 50) {  
            return(
                <Text style={[styles.detailsRestaurante, {color: COLOR.SECONDARY}]}>Novo!</Text>
            );
        }else{
            return null;
        }
    }


    render(){
        let { appliedFilters, localizacao } = this.state;
        if (appliedFilters) {
        return(
            <View style={styles.flex1}>
                <Pageheader title={"PERTOS DE MIM"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                {this.state.localizacao == 'not allowed' ?
                    <Animated.View style={{opacity: this.state.fadeAllowLocation, position: 'absolute', top:0, bottom: 0, right: 0, left: 0, zIndex: 2}}>
                        <View style={styles.flexMiddle}>
                            <Image style={styles.openMapImage} source={require('../assets/images/map.png')}/>
                            <Text style={styles.subtitlesDefault}>{'Não sabemos onde você está!\nPermita sua localização ou escolha\numa cidade, para poder usar o app.'}</Text>
                            <TouchableOpacity style={[styles.btnChooseCity, {width: '80%'}]} onPress={() => {this.getCurrentPositionAsync()}}>
                                <Text style={styles.withoutNetBtnLabel}>PERMITIR LOCALIZAÇÃO</Text>
                            </TouchableOpacity>
                            
                            {/* <TouchableOpacity style={[styles.btnChooseCityOutline, {width: '80%'}]} onPress={() => {this.setState({modal: true}); Events.publish("OpacityBottomTabFalse")}}>
                                <Text style={styles.withoutNetBtnLabelPrimary}>ATUALIZAR</Text>
                            </TouchableOpacity> */}
                        </View>
                    </Animated.View>
                : this.state.loading ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator />
                </View> :
                    <ScrollView ref='homeScroll' scrollEnabled={true} style={styles.flex1} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {appliedFilters ?
                        <View style={[styles.restauranteContentContainer1]}>
                            <Text style={styles.destaquesTitle}>Restaurantes</Text>
                            {appliedFilters.map((item, index) => {
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
                                                    <Text style={styles.detailsRestaurante}>{item.culinariaPrincipal.nomeTipo + " • "+ item.distance}</Text>
                                                </View>
                                                
                                            </View>

                                            <View style={styles.flexRowRestaurante}>
                                                <View style={styles.iconsContainer}>
                                                    { item.modeloNegocio && item.modeloNegocio[0] && item.modeloNegocio[0].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/acompanhado.png')}/> : null}
                                                    { item.modeloNegocio && item.modeloNegocio[1] && item.modeloNegocio[1].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/individual.png')}/> : null }
                                                    { item.modeloNegocio && item.modeloNegocio[2] && item.modeloNegocio[2].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/delivery.png')}/> : null}
                                                </View>
                                                <View style={styles.letrasDiasContent}>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.domDia || item.modeloNegocio[0].diasAceitacao.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.segDia || item.modeloNegocio[0].diasAceitacao.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.terDia || item.modeloNegocio[0].diasAceitacao.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.quaDia || item.modeloNegocio[0].diasAceitacao.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.quiDia || item.modeloNegocio[0].diasAceitacao.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.sexDia || item.modeloNegocio[0].diasAceitacao.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                                    <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.sabDia || item.modeloNegocio[0].diasAceitacao.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                            </TouchableOpacity>
                            )
                            })}
                        </View>
                        : null}
                    </ScrollView>
                } 

            </View>
        )
        }else{
            return(
                <View style={styles.flex1}>
                    <Pageheader title={"PERTOS DE MIM"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator color={COLOR.GREY} />
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    flexMiddle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
    subtitlesDefault: {
        fontSize: FONT.SMEDIUM,
        textAlign: 'center',
        color: COLOR.BLACK,
        paddingTop: 20
    },
    openMapImage:{
        height: responsiveHeight(30),
        width: responsiveHeight(30),
    },
    destaquesTitle: {
        fontSize: FONT.XLARGE,
        fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY,
        paddingHorizontal: 20,
        paddingBottom: responsiveHeight(1.5),
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    contentContainer: {
        paddingBottom: 80,
    },
    restauranteContentContainer1: {
        flex: 1,
        paddingTop: 10, 
        
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
        shadowRadius: 3.68,
        elevation: 8,
    },
    contentItem: {
        padding:5, 
        paddingRight:10, 
        flexDirection: 'row',
        flex: 1
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
    internoItemRestaurante: {
        paddingLeft: responsiveHeight(1.5),
        justifyContent: 'space-between',
        flex: 2.7
    },
    nameRestaurant:{
        paddingVertical: 2,
        fontSize: FONT.SMEDIUM,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
    },
    detailsRestaurante: {
        fontSize: FONT.XSMALL,
        paddingBottom: 2,
        color: COLOR.GREY,
    },
    iconModalidade: {
        height: 18,
        width: 18,
        // flex: 1
    },
    flexRowRestaurante: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },    
    letrasDiasContent: {
        flex: 1, 
        justifyContent: 'flex-end', 
        flexDirection: 'row'
    },
    letrasDias: {
        
        fontWeight: WEIGHT.FAT,
        paddingRight: 5
    },
    flex1: {
        flex: 1,
    },
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    restaurantesList: store.AuthReducer.restaurantesList,
    closeToMe: store.InfoReducer.closeToMe,
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageRestaurants }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CloseToMe);