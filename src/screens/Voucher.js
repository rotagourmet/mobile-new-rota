import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Image, Animated, Keyboard, Linking, Platform } from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon, CheckBox } from 'react-native-elements'
import { TextInputMask } from 'react-native-masked-text';
import Toast from 'react-native-easy-toast';
// REDUX IMPORTS
import { connect } from 'react-redux';
import { storageVoucherInfo } from '../actions';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import def_styles from '../assets/styles/theme.styles'
import Pageheader from '../components/Pageheader'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');

class Voucher extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            fadeEconomizado: new Animated.Value(0),
            loading: false,
            choosed: null,
            valorEconomizado: "0",
            validarVoucher: false
        }
    }

    fadeInEconomizado(){
		Animated.timing( this.state.fadeEconomizado, { toValue: 1, duration: 500 }).start();
	}

    fadeOutEconomizado(){
		Animated.timing( this.state.fadeEconomizado, { toValue: 0, duration: 500 }).start();
	}

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }
    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    verifyFields(){
        this.setState({ loading: true });
        Keyboard.dismiss();
        if(this.state.choosed && this.state.valorSemDesconto && this.state.valorComDesconto){
            let valorComDesconto = this.state.valorComDesconto.replace("R", '')
            valorComDesconto = valorComDesconto.replace("$", '')
            valorComDesconto = valorComDesconto.replace(" ", '')
            valorComDesconto = valorComDesconto.replace(".", '')
            valorComDesconto = valorComDesconto.replace(",", '.')
            
            let valorSemDesconto = this.state.valorSemDesconto.replace("R", '')
            valorSemDesconto = valorSemDesconto.replace("$", '')
            valorSemDesconto = valorSemDesconto.replace(" ", '')
            valorSemDesconto = valorSemDesconto.replace(".", '')
            valorSemDesconto = valorSemDesconto.replace(",", '.')
            let valorEconomizado = (Number(valorSemDesconto) - Number(valorComDesconto)).toFixed(2);
        
            if (valorSemDesconto >= valorSemDesconto) {
                this.setState({
                    valorEconomizado: (valorEconomizado).replace(".", ','),
                    next: true  
                });

                this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
                this.fadeInEconomizado();
                this.props.storageVoucherInfo({choosed: this.state.choosed, valorEconomizado, valorSemDesconto, valorComDesconto })
                setTimeout(() => {
                    this.setState({
                        loading: false
                    })
                    this.props.navigation.navigate("VoucherValidation")
                },1000);
            }else {
                this.setState({ loading: false, errorValorComDescontoMessage: "Valor com desconto não pode ser maior que o valor sem desconto" });
                this.setState({valorComDesconto: this.state.valorSemDesconto})
            }
        } else if (!this.state.choosed) {
            this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ loading: false });
            this.refs.toast.show("Selecione pelo menos uma das respostas acima", 5000);
        } else if (!this.state.valorSemDesconto){
            this.setState({ loading: false, errorValorSemDescontoMessage: "Valor da Conta sem desconto é um campo obrigatório" });
            this.refs.valorSemDesconto._inputElement.focus();
        } else if (!this.state.valorComDesconto){
            this.setState({ loading: false, errorValorComDescontoMessage: "Valor da Conta com desconto é um campo obrigatório" });
            this.refs.valorComDesconto._inputElement.focus()
        }
    }
    
    trataTel(ph){
        return `tel:${ph.replace(/\D/g, '')}`;
    }

    chamaWhatsApp(phone){
        let text = `Olá, meu nome é ${this.props.userData.name}. `
        console.log('phone', phone, text);
        phone = phone.replace(/\D/g, '');
        phone = `55${phone}`
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }

    render(){
        if (this.props.modeloNegocio === "Delivery" && !this.state.validarVoucher) {
            return(
                <View style={{flex: 1}}>
                    <Pageheader 
                        title={"DELIVERY"} 
                        navigation={this.props.navigation} 
                        statusBarColor={'transparent'} 
                    />
                    <ScrollView ref='homeScroll' scrollEnabled={true} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.flexMiddle}>
                            <Image source={require('../assets/restaurante/pedir.png')} style={{ marginTop: 10, height: responsiveWidth(42), width: responsiveWidth(42),}}/>
                            <View style={styles.contentTitles}>
                                <Text style={styles.specialNmber}>1</Text>
                                <View>
                                    <Text style={styles.titleDelivery}>Faça seu Pedido</Text>
                                    <Text style={styles.subTitleDelivery}>entre em contato com o restaurante</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                            {this.props.currentRestaurant.celular ?
                                <View style={{flex: 1}}>
                                    <TouchableOpacity style={[styles.mainBtn, {marginHorizontal: 5,}]} onPress={() => { this.chamaWhatsApp(this.props.currentRestaurant.celular) }}>
                                        <Text style={styles.mainBtnLabel}>WHATSAPP</Text>
                                    </TouchableOpacity>
                                </View>
                            : null}
                            {this.props.currentRestaurant.telefone ?
                                <View style={{ flex: 1}}>
                                    <TouchableOpacity style={[styles.mainBtn, {marginHorizontal: 5,}]} onPress={() => { Linking.openURL(this.trataTel(this.props.currentRestaurant.telefone)); }}>
                                        <Text style={styles.mainBtnLabel}>TELEFONAR</Text>
                                    </TouchableOpacity>
                                </View>
                            :null}
                            </View>
                            <Image source={require('../assets/restaurante/scooter_2.png')} style={{ marginTop: 40, height: responsiveWidth(35), width: responsiveWidth(35),}}/>
                            <View style={styles.contentTitles}>
                                <Text style={styles.specialNmber}>2</Text>
                                <View>
                                    <Text style={styles.titleDelivery}>Espere seu Pedido chegar</Text>
                                    <Text style={styles.subTitleDelivery}>ligue para o Restaurante caso atrase</Text>
                                </View>
                            </View>
                            <Image source={require('../assets/restaurante/qrcode.png')} style={{ marginTop: 40, height: responsiveWidth(35), width: responsiveWidth(35),}}/>
                            <View style={styles.contentTitles}>
                                <Text style={styles.specialNmber}>3</Text>
                                <View>
                                    <Text style={styles.titleDelivery}>Valide seu Voucher</Text>
                                    <Text style={styles.subTitleDelivery}>{"quando o pedido chegar, valide o Voucher\nno nosso app e depois pague seu pedido"}</Text>
                                </View>
                            </View>
                            <View style={[def_styles.p_t_20, {width: '100%',}]}>
                                <TouchableOpacity style={[styles.mainBtn, {marginHorizontal: 25,}]} onPress={() => { this.setState({validarVoucher: true})}}>
                                    <Text style={styles.mainBtnLabel}>UTILIZAR VOUCHER</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>

                    </ScrollView>
                </View>
            )
        } else {
            return(
                <View style={{flex: 1}}>
                    <ScrollView ref='homeScroll' scrollEnabled={true} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        <Pageheader 
                            title={"VALIDAÇÃO"} 
                            navigation={this.props.navigation} 
                            statusBarColor={'transparent'}
                            onPress={
                                this.props.modeloNegocio === "Delivery" ? 
                                (event) => this.setState({ validarVoucher: false}) 
                                : null 
                            } // Verificação inteligente para voltar de tela
                        />
                        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: null, })}>
                            <Text style={styles.title}>Já esteve nesse Estabelecimento?</Text>
                            <View style={def_styles.padding_10}>
                                <View style={[styles.txtInputContainer]}>
                                    <CheckBox
                                    textStyle={styles.textStyle}
                                    containerStyle={styles.contentCheckbox}
                                    title='Não'
                                    checkedIcon='dot-circle-o'
                                    uncheckedIcon='circle-o'
                                    checkedColor={COLOR.SECONDARY}
                                    checked={this.state.choosed === 'Não'}
                                    onPress={() => this.setState({choosed: 'Não'})}
                                    />
                                </View>
                                <View style={[styles.txtInputContainer]}>
                                    <CheckBox
                                    textStyle={styles.textStyle}
                                    containerStyle={styles.contentCheckbox}
                                    title='Sim, nos últimos de 30 dias'
                                    checkedIcon='dot-circle-o'
                                    uncheckedIcon='circle-o'
                                    checkedColor={COLOR.SECONDARY}
                                    checked={this.state.choosed === 'Sim, nos últimos de 30 dias'}
                                    onPress={() => this.setState({choosed: 'Sim, nos últimos de 30 dias'})}
                                    />
                                </View>
                                <View style={[styles.txtInputContainer]}>
                                    <CheckBox
                                    textStyle={styles.textStyle}
                                    containerStyle={styles.contentCheckbox}
                                    title='Sim, há mais de 30 dias'
                                    checkedIcon='dot-circle-o'
                                    uncheckedIcon='circle-o'
                                    checkedColor={COLOR.SECONDARY}
                                    checked={this.state.choosed === 'Sim, há mais de 30 dias'}
                                    onPress={() => this.setState({choosed: 'Sim, há mais de 30 dias'})}
                                    />
                                </View>
                            </View>
                            <View style={[def_styles.p_h_25]}>
                                <Text style={styles.txtOutside}>Valor da Conta (sem desconto)</Text>
                                <View style={styles.txtInputContainer2}>
                                    <TextInputMask 
                                        ref={'valorSemDesconto'}
                                        type={'money'}
                                        style={[styles.txtInputContent, { color: this.state.errorValorSemDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                        placeholder={"R$ 0,00"}
                                        value={this.state.valorSemDesconto}
                                        returnKeyType={'done'}
                                        onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 60, animated: true });}}
                                        onChangeText={(valorSemDesconto)=> {this.setState({ valorSemDesconto, errorValorSemDescontoMessage: null, next: false}); ; this.fadeOutEconomizado()}}
                                        onSubmitEditing={() => { this.refs.valorComDesconto._inputElement.focus()}}
                                        placeholderTextColor={this.state.errorValorSemDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                                    />
                                </View>
                                { this.state.errorValorSemDescontoMessage ?  <Text style={styles.labelError}>{this.state.errorValorSemDescontoMessage}</Text> :  null }
                                
                                <Text style={styles.txtOutside}>Valor final da Conta (com desconto)</Text>
                                <View style={styles.txtInputContainer2}>
                                    <TextInputMask 
                                        ref={'valorComDesconto'}
                                        type={'money'}
                                        style={[styles.txtInputContent, { color: this.state.errorValorComDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                        placeholder={"R$ 0,00"}
                                        value={this.state.valorComDesconto}
                                        returnKeyType={'done'}
                                        onChangeText={(valorComDesconto)=> {
                                            // if(this.state.valorSemDesconto && valorComDesconto > this.state.valorSemDesconto){
                                            //     this.setState({ valorComDesconto, errorValorComDescontoMessage: "Valor com desconto não pode ser maior que o valor sem desconto", next: false});
                                            // }else{
                                            // }
                                            this.setState({ valorComDesconto, errorValorComDescontoMessage: null, next: false});
                                            this.fadeOutEconomizado();
                                        }}
                                        onSubmitEditing={() => this.verifyFields()}
                                        placeholderTextColor={this.state.errorValorComDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                                    />
                                </View>
                                { this.state.errorValorComDescontoMessage ?  <Text style={styles.labelError}>{this.state.errorValorComDescontoMessage}</Text> :  null }
                            </View>
                        </KeyboardAvoidingView>
                        <Animated.View style={[def_styles.d_flex_complete_center, {opacity: this.state.fadeEconomizado}]}>
                            <Text style={styles.parabens}>Parabéns! Você economizou</Text>
                            <Text style={styles.valorEconomizado}>R$ {this.state.valorEconomizado}</Text>
                        </Animated.View>
                        <TouchableOpacity style={[styles.mainBtn, {marginHorizontal: 25,}]} onPress={() => {this.verifyFields()}}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>{this.state.next ? 'PRÓXIMO' : 'CALCULAR'}</Text>}
                        </TouchableOpacity>                    
                    </ScrollView>
                    <Toast ref="toast" />
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    contentTitles: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: 20
    },
    subTitleDelivery: {
        fontWeight: WEIGHT.THIN,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    titleDelivery: {
        fontSize: FONT.MEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY,
    },
    specialNmber: {
        fontSize: FONT.XXXLARGE,
        fontWeight: WEIGHT.FAT,
        color: COLOR.SECONDARY,
        paddingRight: 10
    },
    flexMiddle: {
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imgDelivery: {
        marginTop: 20,
        height: responsiveWidth(42),
        width: responsiveWidth(42),
    },
    contentContainer: {
        paddingBottom: 250,    
    },
    valorEconomizado:{
        paddingTop: 15,
        color: COLOR.SECONDARY,
        fontSize: FONT.XXLARGE,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    parabens:{
        paddingTop: 15,
        color: COLOR.GREY,
        fontSize: FONT.MEDIUM,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
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
    },    
    txtOutside:{
        marginTop: 10,
        fontSize: FONT.LABEL,
        color: COLOR.GREY,
    },
    txtInputContent: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: FONT.MEDIUM,
        color: COLOR.GREY,
    },
    labelError: {
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
        margin: 0
    },    
    txtInputContainer2: {
        marginTop: 5,
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
        height: '100%'
    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    modeloNegocio: store.InfoReducer.modeloNegocio,
    currentRestaurant: store.InfoReducer.currentRestaurant,
});


const mapDispatchToProps = dispatch => bindActionCreators({ storageVoucherInfo }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Voucher);