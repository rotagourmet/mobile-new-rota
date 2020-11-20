import React, { Component } from 'react'; 
import { View, Text, StyleSheet, KeyboardAvoidingView, AsyncStorage, Platform, TouchableOpacity, Image, ScrollView, TextInput, Animated, Keyboard, ActivityIndicator, Linking } from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import * as WebBrowser from 'expo-web-browser';
import { TextInputMask } from 'react-native-masked-text';
import Toast from 'react-native-easy-toast';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment/min/moment-with-locales'

import { connect } from 'react-redux';
import { storageInputs, storageUserData, storageSubscription } from '../actions';
import { bindActionCreators } from 'redux';

import { getApi } from '../environments/config'
import PaymentValidations from '../utils/PaymentValidations';
import ModalHappy from '../components/ModalHappy';
import Pageheader from '../components/Pageheader';
import Theme from '../constants/Theme';
import Events from '../utils/Events';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');

class Dados extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            step: 'dados',
            method: 'credit',
            phone: '553432553690',
            fadePaymentCredit: new Animated.Value(56),
            fadePaymentDebit: new Animated.Value(56),
            fadePaymentBoleto: new Animated.Value(56),
            errorMessage: true,
            welcome: false
        }
    }

    fadeInPaymentBoleto(){
        Animated.timing( this.state.fadePaymentBoleto, { toValue: 190, duration: 250, useNativeDriver: false }).start();
    }
    
    fadeOutPaymentBoleto(){
        Animated.timing( this.state.fadePaymentBoleto, { toValue: 56, duration: 100, useNativeDriver: false  }).start();
    }

    fadeInPaymentCredit(){
        Animated.timing( this.state.fadePaymentCredit, { toValue: this.props.selectedPLan.plan.title === "Mensal" ? 445 : 500, duration: 250, useNativeDriver: false  }).start();
    }
    
    fadeOutPaymentCredit(){
        Animated.timing( this.state.fadePaymentCredit, { toValue: 56, duration: 100, useNativeDriver: false  }).start();
    }

    fadeInPaymentDebit(){
        Animated.timing( this.state.fadePaymentDebit, { toValue: this.props.selectedPLan.plan.title === "Mensal" ? 425 : 490, duration: 250, useNativeDriver: false  }).start();
    }
    
    fadeOutPaymentDebit(){
        Animated.timing( this.state.fadePaymentDebit, { toValue: 56, duration: 100, useNativeDriver: false  }).start();
    }

    loadFields(){
        let user = this.props.userData;
        this.setState({
            name: user.name ? user.name : '',
            cpf: user.cpf ? this.cpfMask(user.cpf) : '',
            nascimento: user.dt_nasc ? user.dt_nasc : '',
            celular: user.phone ? this.phoneMask(user.phone) : '',
            email: user.email ? user.email : '',
            
            zipcode: user.address && user.address.zipcode ? this.cepMask(user.address.zipcode) : '',
            uf: user.address && user.address.uf ? user.address.uf : '',
            city: user.address && user.address.city ? user.address.city : '',
            district: user.address && user.address.district ? user.address.district : '',
            street: user.address && user.address.street ? user.address.street : '',
            number: user.address && user.address.number ? `${user.address.number}` : '',
            complement: user.address && user.address.complement ? user.address.complement : '',

            nuCartao: user.cards && user.cards[0] && user.cards[0].nuCartao ? user.cards[0].nuCartao : '',
            nameCartao: user.cards && user.cards[0] && user.cards[0].nameCartao ? user.cards[0].nameCartao : '',
            dtCartao: user.cards && user.cards[0] && user.cards[0].dtCartao ? user.cards[0].dtCartao : '',
            cvcCartao: user.cards && user.cards[0] && user.cards[0].cvcCartao ? user.cards[0].cvcCartao : '',
            method: 'credit',
        })
        this.fadeInPaymentCredit();
    }

    cpfMask(cpf){
        cpf = cpf[0] + cpf[1] + cpf[2] + "." + cpf[3] + cpf[4] + cpf[5] + "." + cpf[6] + cpf[7] + cpf[8] + "-" + cpf[9] + cpf[10]
        return cpf
    }

    phoneMask(ph){
        ph = "(" + ph[0] + ph[1] + ") " + ph[2] + ph[3] + ph[4] + ph[5] + ph[6] + "-" + ph[7] + ph[8] + ph[9] + ph[10]
        return ph
    }

    cepMask(cep){
        cep = cep[0] + cep[1] + cep[2] + cep[3] + cep[4] + "-" + cep[5] + cep[6] + cep[7]
        return cep
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            this.setState({
                user: this.props.userData,
                method: null,
                selectedPLan: this.props.selectedPLan,
                parcelas: 1
            })
            this.loadFields()
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async saveSecondStep(form){
        //Requisição de salvar o endereço
        let response = await fetch(server.url + `api/payment/addressInfo?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...form, _id: this.props.userData._id})
        });
        response = await response.json()
        if (response.error) {
            
        } else {    
            this.props.storageUserData(response.user)
            AsyncStorage.setItem("user", JSON.stringify(response.user))
        }
    }

    async saveFirstStep(form){
        //Requisição de salvar os dados iniciais do usuário
        let response = await fetch(server.url + `api/payment/userInfo?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...form, _id: this.props.userData._id})
        });
        response = await response.json()
        if (response.error) {
            
        } else {    
            this.props.storageUserData(response.user)
            AsyncStorage.setItem("user", JSON.stringify(response.user))
        }
    }

    async subscriptionBoleto(form){
        //Requisição de salvar os dados de cartão de crédito
        let response = await fetch(server.url + `api/subscription/boleto?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...form, _id: this.props.userData._id, plan_id: this.props.selectedPLan})
        });
        response = await response.json()
        if (response.error) {
            this.setState({
                welcome: true, 
                loading: false,
                paymentError: true,
                titleModal: "Ops! Não foi possível realizar a assinatura",
                contentModal: response.message ? response.message : "Ocorreu algum problema com o método de pagamento. Verifique os dados de cartão e tente novamente. Se persistir o erro entre em contato com nosso suporte.",
                btnTextModal: "QUERO SUPORTE"
            });
                
        } else if(response && response.authenticate){
            this.setState({
                loading: false,
            });
        } else {    
            Linking.openURL(response.Payment.Url);
            this.setState({
                welcome: true, 
                paymentError: false,
                loading: false, 
                titleModal: "Muito bem!",
                contentModal: "Geramos o boleto e para maior segurança na sua compra lhe enviamos para o e-mail: " + this.state.email + ". \n\n" + "Verifique sua caixa de e-mail, caso não encotre verifique também o Spam.",
                btnTextModal: "OK"
            })
            this.props.storageSubscription(response.subscription);
        }
    }

    async subscription(form){
        //Requisição de salvar os dados de cartão de crédito
        let response = await fetch(server.url + `api/subscription?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...form, _id: this.props.userData._id, plan_id: this.props.selectedPLan})
        });
        response = await response.json()
        if (response.error) {
            this.setState({
                welcome: true, 
                loading: false,
                paymentError: true,
                titleModal: "Ops! Não foi possível realizar a assinatura",
                contentModal: response.message ? response.message : "Ocorreu algum problema com o método de pagamento. Verifique os dados de cartão e tente novamente. Se persistir o erro entre em contato com nosso suporte.",
                btnTextModal: "QUERO SUPORTE"
            });
            if (this.state.method === 'credit') {
                this.fadeInPaymentCredit()
            }else if (this.state.method === 'debit') {
                this.fadeInPaymentDebit()
            }
                
        } else if(response && response.authenticate){
            this.setState({
                loading: false,
            });
            if (this.state.method === 'credit') {
                this.fadeInPaymentCredit()
            }else if (this.state.method === 'debit') {
                this.fadeInPaymentDebit()
            }
            Linking.openURL(response.Payment.AuthenticationUrl);
        } else {    
            this.setState({
                welcome: true, 
                paymentError: false,
                loading: false, 
                titleModal: "Parabéns!",
                contentModal: "Agora você pode ir aos melhores Restaurantes da cidade e ganhar descontos de até 100% no 2º prato \n\n Aproveite e utilize nas modalidades: Acompanhado, Individual e Delivery",
                btnTextModal: "APROVEITAR O APP"
            })
            this.props.storageSubscription(response.subscription);
            if (this.state.method === 'credit') {
                this.fadeInPaymentCredit()
            }else if (this.state.method === 'debit') {
                this.fadeInPaymentDebit()
            }
        }
    }

    nextStep1(){
        let form = {
            name: this.state.name,
            cpf: this.state.cpf,
            nascimento: this.state.nascimento,
            celular: this.state.celular,
            email: this.state.email,
        }
        let response = PaymentValidations.firstStep(form);
        if (response.error) {
            Keyboard.dismiss()
            this.refs.toast.show(response.message, 5000);
            if (response.campo === "Name" || response.campo === "Cpf" || response.campo === "Nascimento" || response.campo === "Celular" || response.campo === "Email") {
                this.setState({
                    step: 'dados'
                })
            }
            this.setState({
                ["error" + response.campo + "Message"]: response.message,
                loading: false
            })
        } else {
            this.props.storageInputs(response.form);
            this.saveFirstStep(response.form);
            this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
            if(this.state.step === 'card'){
                this.nextStep2();
            }else{
                this.setState({
                    step: 'address'
                })
            }
        }
    }

    confirmPayment(){
        let brandCard = this.detectCardType(this.state.nuCartao);
        let form = {
            name: this.state.name,
            cpf: this.state.cpf,
            email: this.state.email,
            nascimento: this.state.nascimento,
            celular: this.state.celular,
            zipcode: this.state.zipcode,
            uf: this.state.uf,
            city: this.state.city,
            district: this.state.district,
            street: this.state.street,
            number: this.state.number,
            method: this.state.method,
            email: this.state.email,

            parcelas: this.state.parcelas,
            brand: brandCard,
            nuCartao: this.state.nuCartao,
            nameCartao: this.state.nameCartao,
            dtCartao: this.state.dtCartao,
            cvcCartao: this.state.cvcCartao,
        }
        this.setState({loading: true});
        
        let response = PaymentValidations.cardMethod(form);
        if (response.error) {
            Keyboard.dismiss()
            this.refs.toast.show(response.message, 5000);
            this.setState({
                ["error" + response.campo + "Message"]: response.message,
                loading: false
            })
            if (this.state.method === 'credit') {
                this.fadeInPaymentCredit()
            }else if (this.state.method === 'debit') {
                this.fadeInPaymentDebit()
            }
        } else {
            this.setState({
                step: 'card'
            })
            this.props.storageInputs(response.form);
            
            if (this.state.method === 'credit') {
                this.subscription(response.form);
            }else if (this.state.method === 'debit') {
                this.subscription(response.form);
            }
            this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
        }
    }
    
    nextStep2(){
        let form = {
            name: this.state.name,
            cpf: this.state.cpf,
            nascimento: this.state.nascimento,
            celular: this.state.celular,
            email: this.state.email,

            zipcode: this.state.zipcode,
            uf: this.state.uf,
            city: this.state.city,
            district: this.state.district,
            street: this.state.street,
            number: this.state.number,
            complement: this.state.complement,
        }
        let response = PaymentValidations.secondStep(form);
        if (response.error) {
            if (response.campo === "Cep" || response.campo === "Uf" || response.campo === "City" || response.campo === "Street" || response.campo === "Bairro" || response.campo === "Numero") {
                this.setState({
                    step: 'address'
                })
            }
            Keyboard.dismiss()
            this.refs.toast.show(response.message, 5000);
            this.setState({
                ["error" + response.campo + "Message"]: response.message,
                loading: false
            })
        } else {
            this.saveSecondStep(response.form)
            this.props.storageInputs(response.form);
            if(this.state.method === 'boleto' && this.state.step === 'card'){
                this.subscriptionBoleto(response.form);
            }else if((this.state.method === 'debit' || this.state.method === 'credit') && this.state.step === 'card'){
                this.confirmPayment(response.form);
            }else{
                this.setState({
                    step: 'card'
                })
            }
        }
    }

    async loadCep(zipcode){
        //Requisição de LOAD CEP
        zipcode = zipcode.replace(/\D/g, '');
        let response = await fetch(`https://api.pagar.me/1/zipcodes/${zipcode}`);
        response = await response.json();
        if (response && response.state) {
            
            this.setState({
                uf: response.state,
                city: response.city,
                district: response.neighborhood,
                street: response.street,
            })
            this.refs.number.focus()
        }else{
            this.refs.uf.focus()
        }
    }

    stepDados(){
        return(
            <View>
                <View style={styles.contentFormDados}>
                    <View style={styles.txtInputContainer}>
                        <TextInput 
                            ref={'name'}
                            style={[styles.txtInputContent, { color: this.state.errorNameMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Nome Completo*"}
                            value={this.state.name}
                            autoCapitalize={'words'}
                            onChangeText={(name)=> this.setState({ name, errorNameMessage: null})}
                            onSubmitEditing={() => { this.refs.cpf._inputElement.focus()}}
                            placeholderTextColor={this.state.errorNameMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                    { this.state.errorNameMessage ?  <Text style={styles.labelError}>{this.state.errorNameMessage}</Text> :  null }
                    <View style={styles.txtInputContainer}>
                        <TextInputMask
                            ref={'cpf'}
                            style={[styles.txtInputContent, { color: this.state.errorCpfMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"CPF*"}
                            value={this.state.cpf}
                            returnKeyType={'done'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 100, animated: true });}}
                            onChangeText={(cpf)=> this.setState({ cpf, errorCpfMessage: null})}
                            onSubmitEditing={() => {this.refs.nascimento._inputElement.focus() }}
                            placeholderTextColor={this.state.errorCpfMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            type={'datetime'} options={{ format: 'YYY.YYY.YYY-YY'}}
                        />
                    </View>

                    { this.state.errorCpfMessage ?  <Text style={styles.labelError}>{this.state.errorCpfMessage}</Text> :  null }
                    <View style={styles.txtInputContainer}>
                        <TextInputMask 
                            ref={'nascimento'}
                            style={[styles.txtInputContent, { color: this.state.errorNascimentoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Data de nascimento*"}
                            value={this.state.nascimento}
                            keyboardType={'number-pad'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 150, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(nascimento)=> this.setState({ nascimento, errorNascimentoMessage: null})}
                            onSubmitEditing={() => {this.refs.telefone._inputElement.focus() }}
                            placeholderTextColor={this.state.errorNascimentoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            type={'datetime'} options={{ format: 'YY/YY/YYYY'}}
                        />
                    </View>
                    { this.state.errorNascimentoMessage ?  <Text style={styles.labelError}>{this.state.errorNascimentoMessage}</Text> :  null }
                    <View style={styles.txtInputContainer}>
                        <TextInputMask 
                            ref={'telefone'}
                            style={[styles.txtInputContent, { color: this.state.errorCelularMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Celular"}
                            value={this.state.celular}
                            keyboardType={'number-pad'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 100, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(celular)=> this.setState({ celular, errorCelularMessage: null})}
                            onSubmitEditing={() => this.refs.email.focus() }
                            placeholderTextColor={this.state.errorCelularMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            type={'datetime'} options={{ format: '(YY) YYYYY-YYYY'}}
                        />
                    </View>
                    { this.state.errorCelularMessage ?  <Text style={styles.labelError}>{this.state.errorCelularMessage}</Text> :  null }
                    <View style={styles.txtInputContainer}>
                        <TextInput
                            ref={'email'}
                            style={[styles.txtInputContent, { color: this.state.errorEmailMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"E-mail"}
                            value={this.state.email}
                            keyboardType={'email-address'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 180, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(email)=> this.setState({ email, errorEmailMessage: null})}
                            onSubmitEditing={() => {this.nextStep1(); Keyboard.dismiss() }}
                            placeholderTextColor={this.state.errorEmailMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                    { this.state.errorEmailMessage ?  <Text style={styles.labelError}>{this.state.errorEmailMessage}</Text> :  null }
                </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => this.nextStep1()}>
                    {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>CONTINUAR</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    stepAddress(){
        return(
        <View>
            <View style={styles.contentFormDados}>
                <View style={styles.txtInputContainer}>
                    <TextInputMask 
                        ref={'zipcode'}
                        style={[styles.txtInputContent, { color: this.state.errorCepMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"CEP*"}
                        value={this.state.zipcode}
                        keyboardType={'number-pad'}
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });}}
                        returnKeyType={'done'}
                        onChangeText={(zipcode)=> {
                            this.setState({ zipcode, errorCepMessage: null})
                            if(zipcode && zipcode.length == 9){
                                this.loadCep(zipcode)
                            }
                        }}
                        placeholderTextColor={this.state.errorCepMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        type={'datetime'} options={{ format: 'YYYYY-YYY'}}
                    />
                </View>
                { this.state.errorCepMessage ?  <Text style={styles.labelError}>{this.state.errorCepMessage}</Text> :  null }
                <View style={{flexDirection: 'row'}}>

                    <View style={[styles.txtInputContainer, {flex: 1}]}>
                        <TextInput
                            ref={'uf'}
                            style={[styles.txtInputContent, { color: this.state.errorUfMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"UF*"}
                            value={this.state.uf}
                            returnKeyType={'done'}
                            maxLength={2}
                            autoCapitalize={'characters'}
                            onChangeText={(uf)=> {
                                this.setState({ uf, errorUfMessage: null})
                                
                            }}
                            onSubmitEditing={() => {this.refs.cidade.focus() }}
                            placeholderTextColor={this.state.errorUfMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>

                    <View style={[styles.txtInputContainer, {flex: 3, marginLeft: 10}]}>
                        <TextInput
                            ref={'cidade'}
                            style={[styles.txtInputContent, { color: this.state.errorCityMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Cidade*"}
                            value={this.state.city}
                            returnKeyType={'done'}
                            onChangeText={(city)=> {
                                this.setState({ city, errorCityMessage: null})
                                
                            }}
                            onSubmitEditing={() => {this.refs.address.focus() }}
                            placeholderTextColor={this.state.errorCityMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                </View>
                { this.state.errorCityMessage ?  <Text style={styles.labelError}>{this.state.errorCityMessage}</Text> : this.state.errorUfMessage ? <Text style={styles.labelError}>{this.state.errorUfMessage}</Text>  : null }
                <View style={styles.txtInputContainer}>
                    <TextInput
                        ref={'address'}
                        style={[styles.txtInputContent, { color: this.state.errorStreetMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Endereço*"}
                        value={this.state.street}
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 200, animated: true });}}
                        returnKeyType={'done'}
                        autoCapitalize={'words'}
                        onChangeText={(street)=> {
                            this.setState({ street, errorStreetMessage: null})
                        }}
                        onSubmitEditing={() => {this.refs.district.focus() }}
                        placeholderTextColor={this.state.errorStreetMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorStreetMessage ?  <Text style={styles.labelError}>{this.state.errorStreetMessage}</Text> :  null }
                <View style={{flexDirection: 'row'}}>
                    <View style={[styles.txtInputContainer, {flex: 3}]}>
                        <TextInput
                            ref={'district'}
                            style={[styles.txtInputContent, { color: this.state.errorBairroMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Bairro*"}
                            value={this.state.district}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 250, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(district)=> {
                                this.setState({ district, errorBairroMessage: null})
                            }}
                            onSubmitEditing={() => {this.refs.number.focus() }}
                            placeholderTextColor={this.state.errorBairroMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                    <View style={[styles.txtInputContainer, {flex: 1, marginLeft: 10}]}>
                        <TextInput
                            ref={'number'}
                            style={[styles.txtInputContent, { color: this.state.errorNumeroMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Número*"}
                            value={this.state.number}
                            maxLength={5}
                            keyboardType={'number-pad'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 200, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(number)=> {
                                this.setState({ number, errorNumeroMessage: null})
                            }}
                            onSubmitEditing={() => {this.refs.complement.focus() }}
                            placeholderTextColor={this.state.errorNumeroMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                </View>
                { this.state.errorBairroMessage ?  <Text style={styles.labelError}>{this.state.errorBairroMessage}</Text> : this.state.errorNumeroMessage ? <Text style={styles.labelError}>{this.state.errorNumeroMessage}</Text>  : null }
                <View style={styles.txtInputContainer}>
                    <TextInput 
                        ref={'complement'}
                        style={[styles.txtInputContent, { color: this.state.errorcomplementMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Complemento"}
                        value={this.state.complement}
                        returnKeyType={'done'}
                        onChangeText={(complement)=> {
                            this.setState({ complement, errorcomplementMessage: null})
                            
                        }}
                        onSubmitEditing={() => { Keyboard.dismiss() }}
                        placeholderTextColor={this.state.errorcomplementMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorcomplementMessage ?  <Text style={styles.labelError}>{this.state.errorcomplementMessage}</Text> :  null }
                
            </View>
                <TouchableOpacity style={styles.mainBtn} onPress={() => this.nextStep2()}>
                {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>CONTINUAR</Text>}
            </TouchableOpacity>
        </View>
        )
    }

    trataPreco(value, parcelas){
        value = ((value/100)/parcelas);
        value = value.toLocaleString("pt-BR", {style: 'currency', currency: 'BRL'})
        return value
    }

    parcelas(){
        let { selectedPLan } = this.props;
        
        return(
            <View style={styles.txtInputContainer}>
                <RNPickerSelect
                    style={pickerSelectStyles}
                    value={this.state.parcelas}
                    placeholder={{
                        color: COLOR.BLACK,
                        label: "Parcelas", 
                        value: null, 
                    }}
                    onValueChange={(value) => {this.setState({parcelas: value})}}
                    items={[
                        { label: `1x de ${this.trataPreco(selectedPLan.plan.price, 1)}`, value: 1 },
                        { label: `2x de ${this.trataPreco(selectedPLan.plan.price, 2)}`, value: 2 },
                        { label: `3x de ${this.trataPreco(selectedPLan.plan.price, 3)}`, value: 3 },
                        { label: `4x de ${this.trataPreco(selectedPLan.plan.price, 4)}`, value: 4 },
                        { label: `5x de ${this.trataPreco(selectedPLan.plan.price, 5)}`, value: 5 },
                        { label: `6x de ${this.trataPreco(selectedPLan.plan.price, 6)}`, value: 6 },
                        { label: `7x de ${this.trataPreco(selectedPLan.plan.price, 7)}`, value: 7 },
                        { label: `8x de ${this.trataPreco(selectedPLan.plan.price, 8)}`, value: 8 },
                        { label: `9x de ${this.trataPreco(selectedPLan.plan.price, 9)}`, value: 9 },
                        { label: `10x de ${this.trataPreco(selectedPLan.plan.price, 10)}`, value: 10 },
                        { label: `11x de ${this.trataPreco(selectedPLan.plan.price, 11)}`, value: 11 },
                        { label: `12x de ${this.trataPreco(selectedPLan.plan.price, 12)}`, value: 12 },
                    ]}
                /> 
            </View>
        )
    }

    cardCredit(){
        return(
            <Animated.View style={[styles.btnPaymentMethod, {borderColor: this.state.activedPayments && this.state.activedPayments.credit  ? COLOR.SECONDARY : COLOR.GREY_WHITE, height: this.state.fadePaymentCredit}]}>
                <TouchableOpacity style={styles.btnSelectPayment} onPress={() => {
                    if(this.state.method == 'credit' ){
                        this.setState({ method: null }); 
                        this.fadeOutPaymentCredit();
                    }else{
                        this.fadeOutPaymentBoleto();
                        this.fadeOutPaymentDebit();
                        this.fadeInPaymentCredit();
                        this.setState({ method: 'credit'}); 

                    }}}
                    >
                    <View style={styles.flexRow}>
                        <View style={styles.iconContentPaymentMethod}>
                            {this.state.method === 'credit'  ? <Image source={require('../assets/perfil/correctY.png')} style={styles.iconCorrectPaymentMethod}/> : null }
                        </View>
                        <Text style={styles.txtPaymentMethod}>Cartão de Crédito</Text>
                    </View>
                    <View>
                        <Image source={require('../assets/perfil/card2Y.png')} style={styles.iconPaymentMethod}/>
                    </View>
                </TouchableOpacity>
                
                {this.state.method === 'credit'  ? 
                    this.formCard()
                : null}
            </Animated.View>
        )
    }

    cardDebit(){
        return(
            <Animated.View style={[styles.btnPaymentMethod, {borderColor: this.state.activedPayments && this.state.activedPayments.debit  ? COLOR.SECONDARY : COLOR.GREY_WHITE, height: this.state.fadePaymentDebit}]}>
                <TouchableOpacity style={styles.btnSelectPayment} onPress={() => {
                    if(this.state.method == 'debit' ){
                        this.setState({ method: null }); 
                        this.fadeOutPaymentDebit();
                    }else{
                        this.fadeOutPaymentBoleto();
                        this.fadeOutPaymentCredit();
                        this.fadeInPaymentDebit();
                        this.setState({ method: 'debit',  }); 

                    }}}
                    >
                    <View style={styles.flexRow}>
                        <View style={styles.iconContentPaymentMethod}>
                            {this.state.method === 'debit'  ? <Image source={require('../assets/perfil/correctY.png')} style={styles.iconCorrectPaymentMethod}/> : null }
                        </View>
                        <Text style={styles.txtPaymentMethod}>Cartão de Débito</Text>
                    </View>
                    <View>
                        <Image source={require('../assets/perfil/card2Y.png')} style={styles.iconPaymentMethod}/>
                    </View>
                </TouchableOpacity>
                
                {this.state.method === 'debit'  ? 
                    this.formCard()
                : null}
            </Animated.View>
        )
    }

    boletoMethod(){
        return(
            <Animated.View style={[styles.btnPaymentMethod, {borderColor: this.state.activedPayments && this.state.activedPayments.boleto ? COLOR.SECONDARY : COLOR.GREY_WHITE, height: this.state.fadePaymentBoleto}]}>
                <TouchableOpacity style={styles.btnSelectPayment} onPress={() => {
                    if(this.state.method == 'boleto' ){
                        this.setState({ method: null }); 
                        this.fadeOutPaymentBoleto();
                    }else{
                        this.fadeOutPaymentDebit()
                        this.fadeOutPaymentCredit()
                        this.fadeInPaymentBoleto();
                        this.setState({ method: 'boleto'}); 
                    }}}
                    >
                    <View style={styles.flexRow}>
                        <View style={styles.iconContentPaymentMethod}>
                            { this.state.method === 'boleto' ? <Image source={require('../assets/perfil/correctY.png')} style={styles.iconCorrectPaymentMethod}/> : null }
                        </View>
                        <Text style={styles.txtPaymentMethod}>Boleto Bancário</Text>
                    </View>
                    <View>
                        <Image source={require('../assets/perfil/boletoY.png')} style={styles.iconPaymentMethod}/>
                    </View>
                </TouchableOpacity>
                
                {this.state.method === 'boleto' ? 
                    <View style={{flex: 1}}>
                        <Text style={styles.descrBoleto}>Usaremos o número de CPF fornecido anteriormente para gerar seu boleto e dar continuidade ao seu processo de assinatura do Rota Gourmet.</Text>
                    
                        <TouchableOpacity style={styles.mainBtn} onPress={() => {
                            if(!this.state.loading){
                                this.setState({loading: true})
                                this.nextStep1();
                            }
                        }}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>GERAR BOLETO</Text>}
                        </TouchableOpacity>
                    </View>
                : null}
            </Animated.View>
        )
    }

    formCard(){
        return(
            <View style={{flex: 1}}>
                <View style={styles.contentFormDados}>
                    <View style={[styles.txtInputContainer, {flexDirection: 'row',}]}>
                        <TextInput
                            ref={'nuCartao'}
                            style={[styles.txtInputContent, {flex: 4, color: this.state.errorNuCartaoMessag ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Número no Cartão*"}
                            value={this.state.nuCartao}
                            keyboardType={'number-pad'}
                            // onEndEditing={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });}}
                            onChangeText={(nuCartao)=> this.setState({ nuCartao, errorNuCartaoMessage: null})}
                            onSubmitEditing={() => { this.refs.nameCartao.focus()}}
                            placeholderTextColor={this.state.errorNuCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            {this.state.nuCartao && this.state.nuCartao[0] == '5' ? <Image source={require('../assets/cards/mastercard.png')}  style={styles.brandLogo}  /> :
                            this.state.nuCartao && this.state.nuCartao[0] == '4' ? <Image source={require('../assets/cards/visa.png')}  style={styles.brandLogo}  /> :
                            this.state.nuCartao && this.state.nuCartao[0] && (((this.state.nuCartao[0] + this.state.nuCartao[1]) == '36') || ((this.state.nuCartao[0] + this.state.nuCartao[1]) == '38')) ? <Image source={require('../assets/cards/dinners.png')}  style={styles.brandLogo}  /> :
                            this.state.nuCartao && this.state.nuCartao[0] && (((this.state.nuCartao[0] + this.state.nuCartao[1]) == '34') || ((this.state.nuCartao[0] + this.state.nuCartao[1]) == '37')) ? <Image source={require('../assets/cards/american.png')}  style={styles.brandLogo}  /> : null
                            }
                        </View>
                    </View>
                    { this.state.errorNuCartaoMessage ?  <Text style={styles.labelError}>{this.state.errorNuCartaoMessage}</Text> :  null }
                    <View style={styles.txtInputContainer}>
                        <TextInput 
                            ref={'nameCartao'}
                            style={[styles.txtInputContent, { color: this.state.errorNameCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"Nome Completo*"}
                            value={this.state.nameCartao}
                            // onEndEditing={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });}}
                            autoCapitalize={'words'}
                            onChangeText={(nameCartao)=> this.setState({ nameCartao, errorNameCartaoMessage: null})}
                            onSubmitEditing={() => { this.refs.dtCartao._inputElement.focus()}}
                            placeholderTextColor={this.state.errorNameCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                    { this.state.errorNameCartaoMessage ?  <Text style={styles.labelError}>{this.state.errorNameCartaoMessage}</Text> :  null }
                    <View style={{flexDirection: 'row'}}>
                        <View style={[styles.txtInputContainer, {flex: 1}]}>
                            <TextInputMask
                                ref={'dtCartao'}
                                style={[styles.txtInputContent, { color: this.state.errorDtCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={"Data de Válidade*"}
                                value={this.state.dtCartao}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 250, animated: true });}}
                                returnKeyType={'done'}
                                onChangeText={(dtCartao)=> {
                                    this.setState({ dtCartao, errorDtCartaoMessage: null})
                                }}
                                onSubmitEditing={() => {this.refs.cvcCartao.focus() }}
                                placeholderTextColor={this.state.errorDtCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                                type={'datetime'} options={{ format: 'YY/YY'}}
                            />
                        </View>
                        <View style={[styles.txtInputContainer, {flex: 1, marginLeft: 10}]}>
                            <TextInput
                                ref={'cvcCartao'}
                                style={[styles.txtInputContent, { color: this.state.errorCvcCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={"CVC*"}
                                value={this.state.cvcCartao}
                                maxLength={3}
                                keyboardType={'number-pad'}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 250, animated: true });}}
                                returnKeyType={'done'}
                                onChangeText={(cvcCartao)=> {
                                    this.setState({ cvcCartao, errorCvcCartaoMessage: null})
                                }}
                                onSubmitEditing={() => {  }}
                                placeholderTextColor={this.state.errorCvcCartaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            />
                        </View>
                        
                    </View>
                    { this.state.errorDtCartaoMessage ?  <Text style={styles.labelError}>{this.state.errorDtCartaoMessage}</Text> : this.state.errorCvcCartaoMessage ? <Text style={styles.labelError}>{this.state.errorCvcCartaoMessage}</Text>  : null }
                    {this.props.selectedPLan.plan.title !== "Mensal" && Platform.OS !== "android" ? this.parcelas() : null }
                </View>
                <View style={{ paddingLeft: 15, flexDirection:"row", alignItems: 'center'}}>
                    <View>
                        <Image source={require('../assets/images/icon.png')} 
                        style={{borderRadius: 6, height: responsiveHeight(8), width: responsiveHeight(8)}} />
                    </View>
                    <View style={{paddingLeft: 10}}>
                        <Text style={{color: COLOR.BLACK, fontSize: FONT.SMALL}}>Rota Gourmet - Plano {this.props.selectedPLan.plan.title}</Text>
                        <Text style={{color: COLOR.GREY, fontSize: FONT.XSMALL}}>Será cobrado: {
                        this.props.selectedPLan.plan.title === "Mensal" ? (this.props.selectedPLan.plan.price/100).toLocaleString("pt-BR",{style: 'currency', currency: 'BRL'}) : 
                        `${this.state.parcelas} parcelas de ${this.trataPreco(this.props.selectedPLan.plan.price, this.state.parcelas)}`}</Text>
                        {this.props.selectedPLan && this.props.selectedPLan.cupom && <Text style={{color: COLOR.GREY, fontSize: FONT.XSMALL}}>no dia {moment().add(this.props.selectedPLan.cupom.voucherTime, "days").format("DD/MM/YYYY")}</Text>}
                    </View>
                </View>

                <TouchableOpacity style={styles.mainBtn} onPress={() => {
                        this.nextStep1();
                    if(!this.state.loading){
                    }
                }}>
                    {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>CONCLUIR</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    stepsCard(){
        return(
            <View>
                {this.props.selectedPLan.plan.activedPayments && this.props.selectedPLan.plan.activedPayments.credit ? this.cardCredit() : null}
                {/* {this.props.selectedPLan.plan.activedPayments && this.props.selectedPLan.plan.activedPayments.debit ? this.cardDebit() : null} */}
                {this.props.selectedPLan.plan.activedPayments && this.props.selectedPLan.plan.activedPayments.boleto ? this.boletoMethod() : null}
            </View>
        )
    }

    detectCardType(number) {
        let re = {
            "Elo": /^((((636368)|(438935)|(504175)|(451416)|(636297)(506699)|(636369))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
            "Hipercard": /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
            "Visa": /^4[0-9]{12}(?:[0-9]{3})?$/,
            "Master": /^5[1-5][0-9]{14}$/,
            "Amex": /^3[47][0-9]{13}$/,
            "Diners": /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            "Discover": /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            "JCB": /^(?:2131|1800|35\d{3})\d{11}$/
        }

        for(var key in re) {
            if(re[key].test(number)) {
                return key
            }
        }
    }

    eventSubscription(){
        this.setState({
            welcome: false,
        })
        Events.publish("UpdateSubscription");
        this.props.navigation.goBack();
        this.props.navigation.goBack();
        this.props.navigation.navigate("Home");
    }

    suporte(){
        let text = `Olá, sou ${this.state.user.name}. Meu e-mail é ${this.state.user.email}, meu celular é sistema operacional ${this.state.platform} ${this.state.platformVersion}, modelo ${this.state.deviceName}.\nEstou com problemas para realizar a assinatura, poderia me auxiliar?`
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${this.state.phone}&text=${text}` : `whatsapp://send?phone=${this.state.phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }

    render(){
        const { step, plans, welcome } = this.state;

        return(
            <View style={[styles.flex1, {backgroundColor: '#F8F8FA'}]}>
                <Pageheader title={"DADOS"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <ScrollView ref="homeScroll" contentContainerStyle={{paddingBottom: 170, }}>
                        <View style={styles.stepContainer}>
                            {/* <View style={{ position: 'absolute', height: 1, backgroundColor: COLOR.SECONDARY, top: '50%', zIndex: 0, width: '100%', right: responsiveHeight(5), left: responsiveHeight(5)}} /> */}
                            <TouchableOpacity onPress={() => this.setState({ step: 'dados' })} style={[styles.stepBtn, {backgroundColor: step == 'dados' ? COLOR.SECONDARY : '#F8F8FA'}]}>
                                <Image source={ step == 'dados' ? require('../assets/perfil/google-applicationB.png') : require('../assets/perfil/google-applicationY.png') } style={styles.stepIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {if(step === "card") {this.setState({ step: 'address' })}}} style={[styles.stepBtn, {backgroundColor: step == 'address' ? COLOR.SECONDARY : '#F8F8FA'}]}>
                                <Image source={ step == 'address' ? require('../assets/perfil/placeB.png') : require('../assets/perfil/placeY.png') } style={styles.stepIcon}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.stepBtn, {backgroundColor: step == 'card' ? COLOR.SECONDARY : '#F8F8FA'}]}>
                                <Image source={ step == 'card' ? require('../assets/perfil/cardB.png') : require('../assets/perfil/cardY.png') } style={styles.stepIcon}/>
                            </TouchableOpacity>
                        </View>
                        <KeyboardAvoidingView
                            style={styles.container}
                            behavior={Platform.select({
                                ios: 'padding',
                                android: null,
                            })}
                        >
                            { this.state.step == 'dados' ? this.stepDados() : this.state.step == 'address' ?  this.stepAddress() : this.stepsCard() }
                        </KeyboardAvoidingView>

                    <View style={[styles.flexRow, {justifyContent: 'center',}]} >
                        <TouchableOpacity style={styles.containerTermos} onPress={() => {WebBrowser.openBrowserAsync('https://file-upload-rota.s3.amazonaws.com/arquivos/Termos+de+Uso.pdf')}}>
                            <Text style={styles.termos}>Termos de uso <Text style={{color:COLOR.GREY}}>e</Text> Política de privacidade</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
                {welcome ? 
                    <ModalHappy
                        title={this.state.titleModal}
                        method={this.state.method}
                        subtitle={this.state.contentModal}
                        btnText={this.state.btnTextModal}
                        paymentError={this.state.paymentError}
                        onChange={(fn) => { this.setState({ welcome: false }); }}
                        onRoute={(fn) => this.state.paymentError ? this.suporte() : this.eventSubscription()}
                    />
                : null}
                <Toast ref="toast" />
            </View>
        )
    }
}

const pickerSelectStyles = StyleSheet.create({
    placeholder: {
        color: COLOR.GREY,
    },
    inputIOS: {
        fontSize: FONT.XSMALL,
        paddingVertical: 12,
        paddingHorizontal: 10,
        color: COLOR.GREY,
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: FONT.XSMALL,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: COLOR.GREY,
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});

const styles = StyleSheet.create({
    descrBoleto: {
        marginHorizontal: 15,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY
    },
    brandLogo: {
        height: responsiveHeight(5),
        width: responsiveHeight(5),
    },
    btnSelectPayment: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 10, 
        paddingVertical: 15,
    },
    iconContentPaymentMethod: {
        borderColor: COLOR.SECONDARY,
        borderWidth: 1,
        borderRadius: 10,
        height: responsiveHeight(2.5),
        width: responsiveHeight(2.5),
    },
    iconPaymentMethod: {
        height: responsiveHeight(3.5),
        width: responsiveHeight(3.5),
    },
    txtPaymentMethod: {
        paddingLeft: 10,
        // fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY
    },
    iconCorrectPaymentMethod: {
        height: responsiveHeight(2.5),
        width: responsiveHeight(2.5),
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnPaymentMethod: {
        borderWidth: 0.8,
        borderRadius: 6,
        marginTop: 15,
        marginHorizontal: 15
    },
    containerTermos: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,

    },
    termos: {
        fontSize: FONT.SMALL,
        textAlign: 'center',
        color: COLOR.PRIMARY,

    },
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    mainBtn: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        marginVertical:20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 15,
    },
    textAcordo: {
        fontSize: FONT.LABEL,
        textAlign: 'center',
        color: COLOR.GREY,
        paddingHorizontal: 20

    },
    txtInputContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    txtInputContainer: {
        marginTop: 10,
        marginBottom: 5,
        justifyContent: 'space-between',
        backgroundColor: COLOR.WHITE,
        borderColor: COLOR.GREY_WHITE,
        borderWidth: 0.3,
        borderRadius: 6,
        padding: 5
    },
    contentFormDados: {
        flex: 1,
        padding: 15
    },

    labelError: {
        color: 'red',
        paddingLeft: 5,
        fontSize: FONT.LABEL
    },

    // STEP STYLES: 
    stepBtn: {
        // flex: 1,
        padding: 17,
        borderRadius: 40,
        borderColor: COLOR.SECONDARY,
        borderWidth: 1.5,
        // height: responsiveHeight(3),
        // width: responsiveHeight(3),
    },
    stepIcon: {
        height: responsiveHeight(3.1),
        width: responsiveHeight(3.1),
    },
    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveHeight(5)
    },
    container: {
        // flex:1,
        // backgroundColor: COLOR.BACKGROUND
    },
    flex1: {

    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    selectedPLan: store.InfoReducer.selectedPLan,
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageInputs, storageUserData, storageSubscription }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Dados);