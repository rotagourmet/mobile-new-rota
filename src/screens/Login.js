import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, TouchableOpacity, AsyncStorage, Image, ImageBackground, Button, Animated, ActivityIndicator, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Video } from 'expo-av';
import Toast from 'react-native-easy-toast';
import { TextInputMask } from 'react-native-masked-text';
import { Icon } from 'react-native-elements'


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageUserData, storageUserToken } from '../actions';

import ModalAlert from '../components/ModalAlert';
import { getApi } from '../environments/config'
import Input from '../components/Input';
import Validators from '../utils/Validators';
import Formater from '../utils/Formater';
import Theme from '../constants/Theme';
import Events from '../utils/Events';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            fadeBoxEmail: new Animated.Value(0),
            fadeBoxPhone: new Animated.Value(0),
            fadeBoxRotaCode: new Animated.Value(0),
            shakeAnimation: new Animated.Value(0),
            
            emailField: false,
            emailBorderColor: 'rgba(255,255,255,0.4)',
            emailLabelColor: 'rgba(255,255,255,1)',
            rotaCodeBorderColor: 'rgba(255,255,255,0.4)',
            rotaCodeLabelColor: 'rgba(255,255,255,1)',

            emailEditable: true,
            btnAvancarColor: false,
            btnAvancar: true, 
            btnVerificar: false, 
            btnLogin: false, 
            btnReenviar: false,
            fieldPhone: true
        }
    }

    componentDidMount() {
        let server = getApi('api')
        this.fadeInEmail();
            this.setState({
            server: server.url
        });
    }

    startShake = () => {
        Animated.sequence([
            Animated.timing(this.state.shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true, }),
            Animated.timing(this.state.shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(this.state.shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    }

    fadeOutEmail() {
        setTimeout(() => {
            Animated.timing(this.state.fadeBoxEmail, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
            });
        }, 0);
    }

    fadeInEmail() {
        Animated.timing(this.state.fadeBoxEmail, { toValue: 65, duration: 500, useNativeDriver: false }).start();
    }

    fadeOutRotaCode() {
        setTimeout(() => {
            Animated.timing(this.state.fadeBoxRotaCode, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
            });
        }, 0);
    }

    fadeInRotaCode() {
        Animated.timing(this.state.fadeBoxRotaCode, { toValue: 50, duration: 50, useNativeDriver: false }).start();
    }

    fadeOutPhone() {
        setTimeout(() => {
            Animated.timing(this.state.fadeBoxPhone, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        });
        }, 1000);
    }

    fadeInPhone() {
        Animated.timing(this.state.fadeBoxPhone, { toValue: 65, duration: 300, useNativeDriver: false }).start();
    }


    async validaEmail(){
        this.setState({loading:true})
        const { email, server } = this.state;
        if (email && Validators.validEmail(email)) {
            //Requisição de validarEmail
            let response = await fetch(server + `auth/emailVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email})
            });
            response = await response.json();

            if(response.error){
                Keyboard.dismiss();
                this.startShake();
                this.setState({
                    loading:false,
                    emailBorderColor: 'rgba(255,0,0, 0.8)',
                    emailLabelColor: 'rgba(255,0,0, 0.8)'
                })
                this.refs.toast.show(response.message, 5000);
            }else{
                this.setState({ telefoneStatus : response.telefoneStatus});

                if(this.state.telefoneStatus){
                    this.fadeInRotaCode();
                    let phoneFormated = Formater.phoneNumber(response.telefone)
                    this.setState({ loading:false, enviarSms: true, btnAvancar: false, btnVerificar: false, btnLogin: true, btnReenviar: true, emailEditable: false, emailLabelColor: 'rgba(255,255,255,0.4)', telefone: phoneFormated,  emailField: true})
                }else{
                    this.fadeInPhone();
                    this.setState({loading:false, btnAvancar: false, btnVerificar: true, btnLogin: false, btnReenviar: false, emailEditable: false, emailLabelColor: 'rgba(255,255,255,0.4)'})
                }
            }
        }else if(!email){
            Keyboard.dismiss()
            this.setState({
                loading:false,
                emailBorderColor: 'rgba(255,0,0, 0.8)',
                emailLabelColor: 'rgba(255,0,0, 0.8)'
            })
            this.startShake();
            this.refs.toast.show("O campo e-mail é obrigatório", 5000);
        }
        else if(!Validators.validEmail(email)){
            Keyboard.dismiss()
            this.setState({
                loading:false,
                emailBorderColor: 'rgba(255,0,0, 0.8)',
                emailLabelColor: 'rgba(255,0,0, 0.8)'
            })
            this.startShake();
            this.refs.toast.show("Digite um E-mail válido.", 5000);
        }
    }

    async verificaCelular(){
        const { email, server, telefone } = this.state;
        if (email && Validators.validEmail(email) && telefone && telefone.length == 15) {
            //Requisição de validarEmail
            let response = await fetch(server + `auth/phoneVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, telefone})
            });
            response = await response.json();
            if (this.state.emailField) {
                this.fadeInRotaCode();
                this.refs.toast.show(response.message, 5000);
                this.setState({
                    btnVerificar: false,
                    btnReenviar: true,
                    btnLogin: true,
                    fieldPhone: false,
                    loading: false
                })
            }else{
                this.refs.toast.show(response.message, 5000);
                this.fadeInRotaCode();
                this.fadeOutEmail();
                this.setState({
                    btnVerificar: false,
                    btnReenviar: true,
                    btnLogin: true,
                    fieldPhone: false,
                    loading: false
                })
            }
            this.refs.rotaInput.focus()
        }else if(!email){
            Keyboard.dismiss()
            this.refs.toast.show("O campo e-mail é obrigatório");
            this.setState({loading: false})
        }
        else if(!Validators.validEmail(email)){
            Keyboard.dismiss()
            this.setState({loading: false})
            this.refs.toast.show("Digite um E-mail válido.");
        }
        else if(!telefone || telefone.length <= 15){
            Keyboard.dismiss()
            this.setState({loading: false})
            this.refs.toast.show("Digite um celular válido.");
        }
    }

    async login(){
        const { email, server, telefone, rotaCode } = this.state;
        this.setState({loading: true});
        if (email && Validators.validEmail(email) && telefone && rotaCode && rotaCode.length == 4) {
            //Requisição de validarEmail
            let response = await fetch(server + `auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, telefone, rotaCode})
            });
            response = await response.json();
            if(response.error){
                Keyboard.dismiss();
                this.startShake();
                this.setState({loading: false, rotaCodeBorderColor: 'rgba(255,0,0, 0.8)', rotaCodeLabelColor: 'rgba(255,0,0, 0.8)'})
                this.refs.toast.show(response.message, 5000);
            }else{
                this.setState({loading: false,})
                AsyncStorage.multiSet([["user", JSON.stringify(response.user)], ["token", response.token], ["logged", "true"]])
                this.props.storageUserData(response.user);
                this.props.storageUserToken(response.token);
                Events.publish("RefreshRouters");
                Events.publish("UpdateVouchers")
            }
            
        }else if(!email){
            Keyboard.dismiss()
            this.setState({loading: false})
            this.refs.toast.show("O campo e-mail é obrigatório", 5000);
        }
        else if(!Validators.validEmail(email)){
            Keyboard.dismiss()
            this.setState({loading: false})
            this.refs.toast.show("Digite um E-mail válido.", 5000);
        }
        else if(!telefone){
            Keyboard.dismiss()
            this.setState({loading: false})
            this.refs.toast.show("Digite um celular válido.", 5000);
        }
        else if(!rotaCode){
            Keyboard.dismiss()
            this.startShake();
            this.setState({loading: false, rotaCodeBorderColor: 'rgba(255,0,0, 0.8)', rotaCodeLabelColor: 'rgba(255,0,0, 0.8)'})
            this.refs.toast.show("Digite o Código de Verificação.", 5000);
        }
        else if(rotaCode.length < 4){
            Keyboard.dismiss()
            this.startShake();
            this.setState({loading: false, rotaCodeBorderColor: 'rgba(255,0,0, 0.8)', rotaCodeLabelColor: 'rgba(255,0,0, 0.8)'})
            this.refs.toast.show("O Código de Verificação precisa ter no mínimo 4 digitos.", 5000);
        }
    }

    render() {
        let  { btnAvancarColor, enviarSms } = this.state;
        const { navigation } = this.props;
        return(
            <TouchableWithoutFeedback style={styles.container} onPress={()=> {Keyboard.dismiss()}}>
                <View style={styles.container}>
                    <View style={styles.imageBg}>
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity style={styles.backButtonContent} onPress={()=> navigation.goBack()}>
                                <Icon name='angle-left' type='font-awesome' color={COLOR.BLACK} size={30}  />
                            </TouchableOpacity>
                        </View>
                        <Image source={IMAGES.logoDourada} style={styles.logoDourada}/>
                        <Video
                            source={ require('../assets/videos/intro.mp4')}
                            rate={1.0}
                            volume={1.0}
                            isMuted={true}
                            resizeMode="cover"
                            shouldPlay
                            isLooping
                            style={{ width: '100%', flex:1, opacity: 0.3, backgroundColor: '#000000' }}
                            />
                    </View>
                <KeyboardAvoidingView behavior="padding" enabled style={styles.containerInput}>
                    <View style={styles.containerTitle}>
                        <Text style={styles.titleText}> Bem-vindo </Text>
                        <Text style={styles.subTitleText}> Você não vai mais parar em Casa! </Text>
                    </View>
                    <View style={{flex: 3, justifyContent: 'flex-start', alignItems: 'center', width: '100%'}}>
                        

                        <Animated.View style={[{ height: this.state.fadeBoxEmail,}, styles.animatedView]}>
                            <Animated.View style={[ styles.animatedShake, { transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                <Input borderColor={this.state.emailBorderColor} editable={this.state.emailEditable} textColor={this.state.emailLabelColor}  placeholder={'E-mail'} value={this.state.email} keyboardType={'email-address'} onSubmitEditing={()=> {this.validaEmail()}} returnKeyType={'next'}  onChangeText={(text) => {
                                    this.setState({
                                        emailBorderColor: 'rgba(255,255,255, 0.6)',
                                        emailLabelColor: 'rgba(255,255,255, 1)'
                                    })
                                    if(text.length >= 5){
                                        this.setState({ email: text, btnAvancarColor: true })
                                    }else{ 
                                        this.setState({ email: text, btnAvancarColor: false })
                                    }
                                } }/>
                            </Animated.View>   
                        </Animated.View>

                        <Animated.View style={[{ height: this.state.fadeBoxPhone }, styles.animatedView]}>
                            <View style={styles.containerMaskInput}>
                                <TextInputMask
                                    ref={'phoneInput'}
                                    style={styles.textInputMask}
                                    onChangeText={async telefone => {
                                        this.setState({ telefone })
                                        if(this.state.telefone && this.state.telefone.length >= 15){
                                            await this.setState({loading: true, telefone})
                                            this.verificaCelular();
                                        }
                                    }}
                                    value={this.state.telefone}
                                    placeholderTextColor={'#FFFFFF'}
                                    placeholder={'Celular'}
                                    type={'datetime'} options={{ format: '(DD) YYYYY-YYYY'}}       
                                />
                            </View>
                        </Animated.View>

                        <Animated.View style={[{ height: this.state.fadeBoxRotaCode }, styles.animatedView]}>
                            <Animated.View style={[ styles.animatedShake, { transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                <View style={[styles.containerMaskInput, {borderColor: this.state.rotaCodeBorderColor}]}>
                                    <TextInput
                                        ref={'rotaInput'}
                                        maxLength={4}
                                        keyboardType={'number-pad'}
                                        onSubmitEditing={()=> {this.login()}} returnKeyType={'next'}
                                        style={[styles.textInputMaskCode, {color: this.state.rotaCodeLabelColor}]}
                                        onChangeText={rotaCode => {
                                            this.setState({ rotaCode, rotaCodeBorderColor: 'rgba(255,255,255, 0.6)', rotaCodeLabelColor: 'rgba(255,255,255, 1)' })
                                        }}
                                        value={this.state.rotaCode}
                                        placeholderTextColor={this.state.rotaCodeLabelColor}
                                        placeholder={'Código de Verificação'}
                                    />
                                </View>
                            </Animated.View>
                        </Animated.View>

                        {
                            this.state.btnAvancar ?
                            <TouchableOpacity onPress={() => { btnAvancarColor ? this.validaEmail() : null }} style={[styles.btnContainer, {backgroundColor: btnAvancarColor ? COLOR.PRIMARY : COLOR.PRIMARY_DISABLED}]}>
                               { this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={[styles.btnLabel, {color: btnAvancarColor ? COLOR.WHITE : COLOR.WHITE_DISABLED}]}>AVANÇAR</Text>}
                            </TouchableOpacity>
                            : null
                        }
                        {
                            this.state.btnVerificar ?
                            <TouchableOpacity onPress={() => {this.verificaCelular()}} style={[styles.btnContainer, {backgroundColor:COLOR.PRIMARY}]}>
                                { this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={[styles.btnLabel, {color:COLOR.WHITE}]}>VERIFICAR CELULAR</Text>}
                            </TouchableOpacity>
                            : null
                        }
                        {
                            this.state.btnLogin ?
                            <TouchableOpacity onPress={() => {this.login()}} style={[styles.btnContainer, {backgroundColor:COLOR.PRIMARY}]}>
                                 {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :   <Text style={[styles.btnLabel, {color:COLOR.WHITE}]}>ENTRAR</Text>}
                            </TouchableOpacity>
                            : null
                        }
                        {
                            this.state.btnReenviar ?
                            <TouchableOpacity onPress={() => {this.setState({ loading: true }); this.verificaCelular()}} style={{flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                <Text style={[styles.btnLabelReenviar]}>NÁO RECEBI O CÓDIGO</Text>
                            </TouchableOpacity>
                            : null
                        }
                    
                    </View>
                </KeyboardAvoidingView>
                    <TouchableOpacity onPress={() => { navigation.navigate("Register") }} style={{flex: 0.3, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={[styles.btnLabelCadastrar]}>Não tem uma conta? <Text style={styles.labelCadastre}> Cadastre-se.</Text></Text>
                    </TouchableOpacity>
                
                <Toast ref="toast" />
                {enviarSms ? 
                    <ModalAlert
                        title={"Mensagem"}
                        subtitle={`Enviaremos um SMS para o telefone ${this.state.telefone} e para seu e-mail com o código de verificação, aguarde alguns segundos.`}
                        btnText={"OK"}
                        boxSize={responsiveWidth(50)}
                        onChange={(fn) => { this.setState({ enviarSms: fn }); }}
                        onRoute={(fn) => {  this.setState({ enviarSms: false }) }}
                    />
                : null }
            
            </View>
            </TouchableWithoutFeedback>
            
        );
    }
}

const styles = StyleSheet.create({
    backButtonContent: {
        flex: 1,
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        backgroundColor: COLOR.WHITE,
        paddingRight: 2
    },
    backButtonContainer: {
        position: 'absolute',
        top: '10%',
        left: '5%',
        zIndex: 10,
        height: 50,
        width: 50
    },
    logoDourada: {
        position: 'absolute',
        top: '19%',
        zIndex: 10,
        height: 85,
        width: 85
    },
    animatedShake: {
        width: '100%',
        justifyContent: 'flex-start', 
        alignItems: 'center',
    },
    animatedView: {
        justifyContent: 'center', 
        alignItems: 'center', 
        overflow: 'hidden', 
        width: '100%' 
    },
    containerMaskInput:{
        width: '80%',
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.4)'
    },
    textInputMaskCode: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        fontSize: FONT.SMALL,
    },
    textInputMask: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        fontSize: FONT.SMALL,
        color: COLOR.WHITE
    },
    btnLabelReenviar: {
        color: COLOR.PRIMARY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.MEDIUM,
    },
    labelCadastre: {
        color: COLOR.PRIMARY,
        fontWeight: WEIGHT.FAT
    },
    btnLabelCadastrar: {
        fontSize: FONT.MEDIUM,
        textAlign: 'center',
        color: COLOR.WHITE
    },
    answerBarCorrect: {
        backgroundColor: "#BAE4CF"
    },
    answerBarWrong: {
        backgroundColor: "#F0C6D5"
    },
    answerBarNeutral: {
        backgroundColor: "#D8D8D8"
    },
    btnLabel: {
        fontSize: FONT.SMALL,
        textAlign: 'center',
        
        fontWeight: WEIGHT.FAT
    },
    btnContainer: {
        color: COLOR.WHITE,
        margin:20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '80%',
        borderRadius: 6,
    },
    subTitleText:{
        fontSize: FONT.MEDIUM,
        textAlign: 'center',
        color: COLOR.WHITE
    },
    contentInput: {
        width: '100%',
        justifyContent:'center',
        alignItems: 'center',
        marginVertical: 5
    },
    titleText:{
        fontSize: FONT.XXXLARGE,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT,
        color: COLOR.PRIMARY,
        paddingBottom: responsiveHeight(1)
    },
    containerTitle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: responsiveHeight(3),
        paddingBottom: responsiveHeight(4)
    },
    containerInput: {
        flex: 1.3,
        backgroundColor: COLOR.BLACK,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        top: responsiveHeight(-10.5),
        justifyContent:'center',
        alignItems: 'center', 
    },
    imageBg: {
        flex: 1,
        width: '100%', 
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
    },
    container: {
        flex: 1,
        backgroundColor: COLOR.BLACK,
    },

});

const mapStateToProps = store => ({
  userData: store.AuthReducer.userData,
  userToken: store.AuthReducer.userToken,

});

const mapDispatchToProps = dispatch => bindActionCreators({ storageUserData, storageUserToken }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Login);