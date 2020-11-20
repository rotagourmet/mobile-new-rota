import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, KeyboardAvoidingView, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Toast from 'react-native-easy-toast';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageInputs } from '../actions';

import PaymentValidations from '../utils/PaymentValidations';
import Pageheader from '../components/Pageheader';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');
const server = getApi('api');

class QueroParticipar extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            modal: false
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }

    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    validarCampos(){
        this.setState({
            loading: true
        })
        let form = {
            nomeRestaurante: this.state.nomeRestaurante,
            name: this.state.name,
            uf: this.state.uf,
            city: this.state.city,
            celular: this.state.celular,
            email: this.state.email,

            instagram: this.state.instagram,
            observacao: this.state.observacao,
        }

        let response = PaymentValidations.QueroParticiparForm(form);
        if (response.error) {
            Keyboard.dismiss()
            this.refs.toast.show(response.message, 5000);
            this.setState({
                ["error" + response.campo + "Message"]: response.message,
                loading: false
            })
        } else {
            Keyboard.dismiss()
            this.props.storageInputs(response.form);
            this.sendEmail(response.form);
            this.setState({
                
            })
            this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
        }
    }

    async sendEmail(form){
        //Requisição de envio do fomulário
        let response = await fetch(server.url + `api/restaurants/queroParticipar?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        });
        response = await response.json()
        if (!response.error) {
            this.setState({
                modal: true,
                loading: false
            })
        }else{
            this.setState({
                loading: false
            })
        }
    }

    form(){
        return(
            <View style={styles.contentFormDados}>
                <View style={styles.txtInputContainer}>
                    <TextInput 
                        ref={'nomeRestaurante'}
                        style={[styles.txtInputContent, { color: this.state.errorNomeRestauranteMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Nome do Restaurante*"}
                        value={this.state.nomeRestaurante}
                        autoCapitalize={'words'}
                        onChangeText={(nomeRestaurante)=> this.setState({ nomeRestaurante, errorNomeRestauranteMessage: null})}
                        onSubmitEditing={() => { this.refs.name.focus()}}
                        placeholderTextColor={this.state.errorNomeRestauranteMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorNomeRestauranteMessage ?  <Text style={styles.labelError}>{this.state.errorNomeRestauranteMessage}</Text> :  null }
                <View style={styles.txtInputContainer}>
                    <TextInput 
                        ref={'name'}
                        style={[styles.txtInputContent, { color: this.state.errorNameMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Nome para Contato*"}
                        value={this.state.name}
                        autoCapitalize={'words'}
                        onChangeText={(name)=> this.setState({ name, errorNameMessage: null})}
                        onSubmitEditing={() => { this.refs.uf.focus()}}
                        placeholderTextColor={this.state.errorNameMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorNameMessage ?  <Text style={styles.labelError}>{this.state.errorNameMessage}</Text> :  null }
                <View style={{flexDirection: 'row'}}>

                    <View style={[styles.txtInputContainer, {flex: 1}]}>
                        <TextInput
                            ref={'uf'}
                            style={[styles.txtInputContent, { color: this.state.errorUfMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                            placeholder={"UF*"}
                            value={this.state.uf}
                            returnKeyType={'done'}
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 80, animated: true });}}
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
                            onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 80, animated: true });}}
                            returnKeyType={'done'}
                            onChangeText={(city)=> {
                                this.setState({ city, errorCityMessage: null})
                                
                            }}
                            onSubmitEditing={() => {this.refs.telefone._inputElement.focus() }}
                            placeholderTextColor={this.state.errorCityMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                        />
                    </View>
                </View>
                { this.state.errorCityMessage ?  <Text style={styles.labelError}>{this.state.errorCityMessage}</Text> : this.state.errorUfMessage ? <Text style={styles.labelError}>{this.state.errorUfMessage}</Text>  : null }
                <View style={styles.txtInputContainer}>
                    <TextInputMask 
                        ref={'telefone'}
                        style={[styles.txtInputContent, { color: this.state.errorCelularMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Celular"}
                        value={this.state.celular}
                        keyboardType={'number-pad'}
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 120, animated: true });}}
                        returnKeyType={'done'}
                        onChangeText={(celular)=> this.setState({ celular, errorCelularMessage: null})}
                        onSubmitEditing={() => { this.refs.email.focus() }}
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
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 140, animated: true });}}
                        returnKeyType={'done'}
                        onChangeText={(email)=> this.setState({ email, errorEmailMessage: null})}
                        onSubmitEditing={() => { this.refs.instagram.focus() }}
                        placeholderTextColor={this.state.errorEmailMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorEmailMessage ?  <Text style={styles.labelError}>{this.state.errorEmailMessage}</Text> :  null }
                <View style={styles.txtInputContainer}>
                    <TextInput
                        ref={'instagram'}
                        style={[styles.txtInputContent, { color: this.state.errorInstagramMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Instagram"}
                        value={this.state.instagram}
                        keyboardType={'email-address'}
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 160, animated: true });}}
                        returnKeyType={'done'}
                        onChangeText={(instagram)=> this.setState({ instagram, errorInstagramMessage: null})}
                        onSubmitEditing={() => { this.refs.observacao.focus() }}
                        placeholderTextColor={this.state.errorInstagramMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorInstagramMessage ?  <Text style={styles.labelError}>{this.state.errorInstagramMessage}</Text> :  null }
                <View style={styles.txtInputContainer}>
                    <TextInput
                        ref={'observacao'}
                        style={[styles.txtInputContent, { color: this.state.errorObservacaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Observação"}
                        value={this.state.observacao}
                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 180, animated: true });}}
                        returnKeyType={'done'}
                        onChangeText={(observacao)=> this.setState({ observacao, errorObservacaoMessage: null})}
                        onSubmitEditing={() => {Keyboard.dismiss(); this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });}}
                        placeholderTextColor={this.state.errorObservacaoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorObservacaoMessage ?  <Text style={styles.labelError}>{this.state.errorObservacaoMessage}</Text> :  null }
            </View>
        )
    }

    render(){
        return(
            <View styles={styles.flex1}>
                <Pageheader title={"QUERO ENTRAR"}  navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <ScrollView ref="homeScroll" contentContainerStyle={{paddingBottom: 250}}>
                    <KeyboardAvoidingView style={styles.container}
                        behavior={Platform.select({
                            ios: 'padding',
                            android: null,
                        })}
                    >
                    {this.form()}

                <TouchableOpacity style={styles.mainBtn} onPress={() => this.validarCampos()}>
                    {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>ENVIAR</Text>}
                </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
                
                { this.state.modal ?
                    <View style={styles.wholeContentModal}>
                        <View style={styles.wholeSizeModal}>
                            <TouchableOpacity style={styles.closeModal} onPress={() => { this.setState({modal: false}); }}>
                                <Text style={styles.Xbtn}>X</Text>
                            </TouchableOpacity>
                            <View style={styles.animationContainer}>
                                <Image source={require('../assets/images/sent.png')} style={styles.iconeModal}/>
                            </View>
                            <View style={styles.titleModal}>
                                <Text style={styles.labelTitleModal}>Enviado com Sucesso</Text>
                            </View>
                            <View>
                                <View style={{ marginTop: 15 }} >
                                    <Text style={styles.labelContent}>Seu formulário, foi enviado com sucesso, em breve a equipe do Rota Gourmet entrará em contato.</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.mainBtn, {paddingVertical: 10, marginTop: 15}]} onPress={() => {this.setState({modal: false}); this.props.navigation.goBack(); }}>
                                <Text style={styles.mainBtnLabel}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                : null }
                <Toast ref="toast" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // INICIO DO MODAL
    labelContent: { color: 'gray', textAlign: 'center' },

    wholeContentModal: { position: 'absolute', zIndex: 10000, justifyContent: 'center', alignItems: 'center', top: 0, bottom: '15%', left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)" },

    wholeSizeModal:{ justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'white', borderRadius: 0, padding: 20, width: width - 50, height: responsiveWidth(100), borderRadius : 6 },

    animationContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, },

    closeModal: { position: 'absolute', right: '5%', top: '5%', zIndex: 100, height: responsiveWidth(10), width: responsiveWidth(6) },

    Xbtn: { color: 'gray', fontSize: responsiveFontSize(2.7), fontWeight: '600' },

    iconeModal: { width: responsiveWidth(50), height: responsiveWidth(50), marginBottom: 5 },

    titleModal:{ flexDirection: 'row', width: '100%' },

    labelTitleModal: { color: COLOR.GREY, width: '100%', marginBottom: 10, fontSize: responsiveFontSize(2.3), justifyContent: 'center', textAlign: 'center' },







    // FIM DO MODAL
    mainBtn: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        marginVertical:10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 15,
    },
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    txtInputContainer: {
        marginTop: 10,
        // marginBottom: 5,
        justifyContent: 'space-between',
        backgroundColor: COLOR.WHITE,
        borderColor: COLOR.GREY_WHITE,
        borderWidth: 0.3,
        borderRadius: 6,
        padding: 5
    },
    txtInputContent: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    contentFormDados: {
        flex: 1,
        padding: 15
    },
    labelError: {
        color: 'red',
        paddingLeft: 5,
        paddingTop: 5,
        fontSize: FONT.LABEL
    },
    flex1: {
        flex:1
    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageInputs }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(QueroParticipar);