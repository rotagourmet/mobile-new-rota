import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, Alert, Dimensions, Image, AsyncStorage, ActivityIndicator } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Theme from '../constants/Theme';
import Events from '../utils/Events';
import Localization from '../utils/Localization';
import { getApi } from '../environments/config'

import { connect, useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageSelectedCity } from '../actions';
import ModalAlert from './ModalAlert';

const { height } = Dimensions.get('window')
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;


class SelectCity extends Component {
    
    _isMounted = false;
    closeValue;

    constructor(props){
        super(props);
        this.state = {
            cidades: [],
            enabled: false
        };
        this.closeValue = this.props.onCloseProps;
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            this.listCities();
        }
    }
    
    componentWillUnmount() {
        this._isMounted = false;
    }

    async getCurrentLocation() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        let form = {};
        if (status !== 'granted') {
            // await AsyncStorage.setItem("locationPermission", "false");
            form = {
                errorMessage: 'Permission to access location was denied',
                locationPermission: false,
            };
            
            Alert.alert(
                "Localização",
                "Se você deseja ativar sua localização, vá nas configurações do telefone e selecione para ativar Localização do Rota Gourmet.",
                [
                    {
                    text: "Tentar mais tarde",
                    onPress: () => null
                    },
                    { text: "Ir para Configurações", onPress: () => {Linking.openURL('app-settings:')} }
                ],
                { cancelable: false }
            );

            return form
        }

        await AsyncStorage.setItem("locationPermission", "true");
        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocodeAsync = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude});
        
        form = { location, localizacao: reverseGeocodeAsync[0], locationPermission: true };

        return form;
    }

    async listCities(){
        const server = getApi('api');
        let cities = await fetch(server.url + 'city/list');
        cities = await cities.json();
        if (cities && cities.cities && cities.cities.length > 0) {
            AsyncStorage.getItem("cidade").then((response) => {
                if (!response) {
                    AsyncStorage.getItem("locationPermission").then(async (res) => {
                        res = JSON.parse(res);
                        if (res) {    
                            this.setState({
                                selecionado: "atual"
                            })
                        }
                    })
                }else{
                    cities.cities.map((item, index) => {
                        if (response.includes(item.municipio)) {
                            this.setState({
                                selecionado: item.municipio
                            })
                        }
                    })
                }
            });
            this.setState({
                cidades: cities.cities
            })
        }
    };

    async apply(cidades){
        let form = {}
        
        if (this.state.selecionado != "atual") {
            cidades.map(async (item) => {
                if (this.state.selecionado.includes(item.municipio)) {
                    Events.publish("LoadingScreen");
                    form = item.municipio;
                    await AsyncStorage.setItem("cidade", form);
                    this.props.storageSelectedCity(form)
                    Events.publish("UpdateSelectedCity");

                    if (this.closeValue instanceof Function) {
                        this.closeValue(true);
                    }
                }
            })
        }else{
            this.props.storageSelectedCity(null)
            await AsyncStorage.removeItem("cidade")
            Events.publish("UpdateSelectedCity");
            
            if (this.closeValue instanceof Function) {
                this.closeValue(true);
            }
        }
    }

    selectAtual(){
        // AsyncStorage.multiGet(["locationPermission", "cidade"]).then(async (response) => {
        //     let locationPermission = response[0][1] ? JSON.parse(response[0][1]) : null;
        //     let cidade = response[1][1] ? JSON.parse(response[1][1]) : null;

        //     if (locationPermission) {
        //         this.setState({  selecionado: "atual", enabled: true, local: cidade})
        //     }else{
        //         this.setState({  selecionado: "atual", enabled: true})
        //         let local = await this.getCurrentLocation();
        //         if (local && !local.locationPermission) {
        //             this.setState({  selecionado: null, enabled: false})
        //         }
        //         this.setState({ local:  local.localizacao.city})
        //     }
        // });
    }

    render(){
        const { cidades } = this.state;
        return (
            <View style={styles.flex1}>
                <View style={styles.listContainer}>
                    {/* <TouchableOpacity style={styles.titleList} onPress={()=> this.setState({  selecionado: "atual", enabled: true})}>
                        <View style={styles.rowCenter}>
                            <Icon name='gps-fixed' type='material' color={this.state.selecionado == "atual" ? COLOR.SECONDARY : COLOR.GREY} size={25} />
                            <Text style={[this.state.selecionado == "atual" ? styles.selectedTxtList : styles.txtList, styles.ml5]}>Usar minha localização atual</Text>
                        </View>
                        {this.state.selecionado == "atual" ? <Image source={require('../assets/icons/correct.png')} style={styles.iconCorrect}/> : null}
                    </TouchableOpacity> */}
                    {cidades.map((item, index) => {
                        return (
                        <TouchableOpacity onPress={ () => this.setState({  selecionado: item.municipio, enabled: true})} key={item._id} style={[styles.titleList, styles.borderList]}>
                        <View style={styles.rowCenter}>
                            <Icon name='gps-fixed' type='material' color={this.state.selecionado == item.municipio ? COLOR.SECONDARY : COLOR.GREY} size={18} />
                            <Text style={this.state.selecionado == item.municipio ? styles.selectedTxtList : styles.txtList}>{item.municipio}</Text>
                        </View>
                            {this.state.selecionado == item.municipio ? <Image source={require('../assets/icons/correct.png')} style={styles.iconCorrect}/> : null}
                        </TouchableOpacity>
                    )})
                    }
                    {cidades.length < 1 ?
                        <View style={{flex: 1, justifyContent: "center", alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={COLOR.GREY} />
                        </View>
                    : null}
                </View>
                {/* <View style={styles.divisao} /> */}
                <View style={{flex: 1, marginLeft: 25, marginRight: 25, marginBottom: 130}}>
                    <TouchableOpacity style={this.state.enabled ? styles.btn : styles.btnDisable} onPress={() => { this.state.enabled ? this.apply(cidades): null}}>
                        <Text style={styles.btnLabel}>APLICAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    rowCenter: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    ml5: {
        marginLeft: 10
    },
    iconCorrect: {
        height: responsiveHeight(2),
        width: responsiveHeight(2),
    },
    flex1: {
        flex: 1,
        paddingTop: 20,
        
    },
    selectedTxtList: {
        paddingLeft: 10,
        color: COLOR.SECONDARY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
    },
    txtList: {
        paddingLeft: 10,
        color: COLOR.GREY,
        fontSize: FONT.SMEDIUM,
    },
    borderList: {
        borderTopWidth: 0.2,
        borderTopColor: '#999ca5',
        // paddingTop: 20,
    },
    titleList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        // paddingTop: 20,
    },
    iconTarget: {
        height: responsiveHeight(3),
        width: responsiveHeight(3),
        marginRight: 10,
    },
    listContainer: {
        flex: 1,
        marginLeft: 25,
        marginRight: 25
    },
    divisao: {
        borderTopWidth: 0.7,
        borderTopColor: '#DCDCDC', 
        // marginHorizontal: 18, 
        marginTop: 10
    },


    btnLabel: {
        fontSize: FONT.SMALL,
        textAlign: 'center',
        color: COLOR.WHITE,
        
        fontWeight: WEIGHT.FAT
    },
    btn: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: COLOR.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        // marginBottom: 60,
    },
    btnDisable: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: COLOR.PRIMARY_DISABLED,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        // marginBottom: 60,
    }
})

const mapStateToProps = store => ({
  userToken: store.AuthReducer.userToken,
  
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageSelectedCity }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(SelectCity);