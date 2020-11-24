// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Platform, ScrollView} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import * as Updates from 'expo-updates';
import VersionCheck from "react-native-version-check-expo";
import Constants from 'expo-constants';
import moment from 'moment/min/moment-with-locales'
import OneSignal from 'react-native-onesignal'; 
// LOCAL IMPORTS
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import Pageheader from '../components/Pageheader'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
moment.locale('pt-BR');

function myiOSPromptCallback(permission){
    // do something with permission value
    console.log('permission', permission);
}

export default class About extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        OneSignal.setLogLevel(6, 0);
        // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
        OneSignal.init("e64cdb2b-0208-4a41-8dfc-ba4be06760c3", {kOSSettingsKeyAutoPrompt : false, kOSSettingsKeyInAppLaunchURL: false, kOSSettingsKeyInFocusDisplayOption:2});
        OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.
        
        // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
        OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
        this.state = { 
            novo: "- Agora você pode usar o Rota sozinho, acompanhado, no delivery ou pegando no balcão! Do jeito que você quiser.\n- Visual totalmente novo, mais bonito, mais rápido e mais prático!\n- Agora o cardápio está nas pontas dos dedos. Você conhece o restaurante, seus serviços e até o seu cardápio..\n- Geolocalização! Um clique e você confere os restaurantes mais próximos de você, facilitando até na validação do desconto.\n- E claro, corrigimos bugs relacionados a assinaturas de planos. Assine com mais segurança, transparência e confiança.\n - Implementado o módulo de Indicação de amigos\n",
            notification: ""
        }
    }

    componentDidMount(){
        this._isMounted = true;

        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);
        if (this._isMounted) {
            if (Platform.OS == "ios"){
                this.setState({
                    ver: Platform.Version.substr(0, Platform.Version.indexOf("."))
                });
            }
            let agora = moment();
            let hoje = (moment(agora).format('ddd')).toLowerCase();
            let hora = (moment(agora).format('HH:mm')).toString();
            this.setState({
                hour: hoje + " " + hora
            })
        }

    }

    onReceived(notification) {
        console.log("Notification received: ", notification);
        this.setState({
            notification
        })
    }

    onOpened(openResult) {
        this.setState({
            openResult
        })
        console.log('Message: ', openResult.notification.payload.body);
        console.log('Data: ', openResult.notification.payload.additionalData);
        console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);
    }

    onIds(device) {
        this.setState({
            device
        })
        console.log('Device info: ', device);
    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    async checkUpdate() {
        let udt = null;
        await this.setState({ checking: true });

        try {
        const res = await VersionCheck.needUpdate();
        console.log(`Printing Res Info App`, res)

        if (res && res.isNeeded) {
            await this.setState({ update: true, checking: false, store: true });
        } else {
            udt = await Updates.checkForUpdateAsync();
            if (udt.isAvailable)
            await this.setState({ update: true, checking: false });
            else
            await this.setState({ update: false, checking: false, finished: true });
        }

        } catch (e) {
        console.log(e);
        await this.setState({ checking: false, update: false, updating: false });
        }

    }

    async update() {
        if (this.state.store) Linking.openURL(await VersionCheck.getStoreUrl());
        else {
            this.setState({ update: false, updating: true });
            Updates.reload();
        }
    }

    render(){
        return(
            <View style={[def_styles.d_flex_1, ]}>
                <Pageheader title={"SOBRE O APP"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <ScrollView contentContainerStyle={[ def_styles.p_b_150, {paddingTop: 10}]}>
                    <View style={[def_styles.d_flex_complete_center]}>
                        <Image source={IMAGES.logoDourada} style={styles.logoSize}/>
                        <Text style={styles.title}>Versão do App {Constants.manifest.version}</Text>
                        <Text style={styles.subtitle}>O que há de novo por aqui:</Text>
                        <View style={styles.contentNovo}>

                            <Text style={styles.novo}>{this.state.notification}</Text>
                            <Text style={styles.novo}>{this.state.novo}</Text>
                            <Text style={styles.novo}>{this.state.device}</Text>
                            <Text style={styles.novo}>{this.state.openResult}</Text>
                        </View>
                        <View style={def_styles.flexRow}> 

                            <Image style={styles.imageSo} source={ Platform.OS == "ios" ? require('../assets/icons/apple_os.png') : require('../assets/icons/android.png') } />
                            <TouchableOpacity onPress={() => Updates.reloadAsync()} style={styles.padding20} >
                                <Image style={styles.refresh} resizeMode="contain" source={require("../assets/perfil/reload.png")} />
                            </TouchableOpacity>
                        </View>
                            <Text style={{textAlign: "center", fontSize: 9, color: "#CACACA"}}>{server.url}</Text>
                            <Text style={{textAlign: "center", fontSize: 9, color: "#CACACA"}}>{this.state.hour}</Text>
                        
                    </View>
                </ScrollView>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    contentNovo: {
        backgroundColor: COLOR.WHITE,
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 5,

    },
    title: {
        fontSize: FONT.SMEDIUM,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        padding: 20,  
    },
    subtitle: {
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
        fontWeight: WEIGHT.THIN,
        paddingBottom: 20,
    },
    novo:{
        fontSize: FONT.LABEL,
        lineHeight: FONT.SMEDIUM,
        fontWeight: WEIGHT.THIN,
    },
    padding20: {
        padding: 20,  
    },
    refresh: {
        height: 25, 
        width: 25
    },
    imageSo: {
        height: 30, 
        width: 30, 
        marginVertical: 15,
        marginHorizontal: 20
    },
    logoSize:{
        height: 70,
        width: 70,
    },
    bgWhiteGrey:{
        backgroundColor: COLOR.BACKGROUND,
    },
});