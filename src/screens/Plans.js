import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, ActivityIndicator, Keyboard} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import * as WebBrowser from 'expo-web-browser';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectedPlanStorage } from '../actions';
import { getApi } from '../environments/config'
import Pageheader from '../components/Pageheader'
import Theme from '../constants/Theme';
import def_styles from '../assets/styles/theme.styles'

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');

class Plans extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            id: 1,
            errorMessage: null,
            cupomSuccess: false,
            disabled: false
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.listPlans()
        }

    }

    async listPlans(){
        //Requisição de Listar planos
        let plans = await fetch(server.url + `plans/list/braspag`);
        plans = await plans.json();
        this.setState({ plans })
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    planPrice(item){
        item = item.split(' ');
        item = item[1];
        item = item.split(',');
        item = item[0];
        return item
    }

    planPriceCents(item){
        item = item.split(' ');
        item = item[1];
        item = item.split(',');
        item = item[1];
        return item
    }

    async validarCupom(item){
        let form = {
            idUsuario: this.props.userData._id,
            codigo: this.state.cupom
        }
        //Requisição de verificar cupom
        if (this.state.cupom) {
                
            let response = await fetch(server.url + `api/cupom/verify?token=${this.props.userToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
            response = await response.json();
            console.log('response', response);
            if (response.error) {
                this.setState({
                    errorMessage: response.message
                })
            }else{
                Keyboard.dismiss();
                let planSelected = this.state.plans.plans.filter((res) => res.plan_id === response.plano) 
                console.log('planSelected', planSelected[0]);
                this.setState({
                    cupomSuccess: response,
                    id: response.plano, 
                    plan: planSelected[0],
                    disabled: true
                })
            }
        }
    }

    async nextStep(){
        let plans = {
            plan: this.state.plan,
            cupom: this.state.cupomSuccess
        }
        this.props.selectedPlanStorage(plans)
        if (this.state.plan) {
            this.props.navigation.navigate("Dados");
        }
    }

    render(){
        return(
            <View style={styles.flex1}>
                <Pageheader title={"PLANOS"}  navigation={this.props.navigation}/>
                <ScrollView ref='homeScroll' style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <KeyboardAvoidingView
                        style={styles.container}
                        behavior={Platform.select({
                            ios: 'padding',
                            android: null,
                        })}
                    >   
                        {this.state.plans && this.state.plans.plans ?
                            this.state.plans.plans.map((item, index) => {
                            return (
                                <TouchableOpacity disabled={this.state.disabled} key={index} style={[styles.contentBtn, { borderColor: item.plan_id == this.state.id ? COLOR.SECONDARY : 'transparent',  }]} onPress={() => { this.setState( { id: item.plan_id, plan: item } ); Keyboard.dismiss() }}>
                                    <View style={[styles.flexRow, styles.contentCenter, {flex: 3}]}>
                                        <View style={styles.iconContent}>
                                            {item.plan_id == this.state.id ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
                                        </View>
                                        <View style={def_styles.p_l_10}>
                                            <Text style={styles.txtTitle}>{item.title}</Text>
                                            <Text style={styles.txtDescri}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.flexRow, styles.contentEnd, {flex: 1.5}]}>
                                        <Text style={styles.txtcifrao}>R$<Text style={styles.txtNumero}> {(item.price/100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></Text>
                                    </View>
                                </TouchableOpacity>
                            )
                            }) : 
                            <View style={styles.contentLoader}> 
                                <ActivityIndicator color={COLOR.GREY} />  
                            </View>
                        }
                        <View style={styles.cupomContent}>
                            <TextInput 
                                style={styles.cupomInput}
                                placeholder={"Caso tenha um cupom, digite aqui"}
                                value={this.state.cupom}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 500, animated: true });}}
                                // onEndEditing={() => {this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });}}
                                autoCapitalize={'characters'}
                                onChangeText={(cupom)=> this.setState({ cupom, errorMessage: null, cupomSuccess: null})}
                                onSubmitEditing={() => {this.validarCupom(this.state.cupom); }}
                                placeholderTextColor={this.state.errorCupom ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            />
                            {this.state.cupomSuccess ? 
                                <View style={styles.cupomSuccessCorrect}>
                                    <Image source={require('../assets/perfil/correct.png')} style={{height: responsiveHeight(2.5), width: responsiveHeight(2.5)}}/>
                                </View>
                                :
                                <TouchableOpacity style={styles.cupomBtn} onPress={() => {this.validarCupom(this.state.cupom); }}>
                                    <Text style={styles.cupomLabelBtn}>VALIDAR</Text>
                                </TouchableOpacity>
                            }
                        </View>
                        {   this.state.errorMessage ? 
                                <Text style={styles.labelError}>{this.state.errorMessage}</Text> : 
                            this.state.cupomSuccess ?
                                <Text style={styles.labelCorrect}>{`Com esse cupom você ganha ${this.state.cupomSuccess.voucherTime} dias grátis no plano ${this.state.plan.title}, prossiga para os próximos passos :)`}</Text>
                            : null
                         }
                        <TouchableOpacity style={styles.mainBtn} onPress={() => this.nextStep()}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>ENTRAR PARA O CLUBE</Text>}
                        </TouchableOpacity>

                    </KeyboardAvoidingView>
                    <Text style={styles.textAcordo}>Ao clicar em “Entrar para o Clube” você concorda com os Temos de uso, e terá acesso as inúmeras vantagens do Rota Gourmet. Caso tenha assinado com cartão de crédito você concorda com a cobrança mensal automática.</Text>
                    <View style={[styles.flexRow, {justifyContent: 'center',}]} >
                        <TouchableOpacity style={styles.containerTermos} onPress={() => {WebBrowser.openBrowserAsync('https://file-upload-rota.s3.amazonaws.com/arquivos/Termos+de+Uso.pdf')}}>
                            <Text style={styles.termos}>Termos de uso <Text style={{color:COLOR.GREY}}>e</Text> Política de privacidade</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cupomSuccessCorrect: {
        justifyContent: 'center',
        alignItems: 'center', 
        paddingRight: 10,
    },
    contentLoader: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingVertical: 40
    },
    labelCorrect: {
        color: 'green'
    },
    labelError: {
        color: 'red'
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
    textAcordo: {
        fontSize: FONT.LABEL,
        textAlign: 'center',
        color: COLOR.GREY,


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
    cupomLabelBtn: {
        textAlign: 'center',
        color: COLOR.WHITE,
        fontWeight: WEIGHT.FAT
    },
    cupomContent: {
        marginVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLOR.WHITE,
        borderRadius: 6,
        padding: 5
    },
    cupomBtn: {
        borderRadius: 6,
        justifyContent: 'center',
        flex: 2,
        backgroundColor: COLOR.PRIMARY,
        
    },
    cupomInput: {
        flex: 4,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    txtNumero: {
        fontSize: FONT.XLARGE,
        color: COLOR.SECONDARY,
        fontWeight: WEIGHT.FAT,
    },
    txtcifrao: {
        fontSize: FONT.XSMALL,
        color: COLOR.SECONDARY,
        fontWeight: WEIGHT.FAT,
    },
    txtDescri:{
        fontSize: FONT.LABEL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY
    },
    iconContent: {
        borderWidth: 1,
        borderColor: COLOR.SECONDARY,
        height: responsiveHeight(2.5),
        width: responsiveHeight(2.5),
        borderRadius: 10,
    },
    txtTitle: {
        fontSize: FONT.SMEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY
    },
    contentEnd: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',

    },
    contentCenter: {
        alignItems: 'center',

    },
    correctImg: {
        height: responsiveHeight(2.5),
        width: responsiveHeight(2.5),
    },
    flex1: {
        flex: 1,
    },
    flexRow: {
        flexDirection: 'row'
    },
    contentBtn: {
        borderWidth: 2,
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 15,
        backgroundColor: COLOR.WHITE,
        borderRadius: 6,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,

    },
    container: {
        
    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

const mapDispatchToProps = dispatch => bindActionCreators({ selectedPlanStorage }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Plans);