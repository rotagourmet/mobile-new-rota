import React, { Component } from 'react';
import { Linking, Animated, ActivityIndicator, View, Keyboard, AsyncStorage, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Image, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { TextInputMask } from 'react-native-masked-text';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from 'react-native-elements'

import { getApi } from '../environments/config'
import ModalAlert from '../components/ModalAlert';
import Validators from '../utils/Validators';
import Toast from 'react-native-easy-toast';
import { storageUserData, storageUserToken} from '../actions';

import Theme from '../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class Register extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            name: '',
            phone: '',
            rotaCode: '',
            loading: false,

            fadeBoxPhone: new Animated.Value(0),
            fadeBoxCode: new Animated.Value(0),
            fadeBoxEmail: new Animated.Value(75),
            shakeAnimation: new Animated.Value(0),

            apareceCampoNome: true,
            apareceBtnVerificaNumero: false,
            apareceBtnCriarConta: false,
            apareceBtnEditarNumero: false,
            apareceBtnAvancar: true,
            btnReenviar: false,
            desabilitaInputPhone: false,
            apareceTextoLogin: true,
            apareceTextoSecundario: false,

            campoNomeBorderColor: 'rgba(255, 255, 255, 0.6)',
            campoNomeLabelColor: 'rgba(255, 255, 255, 1)',
            campoEmailBorderColor: 'rgba(255, 255, 255, 0.6)',
            campoEmailLabelColor: 'rgba(255, 255, 255, 1)',
            campoPhoneBorderColor: 'rgba(255, 255, 255, 0.6)',
            campoPhoneLabelColor: 'rgba(255, 255, 255, 1)',
            campoCodeBorderColor: 'rgba(255, 255, 255, 0.6)',
            campoCodeLabelColor: 'rgba(255, 255, 255, 1)',

            emailExiste: false
        }
    }

    componentDidMount() {
        let server = getApi('api')
        this.fadeInEmail();
        this.setState({
            server: server.url
        });
        this.refs.nameInput.focus()
    }

    startShake = () => {
        Animated.sequence([
            Animated.timing(this.state.shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
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

    fadeOutPhone() {
        setTimeout(() => {
            Animated.timing(this.state.fadeBoxPhone, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
            });
        }, 0);
    }

    fadeInPhone() {
        Animated.timing(this.state.fadeBoxPhone, { toValue: 75, duration: 500, useNativeDriver: false }).start();
    }

    fadeOutCode() {
        setTimeout(() => {
            Animated.timing(this.state.fadeBoxCode, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
            });
        }, 0);
    }

    fadeInCode() {
        Animated.timing(this.state.fadeBoxCode, { toValue: 65, duration: 500, useNativeDriver: false }).start();
    }

    openTerms = () => {
        Linking.openURL('https://file-upload-rota.s3.amazonaws.com/arquivos/Termos+de+Uso.pdf');
    };

    async validaEmail () {
        let { email, name, server } = this.state;
        name = name.split(' ');
        if (name && name.length >= 2 && name[0].length >= 3 && name[1].length >= 2 && email && Validators.validEmail(email)) {
            //Requisição de Verificacao do Email
            let response = await fetch(server + `auth/emailVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email})
            });
            response = await response.json();
            if(!response.error){
                this.setState({
                    emailExiste: true,
                    loading: false
                })
            }else{
                this.fadeOutEmail();
                this.fadeInPhone();
                this.refs.phoneInput._inputElement.focus()
                this.setState({ apareceCampoNome: false, apareceBtnVerificaNumero: true, apareceBtnAvancar: false, btnReenviar: true, loading: false})
            }
        }
        else if (!name || name.length < 2 || name[0].length < 3 || name[1].length < 2) {
            Keyboard.dismiss();
            this.setState({
                campoNomeBorderColor: 'rgba(255, 0, 0, 0.8)',
                campoNomeLabelColor: 'rgba(255, 0, 0, 1)',
                loading: false
            })
            this.refs.toast.show("Digite seu nome completo, por favor", 5000);
        }
        else if(!email || !Validators.validEmail(email)){
            Keyboard.dismiss();
            this.setState({
                campoEmailBorderColor: 'rgba(255, 0, 0, 0.8)',
                campoEmailLabelColor: 'rgba(255, 0, 0, 1)',
                loading: false
            })
            this.startShake();
            this.refs.toast.show("Digite um E-mail válido, por favor", 5000);
        }
    }

    async verificaCelular(){
        this.setState({loading: true})
        let { email, name, server, phone } = this.state;
        let form = {
            name: name,
            email: email,
            telefone: phone ? phone : '',
            typeUser: 'default'
        };
        name = name.split(' ');
        if (name && name.length >= 2 && name[0].length >= 3 && name[1].length >= 2 && email && Validators.validEmail(email) && phone && phone.length == 15) {
            let response = await fetch(server + `auth/preRegister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
            response = await response.json();

            if (!response.error) {
                this.setState({enviarSms: true, loading: false});
                this.fadeInCode();
                this.setState({
                    apareceBtnCriarConta: true,
                    apareceBtnVerificaNumero: false
                })
            }else{
                this.setState({loading: false});
                    
                if (response.erro) {
                    if (response.erro.phone) {   
                        Keyboard.dismiss();
                        this.setState({
                            campoPhoneBorderColor: 'rgba(255, 0, 0, 0.8)',
                            campoPhoneLabelColor: 'rgba(255, 0, 0, 1)',
                            loading: false
                        })
                        this.startShake();
                        this.refs.toast.show(response.erro.phone.message, 6000);
                    }
                }else{
                    Keyboard.dismiss();
                    this.refs.toast.show("Erro ao tentar adicionar seu celular, tente novamente.", 5000);
                }
            }
            
        }else if(!name || name.length < 2 || name[0].length < 3 || name[1].length < 2){
            Keyboard.dismiss();
            this.refs.toast.show('O campo Nome é obrigatório.', 5000);
            this.setState({ loading: false})
        }else if(!email || !Validators.validEmail(email)){
            Keyboard.dismiss();
            this.refs.toast.show('O campo E-mail é obrigatório.', 5000);
            this.setState({ loading: false})
        }else if (!phone || phone.length < 15) {
            Keyboard.dismiss();
            this.setState({
                campoPhoneBorderColor: 'rgba(255, 0, 0, 0.8)',
                campoPhoneLabelColor: 'rgba(255, 0, 0, 1)',
                loading: false
            })
            this.startShake();
            this.refs.toast.show('O campo Celular é obrigatório.', 5000);
        }
    }

    async confirmRegister(){
        this.setState({loading: true});
        let { email, server, rotaCode } = this.state;
        let form = { email, rotaCode };
        if (rotaCode && rotaCode.length >= 4 && email && Validators.validEmail(email)) {
            let response = await fetch(server + `auth/confirmRegister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
            response = await response.json();

            this.setState({ loading: false })
            if (response.error) {
                Keyboard.dismiss();
                this.setState({
                    campoCodeBorderColor: 'rgba(255, 0, 0, 0.8)',
                    campoCodeLabelColor: 'rgba(255, 0, 0, 1)'
                })
                this.startShake();
                this.refs.toast.show('O código de verificação está incorreto.', 5000);
            }else{
                AsyncStorage.multiSet([["user", JSON.stringify(response.user)], ["token", response.token], ["logged", "true"]])
                this.props.storageUserData(response.user);
                this.props.storageUserToken(response.token);
                this.props.navigation.navigate("StartupApp");
            }
            
        }else if(!email || !Validators.validEmail(email)){
            Keyboard.dismiss();
            this.refs.toast.show('O campo E-mail é obrigatório.', 5000);
            this.setState({loading: false});
        }else if (!rotaCode || rotaCode.length < 4) {
            Keyboard.dismiss();
            this.setState({
                campoCodeBorderColor: 'rgba(255, 0, 0, 0.8)',
                campoCodeLabelColor: 'rgba(255, 0, 0, 1)'
            })
            this.startShake();
            this.refs.toast.show('O código de verificação é obrigatório.', 5000);
        }
    }

    render(){
        let { name, email, rotaCode, phone, apareceCampoNome, campoNomeLabelColor, campoNomeBorderColor, campoEmailLabelColor, campoEmailBorderColor, emailExiste, campoPhoneBorderColor, campoPhoneLabelColor, campoCodeBorderColor, campoCodeLabelColor, enviarSms} = this.state;
        return (
            <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
                <View style={styles.wholeContent}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity style={styles.backButtonContent} onPress={()=> this.props.navigation.goBack()}>
                            <Icon name='angle-left' type='font-awesome' color={COLOR.BLACK} size={30}  />
                        </TouchableOpacity>
                    </View>
                    <KeyboardAvoidingView enabled={Platform.OS === 'ios'} behavior="padding" style={styles.container}>


                        <View style={styles.imageContent}>
                            <Image source={IMAGES.logoDourada} style={styles.logo} />
                        </View>
                        <View style={styles.form}>
                            {apareceCampoNome ?
                            <View style={[styles.txtInputContent, {borderColor: campoNomeBorderColor}]}>
                                <TextInput
                                    ref={'nameInput'}
                                    style={[styles.textInput, {color: campoNomeLabelColor}]}
                                    placeholder="Nome Completo*"
                                    placeholderTextColor={campoNomeLabelColor}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    value={name}
                                    onSubmitEditing={()=> {this.refs.emailInput.focus()}} 
                                    returnKeyType={'next'}
                                    onChangeText={(name) => {
                                        this.setState({
                                            name,
                                            campoNomeBorderColor: 'rgba(255, 255, 255, 0.6)',
                                            campoNomeLabelColor: COLOR.WHITE
                                        });
                                    }}
                                />
                            </View>
                            : null}

                            <Animated.View style={[{ height: this.state.fadeBoxEmail,}, styles.animatedView]}>
                                <Animated.View style={[ styles.animatedShake, {transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                    <View style={[styles.txtInputContent, {borderColor: campoEmailBorderColor,}]}>
                                        <TextInput
                                            ref={'emailInput'}
                                            style={[styles.textInput, {color: campoEmailLabelColor}]}
                                            placeholder="E-mail*"
                                            placeholderTextColor={campoEmailLabelColor}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={email}
                                            keyboardType={'email-address'} 
                                            onSubmitEditing={()=> {this.validaEmail(); this.setState({loading:true})}} 
                                            returnKeyType={'next'}
                                            onChangeText={(email) => {
                                                this.setState({
                                                    email,    
                                                    
                                                    campoEmailBorderColor: 'rgba(255, 255, 255, 0.6)',
                                                    campoEmailLabelColor: COLOR.WHITE
                                                });
                                            }}
                                        />
                                    </View>
                                </Animated.View>   
                            </Animated.View>

                            <Animated.View style={[{ height: this.state.fadeBoxPhone,}, styles.animatedView]}>
                                <Animated.View style={[ styles.animatedShake, {transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                    <View style={[styles.txtInputContent, {borderColor: campoPhoneBorderColor }]}>
                                     
                                        <TextInputMask
                                            ref={'phoneInput'}
                                            style={[styles.textInput, {color: campoPhoneLabelColor}]}
                                            placeholder="Celular com DDD*"
                                            placeholderTextColor={campoPhoneLabelColor}
                                            value={phone}
                                            keyboardType="number-pad"
                                            autoCapitalize="none"
                                            type={'datetime'} options={{ format: '(DD) YYYYY-YYYY'}}       
                                            onChangeText={text => {
                                                this.setState({ 
                                                    phone: text,
                                                    campoPhoneBorderColor: 'rgba(255, 255, 255, 0.6)',
                                                    campoPhoneLabelColor: COLOR.WHITE
                                                });
                                            }}
                                        />
                                            </View>
                                </Animated.View>   
                            </Animated.View>

                            <Animated.View style={[{ height: this.state.fadeBoxCode }, styles.animatedView]}>
                                <Animated.View style={[ styles.animatedShake, { transform: [{translateX: this.state.shakeAnimation}] }]}>  
                                    <View style={[styles.txtInputContent, {borderColor: campoCodeBorderColor}]}>
                                        <TextInput
                                            style={[styles.textInput, {color: campoCodeLabelColor}]}
                                            placeholder="Código de verificação*"
                                            placeholderTextColor={campoCodeLabelColor}
                                            keyboardType="number-pad"
                                            onSubmitEditing={()=> {this.confirmRegister(); this.setState({loading:true})}} 
                                            returnKeyType={'next'}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={rotaCode}
                                            onChangeText={(rotaCode) => {
                                                this.setState({
                                                    rotaCode,    
                                                    campoCodeBorderColor: 'rgba(255, 255, 255, 0.6)',
                                                    campoCodeLabelColor: COLOR.WHITE
                                                });
                                            }}
                                        />
                                    </View>
                                </Animated.View>   
                            </Animated.View>
                            
                            {this.state.apareceBtnVerificaNumero ?
                            <TouchableOpacity onPress={() => { this.verificaCelular() }} style={[styles.btnContainer, {backgroundColor: COLOR.PRIMARY}]}>
                                { this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={[styles.btnLabel, {color:COLOR.WHITE}]}>VERIFICAR CELULAR</Text>}
                            </TouchableOpacity>            
                            : null}
                            
                            {this.state.apareceBtnAvancar ?
                            <TouchableOpacity onPress={() => { this.validaEmail() }} style={[styles.btnContainer, {backgroundColor: COLOR.PRIMARY}]}>
                                {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :   <Text style={[styles.btnLabel, {color: COLOR.WHITE}]}>AVANÇAR</Text>}
                            </TouchableOpacity>            
                            : null}
                            
                            {this.state.apareceBtnCriarConta ?
                            <TouchableOpacity onPress={() => { this.confirmRegister() }} style={[styles.btnContainer, {backgroundColor: COLOR.PRIMARY}]}>
                                {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={[styles.btnLabel, {color:COLOR.WHITE}]}>CRIAR CONTA</Text>}
                            </TouchableOpacity>            
                            : null}
                            
                            {this.state.btnReenviar ?
                            <TouchableOpacity onPress={() => {this.setState({ loading: true }); this.verificaCelular()}} style={styles.btnContainer}>
                                <Text style={[styles.btnLabelReenviar]}>NÁO RECEBI O CÓDIGO</Text>
                            </TouchableOpacity>
                            : null}

                        </View>
                    </KeyboardAvoidingView>
                    <View style={styles.termosDeUso}>
                        <TouchableOpacity onPress={this.openTerms}>
                            <Text style={styles.labelTermosDeUso}>Ao se cadastrar você concorda com os nossos <Text style={styles.labelTermosDeUsoOrange}>termos de uso</Text> e <Text style={styles.labelTermosDeUsoOrange}>política de privacidade</Text></Text>
                        </TouchableOpacity>
                    </View>
                    <Toast ref="toast" />
                    {emailExiste ? 
                    <ModalAlert
                        title={"Mensagem"}
                        onChange={(fn) => { this.setState({ emailExiste: fn }); }}
                        subtitle={`O e-mail inserido já está em uso. Você pode inserir outro ou tentar fazer o login.`}
                        btnText={"OK"}
                        boxSize={responsiveWidth(45)}
                        onRoute={(fn) => {  this.setState({ emailExiste: false }) }}
                    />
                    : null }
                    {enviarSms ? 
                    <ModalAlert
                        title={"Mensagem"}
                        onChange={(fn) => { this.setState({ enviarSms: fn }); }}
                        subtitle={`Enviaremos um SMS para o telefone ${phone} e para seu e-mail com o código de verificação, aguarde alguns segundos.`}
                        btnText={"OK"}
                        boxSize={responsiveWidth(50)}
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
        top: '5%',
        left: '5%',
        zIndex: 10,
        height: 50,
        width: 50
    },
    btnLabel: {
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    btnContainer: {
        color: COLOR.WHITE,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    txtInputContent:{
        width: '100%',
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 0.5,
        marginBottom: 20
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
    btnLabelReenviar: {
        paddingTop: 30,
        color: COLOR.PRIMARY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.MEDIUM,
        textAlign: 'center'
    },
    textInput: {
        paddingVertical: 13,
        paddingHorizontal: 20,
        fontSize: FONT.SMALL
    },
    wholeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.BLACK,
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
        flex: 1,
        justifyContent:'flex-start',
        alignItems:'center',
        
    },
    imageContent: {
        flex: 3,
        justifyContent: 'center',
        alignItems:'center' 
    },
    logo:{
        height: 110,
        width: 110,
    },
    container: {
        flex: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.BLACK,
        paddingHorizontal: 10,
        width:'82%'
    },

    form: {
        flex: 3,
        width:'100%' 
    },

    label: {
        fontWeight: 'bold',
        color: COLOR.BLACK,
        marginBottom: 8,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 20,
        fontSize: 16,
        color: COLOR.BLACK,
        height: 44,
        marginBottom: 20,
        borderRadius: 2
    },

    button: {
        height: 42,
        backgroundColor: '#f05a5b',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

const mapStateToProps = store => ({
  userData: store.AuthReducer.userData,
  userToken: store.AuthReducer.userToken,
  
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageUserData, storageUserToken }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Register);