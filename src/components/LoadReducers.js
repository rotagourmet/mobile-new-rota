// LIBS IMPORTS
import React, { Component } from 'react'; 
import {
    View, 
    Text, 
    Dimensions, 
    Image, 
    AsyncStorage, 
    Platform 
} from 'react-native';
import moment from 'moment/min/moment-with-locales'
// EXPO IMPORTS
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
// REDUX IMPORTS
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import { 
    storageUserData, 
    storageUserToken, 
    storageRestaurants, 
    storageVouchers,
    storageSelectedCity, 
    storageCategorias,
    storageSubscription,
} from '../actions';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
// CONSTS DECLARING
const server = getApi('api');
const { width, height } = Dimensions.get('window');
let aController = new AbortController();
let signal = aController.signal;
moment.locale('pt-BR');

class LoadReducer  extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        
    }

    configSelectedCity(){
        AsyncStorage.getItem("cidade").then((response) =>{
            if(response){
                this.setState({
                    selectedCity: response
                })
                this.listCategory();
                this.listByCity();
            }
        })
    }

    configSelectedCity2(){
        AsyncStorage.getItem("cidade").then((response) =>{
            if(response){
                this.setState({
                    selectedCity: response
                })
                this.getInfoFromStorage();
            }
        })
    }

    async componentDidMount() {
        this._isMounted = true;
        this.UpdateSelectedCity = Events.subscribe('UpdateSelectedCity', () => { 
            this.configSelectedCity();
            this.onRefreshUserInfo(this.props.userData);
            this.loadSubscriptionData(this.props.userData)
        });
        this.UpdateVouchers = Events.subscribe('UpdateVouchers', () => { 
            this.listVouchers();
        });
        this.RefreshRouters = Events.subscribe('RefreshRouters', () => { 
            this.configSelectedCity();
        });
        if (this._isMounted) {
            let userData = await this.props.userData
            let userToken = await this.props.userToken
            this.configSelectedCity2();

            this.setState({
                token: this.props.userToken ? await this.props.userToken : this.props.token,
                user: this.props.userData ? await this.props.userData : this.props.user ? JSON.parse(this.props.user) : null
            })
            if (typeof userData == 'string' || userData instanceof String){
                userData = await JSON.parse(userData);
            }
            
            this.props.storageUserData(userData);
            this.props.storageUserToken(userToken);
            this.onRefreshUserInfo(userData);
            this.loadSubscriptionData(userData);
            // this.storagePlatform(userData);
        }
    }

    async listCategory(){
        //Requisição de Lista categorias
        let response = await fetch(server.url + `category/list`);
        response = await response.json();
        if (response.error) {
            this.props.storageCategorias(null);
        } else {
            AsyncStorage.setItem("categorias", JSON.stringify(response.category))
            this.props.storageCategorias(response.category);
        }
    }

    async listVouchers() {
        let userInfo;
        userInfo = this.state.user;
        if (typeof userInfo == 'string' || userInfo instanceof String){
            userInfo = await JSON.parse(userInfo);
        }
        if (userInfo && userInfo._id) {
            let vouchers = await fetch(server.url + 'api/voucher/list/' + userInfo._id + "?token=" + this.state.token)
            vouchers = await vouchers.json();
            this.props.storageVouchers(vouchers)
            if(vouchers){
                Events.publish("LoadVouchers");
            }
        }
    }

    getInfoFromStorage(){
        AsyncStorage.multiGet(["restaurantes", "vouchers", "categorias", "storageUpdate"]).then(data => {
            let restaurantes = data[0][1] ? JSON.parse(data[0][1]) : null;
            let vouchers = data[1][1] ? JSON.parse(data[1][1]) : null;
            let categorias = data[2][1] ? JSON.parse(data[2][1]) : null;
            let storageUpdate = data[3][1] ? JSON.parse(data[3][1]) : null;
            let agora = moment();
            if(storageUpdate){
                storageUpdate = moment(storageUpdate);
            }
            let diff = agora.diff(storageUpdate, 'days');
            if(restaurantes && vouchers && categorias && storageUpdate && diff < 7){
                console.log('ENTROU NO STORAGE');
                this.props.storageRestaurants(restaurantes);
                this.props.storageVouchers(vouchers);
                this.props.storageCategorias(categorias);
                Events.publish("LoadRestaurants")
                Events.publish("LoadVouchers")
                Events.publish("LocationLoaded");
                Events.publish("UpdateCityName")
            }else{
                this.listCategory();
                this.listByCity();
            }
        })
    }

    async listByCity(){
        let newArray = [];
        const city = this.state.selectedCity;
        let token = this.props.userToken ? await this.props.userToken : this.props.token;
        let userData = await this.props.userData
		if (typeof userData == 'string' || userData instanceof String){
			userData = await JSON.parse(userData);
		}

        if(this.state.selectedCity){
            let infos = {
                "user": userData && userData._id,
                "city": this.state.selectedCity,
                "os": Platform.OS,
                "version": Platform.Version,
                "appVersion": Constants.manifest.version,
                "model": Constants.deviceName,
            }
            //Requisição de listar todas as infos necessárias para iniciar o App
            let response = await fetch(server.url + `api/apphome?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(infos)
            });
            response = await response.json();
            this.props.storageRestaurants(response.restaurantes);
            this.props.storageVouchers(response.vouchers);
            AsyncStorage.multiSet([
                ["restaurantes", JSON.stringify(response.restaurantes)], 
                ["vouchers", JSON.stringify(response.vouchers)],
                ["storageUpdate", JSON.stringify(new Date())],

            ])
            Events.publish("LoadRestaurants")
            Events.publish("LoadVouchers")
            Events.publish("LocationLoaded");
            Events.publish("UpdateCityName")
            
        }else{
            // ENTRA NESTA CONDIÇÃO CASO NÃO HAJA CIDADE PARA BUSCAR
            let form = {
                error: false,
                cidade: false,
                restaurantes: []
            }
            this.props.storageRestaurants(form);
        }
    }

    async loadSubscriptionData(userData){
        if (userData && userData._id) {
            //Requisição de Search for Subscription
            let response = await fetch(server.url + `api/subscription/listByUser/${userData._id}?token=${this.state.token}`);
            response = await response.json();
            if (!response.error) {
                this.props.storageSubscription(response.subscription)
            }
        }
    }

    async onRefreshUserInfo(userData){
        if (userData && userData._id) {
            //Requisição de atualizar o usuario
            let response = await fetch(server.url + `api/user/atualiza/${userData._id}?token=${this.state.token}`);
            response = await response.json();
            if (!response.error) {
                AsyncStorage.setItem("user", JSON.stringify(response.user));
                this.props.storageUserData(response.user);
            }
        }
    }

    render(){
        return(
            <View style={{backgroundColor: '#161616', position: 'absolute', zIndex: 1000, top: 0, right: 0, left: 0}}>
                <Image 
                    style={{width: '100%', height: '90%'}}
                    source={require('../assets/images/Splash_pic.png')}
                />
            </View>
        )
    }
}


const mapStateToProps = store => ({
  userData: store.AuthReducer.userData,
  userToken: store.AuthReducer.userToken,
  selectedCity: store.InfoReducer.selectedCity
  
});

const mapDispatchToProps = dispatch => bindActionCreators({ 
    storageUserData, 
    storageUserToken, 
    storageRestaurants, 
    storageVouchers, 
    storageSelectedCity, 
    storageCategorias,
    storageSubscription
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoadReducer);