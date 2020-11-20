import React, { Component } from 'react';
import { ActivityIndicator, Linking, Animated, View, Keyboard, Alert, Image, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import { responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import LottieView from "lottie-react-native";
import { getApi } from '../environments/config'
import Theme from '../constants/Theme';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { connect } from 'react-redux';
import Constants from 'expo-constants';
import Events from '../utils/Events';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class StartupApp extends Component {
    constructor(props){
        super(props);
        this.state = {
            fadeValueWelcome: new Animated.Value(0),
            welcomeContainer: true,

            fadeValueLocation: new Animated.Value(0),
            locationContainer: false,

            fadeValueNotify: new Animated.Value(0),
            notifyContainer: false,
            
            loadingHome: false,
            terms: false,
        }
    }

    componentDidMount() {
        let server = getApi('api')
        this.welcomeFadeIn();
        let name = this.props.userData.name ? this.props.userData.name : 'Lucas Spirandeli';
        name = name.split(' ');
        this.setState({
            server: server.url,
            name: name[0] + '!'
        });
    }
    
    openTerms = () => {
        Linking.openURL('https://file-upload-rota.s3.amazonaws.com/arquivos/Termos+de+Uso.pdf');
    };

    welcomeFadeIn = () => {
        Animated.timing(this.state.fadeValueWelcome, { toValue: 1, duration: 2000, useNativeDriver: false}).start();
    };

    welcomeFadeOut = () => {
        Animated.timing(this.state.fadeValueWelcome, { toValue: 0, duration: 500, useNativeDriver: false}).start();
    };

    locationFadeIn = () => {
        Animated.timing(this.state.fadeValueLocation, { toValue: 1, duration: 500, useNativeDriver: false}).start();
    };

    locationFadeOut = () => {
        Animated.timing(this.state.fadeValueLocation, { toValue: 0, duration: 500, useNativeDriver: false}).start();
    };

    notifyFadeIn = () => {
        Animated.timing(this.state.fadeValueNotify, { toValue: 1, duration: 500, useNativeDriver: false}).start();
    };

    notifyFadeOut = () => {
        Animated.timing(this.state.fadeValueNotify, { toValue: 0, duration: 2000, useNativeDriver: false}).start();
    };

    getLocation = async () => {
        const { status: existingStatus } = await Permissions.getAsync( Permissions.LOCATION );
        let finalStatus = existingStatus;
        let viewNotify = true;
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (existingStatus !== 'granted' && status !== 'granted') {
            finalStatus = status;
            this.setState({
                localizacao: 'not allowed'
            })

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
            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocodeAsync = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude});

            if(reverseGeocodeAsync && reverseGeocodeAsync[0]){
                let form = {
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
                //Requisição de registar informações do localizacao
                let response = await fetch(this.state.server + `api/user/locationData?token=` + this.props.userToken, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({_id: this.props.userData._id, location: form})
                });
                response = await response.json();
                if (response && response.error) {
                    this.setState({loading: false}); 
                    
                }else{

                    this.setState({loading: false}); 
                }
            }
            this.setState({ location, localizacao: reverseGeocodeAsync[0] });
            this.showNotifyView();
        }
    };

    async authPushNotificationsAsync() {
        this.setState({loading: true}); 
        const { status: existingStatus } = await Permissions.getAsync( Permissions.NOTIFICATIONS );
        let finalStatus = existingStatus;
        let tokenNotification;
        let viewNotify = true;
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        if (existingStatus !== 'granted' && status !== 'granted') {
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
                this.setState({loading: false});
            }
        }else{
            tokenNotification = await Notifications.getExpoPushTokenAsync();
            // Get the token that identifies this device
            let data = {
                "os": Platform.OS,
                "version": Platform.Version,
                "pushToken": tokenNotification ? tokenNotification : null,
                "appVersion": Constants.manifest.version,
                "model": Platform.OS == 'ios' ? Constants.platform.ios.model : Constants.deviceName,
            }
            //Requisição de registar informações do telefone
            let response = await fetch(this.state.server + `api/user/notifyData?token=` + this.props.userToken, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({_id: this.props.userData._id, data})
            });
            response = await response.json();
            if (response && response.error) {
                this.setState({loading: false}); 
                this.showLoadingHomeView();
                
            }else{
                this.setState({loading: false}); 
                this.showLoadingHomeView();
            }
        }
        
    }

    goToHome(){
        Events.publish("RefreshRouters");
    }

    showLocationView(){
        this.welcomeFadeOut();
        setTimeout(() => {
            this.setState({
                welcomeContainer: false,
                locationContainer: true,
                terms: false
            })
            this.locationFadeIn();
        }, 500);
    }

    showNotifyView(){
        this.locationFadeOut();
        setTimeout(() => {
            this.setState({
                notifyContainer: true,
                locationContainer: false,
            })
            this.notifyFadeIn();
        }, 500);
    }
    showLoadingHomeView(){
        this.notifyFadeOut();
        setTimeout(() => {
            this.setState({
                notifyContainer: false,
                loadingHome: true,
            })
            this.notifyFadeIn();
        }, 500);
    }
    

    render(){
        let { name, welcomeContainer, locationContainer, notifyContainer, terms, loadingHome } = this.state;
        return (
            <View style={styles.wholeContent}>
                
                {/* WELCOME */}
                {welcomeContainer ?
                <Animated.View style={[ styles.animatedContainerWelcome, { opacity: this.state.fadeValueWelcome } ]}>
                    <Text style={styles.nameWelcome}>{name}</Text>
                    <Text style={styles.titleWelcome}>Seja bem-vindo ao Rota Gourmet!</Text>
                    <TouchableOpacity onPress={() => this.showLocationView()} style={styles.btnContainer}>
                        <Text style={styles.btnLabel}>ENTRAR</Text>
                    </TouchableOpacity>
                </Animated.View>
                : null}

                {/* LOCATION */}
                {locationContainer ? 
                <Animated.View style={[ styles.animatedContainerWelcome, { opacity: this.state.fadeValueLocation } ]}>
                    <Text style={styles.locationMainTitle}>Localização</Text>
                    <Text style={styles.locationSubTitle}>Precisamos da sua permissão para encontrar os melhores restaurantes do Rota Gourmet perto de você.</Text>
                    <LottieView
                            ref={animation => this.animation = animation}
                            loop={true}
                            autoPlay={true}
                            style={styles.locationImage}
                            source={require('../assets/animations/location.json')}
                    />
                    <TouchableOpacity onPress={() => this.getLocation()} style={styles.btnContainer}>
                        {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={styles.btnLabel}>PERMITIR LOCALIZAÇÃO</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={ () => this.showNotifyView()} style={styles.btnTransparentContainer}>
                        <Text style={styles.btnTransparentLabel}>PULAR</Text>
                    </TouchableOpacity>
                </Animated.View>
                :null}

                {/* NOTIFY */}
                {notifyContainer ? 
                <Animated.View style={[ styles.animatedContainerWelcome, { opacity: this.state.fadeValueNotify } ]}>
                    <Text style={styles.locationMainTitle}>Notificações</Text>
                    <Text style={styles.locationSubTitle}>{'Saiba tudo sobre os novos restaurantes, ofertas especiais e seus vouchers!\nPermite a gente aí vai :)'}</Text>
                    <LottieView
                            ref={animation => this.animation = animation}
                            loop={false}
                            autoPlay={true}
                            style={styles.locationImage}
                            source={require('../assets/animations/Notification.json')}
                    />
                    <TouchableOpacity onPress={() => this.authPushNotificationsAsync()} style={styles.btnContainer}>
                        {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :   <Text style={styles.btnLabel}>PERMITIR NOTIFICAÇÕES</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToHome()} style={styles.btnTransparentContainer}>
                        <Text style={styles.btnTransparentLabel}>PULAR</Text>
                    </TouchableOpacity>
                </Animated.View>
                :null}

                {loadingHome ?
                <View style={styles.animatedContainerWelcome}>
                    {/*  */}
                    <Text style={styles.locationMainTitle}>Aguarde...</Text>
                    <Text style={styles.locationSubTitle}>{'Estamos preparando tudo para você:)'}</Text>
                    <LottieView
                        ref={animation => this.animation = animation}
                        onAnimationFinish={() => {
                            setTimeout(()=>{ this.goToHome() }, 500);
                        }}
                        loop={false}
                        autoPlay={true}
                        style={styles.locationImage}
                        source={require('../assets/animations/success.json')}
                    />
                </View>
                : null}

                {terms ?
                <View style={styles.termosDeUso}>
                    <TouchableOpacity onPress={this.openTerms}>
                        <Text style={styles.labelTermosDeUso}>Ao se cadastrar você concorda com os nossos <Text style={styles.labelTermosDeUsoOrange}>termos de uso</Text> e <Text style={styles.labelTermosDeUsoOrange}>política de privacidade</Text></Text>
                    </TouchableOpacity>
                </View>
                : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    locationImage: {
        marginVertical: responsiveHeight(8),
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(25),
        width: responsiveHeight(25),
    },
    locationSubTitle: {
        fontSize: FONT.SMALL,
        textAlign: 'center',
        color: 'white'
    },
    locationMainTitle: {
        fontSize: FONT.XLARGE,
        fontWeight: WEIGHT.FAT,
        marginBottom: 10,
        textAlign: 'center',
        color: 'white'
    },
    labelTermosDeUso: {
        fontSize: FONT.MEDIUM,
        textAlign:'center',
        color: COLOR.WHITE,
    },
    labelTermosDeUsoOrange: {
        color: COLOR.PRIMARY,
    },
    termosDeUso: {
        flex: 0.8,
        justifyContent:'flex-start',
        alignItems:'center',
        
    },
    btnTransparentLabel: {
        color: COLOR.WHITE,
        fontSize: FONT.LABEL,
        textAlign: 'center',
    },
    btnLabel: {
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    btnTransparentContainer: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: responsiveHeight(2),
        // backgroundColor: COLOR.PRIMARY,
        width: '100%'
    },
    btnContainer: {
        color: COLOR.WHITE,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: responsiveHeight(5),
        backgroundColor: COLOR.PRIMARY,
        width: '100%'
    },
    titleWelcome: {
        fontSize: FONT.MEDIUM,
        textAlign: 'center',
        color: 'white'
    },
    nameWelcome: {
        fontSize: FONT.XXLARGE,
        marginBottom: 10,
        textAlign: 'center',
        color: 'white'
    },
    animatedContainerWelcome: {
        flex: 5,
        justifyContent: "center",
        alignItems: "center",
        width: '80%'
    },
    wholeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.BLACK,
        width: '100%'
    },
});

const mapStateToProps = store => ({
  userData: store.AuthReducer.userData,
  userToken: store.AuthReducer.userToken,
});

export default connect(mapStateToProps)(StartupApp);
