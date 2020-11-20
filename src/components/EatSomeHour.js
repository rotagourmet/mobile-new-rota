import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, AsyncStorage, ActivityIndicator, FlatList } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import moment from 'moment/min/moment-with-locales'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

import Localization from '../utils/Localization';
import Theme from '../constants/Theme';
import Events from '../utils/Events';
import { getApi } from '../environments/config'

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const SLIDER_1_FIRST_ITEM = 0;
const { height, width } = Dimensions.get('window')
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
moment.locale('pt-BR');

class EatSomeHour extends Component {

    _isMounted = false;

    constructor (props) {
        super(props);
        this.state = {
            network: true,
            food: null,
            foodLoading: false,
            token: '',
            fadeFood: new Animated.Value(0),
            loadedDiv: false,
            locationPermission: true,
        };
    }

    _getLocationAsync = async () => {
        let local = await Localization.getCurrentLocation();

        if (local && local.locationPermission) {    
            return local.localizacao;
        }else{
            this.setState({ locationPermission: local.locationPermission})
        }
    };

    fadeOutFood() {
        setTimeout(() => {
            Animated.timing(this.state.fadeFood, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
            });
        }, 0);
    }

    middleFadeInFood() {
        Animated.timing(this.state.fadeFood, { toValue: 120, duration: 500, useNativeDriver: false}).start();
    }

    fadeInFood() {
        Animated.timing(this.state.fadeFood, { toValue: 213, duration: 500, useNativeDriver: false }).start();
    }

    async startPoint(){

        const hora = (moment().format('HH:mm')).toString();
        const noiteHora = Number(hora[0] + hora[1]);
        
        if (noiteHora < 18) {
            this.foodApi();
        }
         
    }
    
    componentDidMount(){ 
        this.updateHome = Events.subscribe('UpdateHome', () => { 
            this.setState({restaurantes: [], locationPermission: true})
            this.startPoint();
        });
        this.LoadRestaurants = Events.subscribe('LoadRestaurants', () => this.foodApi() );
        this._isMounted = true;
        if (this._isMounted) {
            this.startPoint();
        }   
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    async foodApi (){
        this.setState({foodLoading: true});
        let { restaurantesList } = this.props;
        let agora = moment();
        let hoje = (moment(agora).format('ddd')).toLowerCase();
        let hora = (moment(agora).format('HH:mm')).toString();
        let arrayRestaurants = []
        if (restaurantesList && restaurantesList.restaurantes) {

            if (this.props.time == 'eatTonight') {
                await Promise.all(restaurantesList.restaurantes.map((item, index) => {
                    if(item.status){
                        item.modeloNegocio.map( (mdn, index) => {
                            if (mdn.status) {    
                                if(mdn.diasAceitacao[hoje+"Inicio"] >= '18:00'){
                                    arrayRestaurants.push(item)
                                    this.setState({
                                        ["foodImgOpacity_" + item._id]: new Animated.Value(0),
                                        ["foodLogoOpacity_" + item._id]: new Animated.Value(0)
                                    })
                                }
                            }
                        })
                    }
                }));
            }else{
                await Promise.all(restaurantesList.restaurantes.map( (item, index) => {
                    if(item.status){
                        item.modeloNegocio.map( (mdn, index) => {
                            if (mdn.status) {    
                                if(mdn.diasAceitacao[hoje+"Inicio"] <= hora && mdn.diasAceitacao[hoje+"Fim"] <= '18:00'){
                                    arrayRestaurants.push(item)
                                    this.setState({
                                        ["foodImgOpacity_" + item._id]: new Animated.Value(0),
                                        ["foodLogoOpacity_" + item._id]: new Animated.Value(0)
                                    })
                                }
                            }
                        })
                    }
                }));
            }
        }
        arrayRestaurants = arrayRestaurants.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null))

        if (arrayRestaurants.length > 3) {
            this.middleFadeInFood();
            this.setState({ food: arrayRestaurants });
            setTimeout(() => {
                this.fadeInFood();
                this.setState({foodLoading: false, loadedDiv: true})
            }, 300);
        }else{
            this.setState({ food: null, foodLoading: false })
            this.fadeOutFood();
        }
    }

    onLoad(event){
        Animated.timing(this.state[event], {
            toValue: 1,
            duration: 800,
            useNativeDriver: false
        }).start();
    }

    handleLazyLoadComerAgora = ({ viewableItems }) => {
        const newData = this.state.food.map(image =>
        viewableItems.find(({ item }) => item._id === image._id)
            ? { ...image, loaded: true }
            : image
        );

        this.setState({ food: newData });
    }

    scrollTo = (cardID, item) => {
        this.refs["myFlatList"].scrollToIndex({viewPosition: 0, index: cardID});   
        setTimeout(() => {
            this.props.navigation.navigate("Restaurant", { restaurant: item});
        }, 100);
    }

    render(){
        if (this.state.food) {  
        return (
            <Animated.View style={[{ height: this.state.fadeFood,}, styles.comerAgoraContentContainer1]}>
            {this.state.loadedDiv ? <View style={styles.divisao} /> : null}
              <Text style={styles.categoriasTitle}>{this.props.title}</Text>
              <View style={styles.contentComerAgora} >
                <View style={styles.flexRow}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    { this.state.foodLoading ? <ActivityIndicator style={{paddingTop: 30}} size="large"/> :
                    <FlatList 
                        ref={"myFlatList"}
                        horizontal={true}
                        data={this.state.food}
                        ListFooterComponent={<View style={{width:55}}></View>}
                        keyExtractor={( item, index ) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={this.handleLazyLoadComerAgora}
                        onEndReachedThreshold={.7}
                        renderItem={({ item, index }) => {
                        let stateImg = "foodImgOpacity_" + item._id
                        let stateLogo = "foodLogoOpacity_" + item._id
                        return (
                            <TouchableOpacity key={index} style={styles.comerAgoraBox} onPress={() => {
                                 
                                this.scrollTo(index, item)}}>
                                <View style={styles.sombraPadrao}>
                                    <ActivityIndicator  size="small" style={styles.activityImage} color={COLOR.WHITE}/>
                                    <View style={{position: 'absolute', left: 20}}>
                                    <Image
                                        style={styles.comerAgoraBoxImage}
                                        source={require('../assets/images/placeholder.png')}
                                    />
                                    </View>
                                    <Animated.Image onLoad={() => this.onLoad(stateImg)} source={{uri: item.restaurante.fotoRepresentativa}} style={[styles.comerAgoraBoxImage, {opacity: this.state["foodImgOpacity_" + item._id]}]} />
                                    <Animated.Image onLoad={() => this.onLoad(stateLogo)} source={{uri: item.restaurante.logo}} style={[styles.comerAgoraBoxLogo,  {opacity: this.state["foodLogoOpacity_" + item._id]}]} />
                                </View>
                                <View style={styles.comerAgoraBoxContentText}>
                                    <Text numberOfLines={2} ellipsizeMode='tail' style={styles.comerAgoraBoxText}>{item.nomeUnidade}</Text>
                                </View>
                            </TouchableOpacity>
                        )}}
                    />}
                    </View>
                </View>
              </View>
            </Animated.View>
        );
        }else{
            return(<View/>)
        }
    }
}

const styles = StyleSheet.create({
    divisao: {
        borderTopWidth: 0.7,
        borderTopColor: '#DCDCDC', 
        marginBottom: 10, 
        marginTop: 10
    },
    activityImage: {
        position: 'absolute', 
        top: '42%', 
        left: '70%', 
        zIndex: 10
    },
    categoriasTitle: {
        fontSize: FONT.XMLARGE,
        fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY,
        paddingHorizontal: 20,
        paddingTop: responsiveHeight(1.5),
    },
    flexRow: {
        flexDirection: 'row'
    },
    comerAgoraBoxContentText: {
        paddingTop: 15,
        paddingLeft: 20
        // justifyContent: 'flex-end',
    },
    comerAgoraBoxText: {
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    comerAgoraContentContainer1: {
        flex: 1,
        // paddingTop: 10,
    },
    comerAgoraBoxLogo: {
        position: 'absolute',
        bottom: "-12%",
        right: -20,
        height: 35,
        width: 35,
        borderRadius: 40,
        zIndex: 16
    },
    sombraPadrao: {
        paddingLeft: 20,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.36,
        shadowRadius: 4.68,
        elevation: 11,
    },
    comerAgoraBoxImage: {
        height: 85,
        width: 85,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderRadius: 10,
        zIndex: 15
    },
    comerAgoraBox: {
        paddingTop:20,
        width: 95,
        borderRadius: 7,

        marginRight: 10

    },
});

const mapStateToProps = store => ({
  userToken: store.AuthReducer.userToken,
  city: store.AuthReducer.city,
  restaurantesList: store.AuthReducer.restaurantesList,
});

export default connect(mapStateToProps )(EatSomeHour);