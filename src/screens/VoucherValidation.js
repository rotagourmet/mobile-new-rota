import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Vibration, Dimensions, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Image, Animated, TextInput, Keyboard, Alert } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { TextInputMask } from 'react-native-masked-text';
import Toast from 'react-native-easy-toast';
import { connect } from 'react-redux';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import def_styles from '../assets/styles/theme.styles'
import Pageheader from '../components/Pageheader'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');
const { width } = Dimensions.get('window');

class VoucherValidation extends Component {

    _isMounted = false;
    constructor(props) {
        super(props);
        this.onBarCodeRead = this.onBarCodeRead.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scannedCode = null;

        this.state = {
            shakeAnimation: new Animated.Value(0),
            shakeAnimation2: new Animated.Value(0),
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
        };
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            let { currentRestaurant } = this.props;
            this.requestCamera();
        }
    }

    startShake = () => {
        Animated.sequence([
            Animated.timing(this.state.shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    }
    
    startShake2 = () => {
        Animated.sequence([
            Animated.timing(this.state.shakeAnimation2, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation2, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation2, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation2, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async requestCamera(){
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        await this.setState({hasCameraPermission: status === 'granted'});
        await this.resetScanner();
    }

    resetScanner() {
        this.scannedCode = null;
        this.setState({
            qrcodeErro: false,
            scannedItem: {
                type: null,
                data: null
            }
        });
    }

    renderAlert(title, message) {
        Alert.alert(
        title,
        message,
        [
            { text: 'OK', onPress: () => this.resetScanner() },
        ],
        { cancelable: true }
        );
    }

    onBarCodeRead({ type, data } ) {
        if ((type === this.state.scannedItem.type && data === this.state.scannedItem.data) || data === null) {
            return;
        }

        Vibration.vibrate();
        this.setState({ scannedItem: { data, type } });

        
        if ((type instanceof String || typeof type === "string") && type.startsWith('org.gs1.EAN')) {
        // Do something for EAN
            this.resetScanner();
            // this.props.navigation.navigate('YOUR_NEXT_SCREEN', { ean: data });
        } else if ((type instanceof Number || typeof type === "number") || type.startsWith('org.iso.QRCode')) {
            // Do samething for QRCode
            let { currentRestaurant } = this.props;
            if (currentRestaurant.qrcode === data || currentRestaurant._id === data) {
                this.props.navigation.navigate('VoucherValidated');
            } else {
                this.startShake2();
                this.setState({
                    hasCameraPermission: false
                })
                Alert.alert(
                    "OPS",
                    "O QRCode apresentado não pertence ao restaurante selecionado.",
                    [
                        { text: 'OK', onPress: () => {this.resetScanner(); this.setState({hasCameraPermission: true})} },
                    ],
                    { cancelable: true }
                );        
            }
            this.resetScanner();
        } else {
        this.renderAlert(
            'This barcode is not supported.',
            `${type} : ${data}`,
        );
        }
    }

    renderMessage() {
        if (this.state.scannedItem && this.state.scannedItem.type) {
            const { type, data } = this.state.scannedItem;
            return (
                <Text style={styles.scanScreenMessage}>
                {`Scanned \n ${type} \n ${data}`}
                </Text>
            );
        }
        return <Text style={styles.scanScreenMessage}>Focus the barcode to scan.</Text>;
    }

    verifyFields(){
        if (this.state.codigo && this.state.codigo.length === 5) {
            
            let { currentRestaurant } = this.props;
            if (currentRestaurant.qrcode === this.state.codigo || currentRestaurant._id === this.state.codigo) {
                this.props.navigation.navigate('VoucherValidated');
                
            } else { 
                this.setState({
                    errorCodigoMessage: "O código inserido não é deste restaurante.",
                })
                this.startShake()
            }
        } else {
            this.refs.toast.show("Insira o código do Restaurante para validar", 5000);
            this.setState({
                errorCodigoMessage: "Insira um código do Restaurante valido",
            })
            this.startShake()
        }
    }

    render(){
        const { hasCameraPermission, qrcodeErro } = this.state;
        return(
            <View style={{flex: 1}}>
                <ScrollView ref='homeScroll' scrollEnabled={true} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <Pageheader title={"VALIDAÇÃO"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: null, })}>
                        <View style={[def_styles.m_t_10, styles.contentCamera]}>
                        {hasCameraPermission === false || hasCameraPermission === null ? 
                            <TouchableOpacity onPress={() => this.requestCamera()}>
                                <Image source={require('../assets/images/placeholderCamera.jpg')} style={styles.contentCamera}/>
                            </TouchableOpacity>
                            :
                            <Animated.View style={[ styles.animatedShake, { transform: [{translateX: this.state.shakeAnimation2}] }]}>  
                                <View style={{ flex: 1 }}>
                                    <BarCodeScanner
                                        onBarCodeScanned={this.onBarCodeRead}
                                        style={styles.contentCamera}
                                    />
                                </View>
                            </Animated.View>
                        }
                        </View>
                        { hasCameraPermission === false || hasCameraPermission === null ? <Text style={{textAlign: 'center', fontSize: FONT.LABEL, padding: 10, color: COLOR.GREY}}>Para ativar o leitor de QRCode acesse as configurações do seu telefone, selecione o Aplicativo do Rota e habilite o acesso à câmera</Text> : null}
                        <View style={[def_styles.p_h_25, def_styles.p_t_10]}>
                            <Animated.View style={[ styles.animatedShake, { transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                <Text style={{fontSize: FONT.XSMALL, color: COLOR.GREY, width: '100%',}}>Código do Restaurante</Text>
                                <View style={styles.txtInputContainer2}>
                                    <TextInput
                                        ref={'codigo'}
                                        maxLength={5}
                                        autoCapitalize={'characters'}
                                        style={[styles.txtInputContent, { fontSize: FONT.LARGE, color: this.state.errorCodigoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                        placeholder={""}
                                        value={this.state.codigo}
                                        returnKeyType={'done'}
                                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 160, animated: true });}}
                                        onChangeText={(codigo)=> {this.setState({ codigo, errorCodigoMessage: null, next: false});}}
                                        onSubmitEditing={() => { this.verifyFields()}}
                                        placeholderTextColor={this.state.errorCodigoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                                    />
                                </View>
                                { this.state.errorCodigoMessage ?  <Text style={styles.labelError}>{this.state.errorCodigoMessage}</Text> :  null }
                            </Animated.View>
                        </View>
                        <TouchableOpacity 
                            style={[styles.mainBtn, {backgroundColor: this.state.codigo && this.state.codigo.length >= 4 ? COLOR.PRIMARY : COLOR.PRIMARY_DISABLED, }]} 
                            onPress={() => this.state.codigo && this.state.codigo.length >= 4 ? this.verifyFields(): null}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>VALIDAR</Text>}
                        </TouchableOpacity>              
                    </KeyboardAvoidingView>
                    { hasCameraPermission === false || hasCameraPermission === null ? null :      
                    <View style={[def_styles.d_flex_complete_center]}>
                        <Text style={styles.aproxime}>Aproxime seu celular do QRCODE ou digite o código do Restaurante abaixo</Text>
                    </View>}
                </ScrollView>
                <Toast ref="toast" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
   animatedShake: {
        // width: '100%',
        justifyContent: 'flex-start', 
        alignItems: 'center',
    },    
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
    scanScreenMessage: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentCamera: {
        width, 
        height: 350
    },
    contentContainer: {
        paddingBottom: 300,    
    },
    valorEconomizado:{
        paddingTop: 15,
        color: COLOR.SECONDARY,
        fontSize: FONT.XXLARGE,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    aproxime:{
        paddingVertical: 10,
        paddingHorizontal: 25,
        color: COLOR.PRIMARY,
        fontSize: FONT.SMALL,
        textAlign: 'center',
    },
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    mainBtn: {
        borderRadius: 6,
        marginVertical:20,
        marginHorizontal: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },    
    txtOutside:{
        marginTop: 10,
        fontSize: FONT.LABEL,
        color: COLOR.GREY,
    },
    txtInputContent: {
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    labelError: {
        width: '100%',
        color: 'red',
        paddingLeft: 5,
        paddingTop: 5,
        fontSize: FONT.LABEL
    },
    textStyle:{
        fontSize: FONT.XSMALL,
        fontWeight: '400'
    },
    contentCheckbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        // paddingTop: 20,
        margin: 0
    },    
    txtInputContainer2: {
        marginTop: 5,
        // marginBottom: 5,
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: COLOR.WHITE,
        borderColor: COLOR.GREY_WHITE,
        borderWidth: 0.3,
        borderRadius: 6,
        padding: 5
    },
    txtInputContainer: {
        marginTop: 5,
        paddingHorizontal: 0,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0.3,
        borderRadius: 6,
        padding: 0
    },
    title: {
        fontSize: FONT.SMEDIUM,
        textAlign: 'center',
        color: COLOR.GREY,
        paddingTop: 10,
        fontWeight: WEIGHT.FAT
    },
    allContent: {
        position: 'absolute',
        backgroundColor: COLOR.WHITE,
        borderRadius: 15,
        right: 0,
        left: 0,
        height: '100%',
    },
});


const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    currentRestaurant: store.InfoReducer.currentRestaurant,
    voucherInfo: store.InfoReducer.voucherInfo,
});

export default connect(mapStateToProps)(VoucherValidation);