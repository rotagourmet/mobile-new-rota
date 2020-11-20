// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, ActivityIndicator, AsyncStorage, TouchableOpacity, Keyboard } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Toast from 'react-native-easy-toast';
// REDUX IMPORTS
import { connect } from 'react-redux';
import { storageUserData, storageInputs } from '../actions';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import PaymentValidations from '../utils/PaymentValidations';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import Pageheader from '../components/Pageheader'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const server = getApi('api');

const forms = [
    {
        label: "Dados",
    },
    {
        label: false,
        ref:"name",
        placeholder: "Nome Completo",
        stateName: "name",
        errorMessage: "errorNameMessage",
        nextRefForm: "Cpf",
        _inputElement: true,
        scrollTo: 0,
        keyboardType: "default",
        maskFormat: false
    },
    {
        label: false,
        ref:"Cpf",
        placeholder: "CPF*",
        stateName: "cpf",
        errorMessage: "errorCpfMessage",
        nextRefForm: "nascimento",
        _inputElement: true,
        scrollTo: 100,
        keyboardType: "number-pad",
        maskFormat: "YYY.YYY.YYY-YY"
    },
    {   
        label: false,
        ref:"nascimento",
        placeholder: "Data de nascimento*",
        stateName: "nascimento",
        errorMessage: "errorNascimentoMessage",
        nextRefForm: "telefone",
        _inputElement: true,
        scrollTo: 140,
        keyboardType: "number-pad",
        maskFormat: "YY/YY/YYYY"
    },
    {
        label: false,
        ref:"telefone",
        placeholder: "Celular*",
        stateName: "celular",
        errorMessage: "errorCelularMessage",
        nextRefForm: "email",
        _inputElement: true,
        scrollTo: 180,
        keyboardType: "number-pad",
        maskFormat: "(YY) YYYYY-YYYY"
    },
    {
        label: false,
        ref:"email",
        placeholder: "E-mail*",
        stateName: "email",
        errorMessage: "errorEmailMessage",
        nextRefForm: "zipcode",
        _inputElement: true,
        scrollTo: 220,
        keyboardType: "email-address",
        maskFormat: false
    },
    {
        label: "Endereço",
    },
    {
        label: false,
        ref:"zipcode",
        placeholder: "CEP*",
        stateName: "zipcode",
        errorMessage: "errorCepMessage",
        nextRefForm: "uf",
        _inputElement: false,
        scrollTo: 310,
        keyboardType: "number-pad",
        maskFormat: "YYYYY-YYY",
        zipcode: true
    },
    {   
        dual: true,
        
        label: false,
        ref1:"uf",
        flex1: 1,
        placeholder1: "UF*",
        stateName1: "uf",
        errorMessage: "errorUfMessage",
        nextRefForm1: "cidade",
        _inputElement1: false,
        scrollTo1: 325,
        keyboardType1: "default",
        autoCapitalize1: 'characters',
        maskFormat1: false,
        
        
        label: false,
        ref2:"cidade",
        flex2: 3,
        placeholder2: "Cidade*",
        stateName2: "city",
        errorMessage: "errorCityMessage",
        nextRefForm2: "address",
        _inputElement1: false,
        scrollTo2: 325,
        keyboardType2: "default",
        autoCapitalize2: 'words',
        maskFormat1: false
    },
    {
        label: false,
        ref:"address",
        placeholder: "Endereço*",
        stateName: "street",
        errorMessage: "errorStreetMessage",
        nextRefForm: "district",
        _inputElement: false,
        scrollTo: 380,
        keyboardType: "default",
        maskFormat: false
    },
    {   
        dual: true,
        
        label: false,
        flex1: 3,
        ref1:"district",
        errorMessage1: "errorBairroMessage",
        placeholder1: "Bairro*",
        stateName1: "district",
        nextRefForm1: "number",
        _inputElement1: false,
        scrollTo1: 410,
        keyboardType1: "default",
        autoCapitalize1: 'words',
        maskFormat1: false,
        
        
        label: false,
        flex2: 1,
        ref2:"number",
        errorMessage2: "errorNumeroMessage",
        placeholder2: "Número*",
        stateName2: "number",
        nextRefForm2: "complement",
        _inputElement1: false,
        scrollTo2: 410,
        keyboardType2: "number-pad",
        autoCapitalize2: 'words',
        maskFormat1: false
    },
    {
        label: false,
        ref:"complement",
        errorMessage: "errorComplementoMessage",
        placeholder: "Complemento",
        stateName: "complement",
        nextRefForm: "complement",
        _inputElement: false,
        scrollTo: 450,
        keyboardType: "default",
        maskFormat: false
    },
]

class EditPerfil extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }
    
    componentWillUnmount(){
        this._isMounted = false;

    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            let user = this.props.userData;
            this.setState({
                name: user && user.name ? user.name : '',
                celular: user && user.phone ? this.phoneMask(user.phone) : '',
                cpf: user && user.cpf ? this.cpfMask(user.cpf) : '',
                nascimento: user && user.nascimento ? user.nascimento : user.dt_nasc ? user.dt_nasc : '',
                email: user && user.email ? user.email : '',
                zipcode: user && user.address && user.address.zipcode ? this.cepMask(user.address.zipcode) : '',
                uf: user && user.address && user.address.uf ? user.address.uf : '',
                street: user && user.address && user.address.street ? user.address.street : '',
                number: user && user.address && user.address.number ? `${user.address.number}` : '',
                city: user && user.address && user.address.city ? user.address.city : '',
                district: user && user.address && user.address.district ? user.address.district : '',
                complement: user && user.address && user.address.complement ? user.address.complement : '',
            })
        }

    }

    cepMask(cep){
        cep = cep[0] + cep[1] + cep[2] + cep[3] + cep[4] + "-" + cep[5] + cep[6] + cep[7]
        return cep
    }

    cpfMask(cpf){
        cpf = cpf[0] + cpf[1] + cpf[2] + "." + cpf[3] + cpf[4] + cpf[5] + "." + cpf[6] + cpf[7] + cpf[8] + "-" + cpf[9] + cpf[10]
        return cpf
    }

    phoneMask(ph){
        ph = "(" + ph[0] + ph[1] + ") " + ph[2] + ph[3] + ph[4] + ph[5] + ph[6] + "-" + ph[7] + ph[8] + ph[9] + ph[10]
        return ph
    }

    verifyFields(){
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
            complement: this.state.complement
        }
        console.log('form', form);
        let response = PaymentValidations.firstStep(form);
        if (response.error) {
            Keyboard.dismiss()
            this.refs.toast.show(response.message, 5000);
            this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true })
            this.setState({
                ["error" + response.campo + "Message"]: response.message
            })
        } else {
            let responseSecondStep = PaymentValidations.secondStep(form);
            if (responseSecondStep.error) {
                Keyboard.dismiss()
                this.refs.homeScroll.scrollTo({ x: 0, y: 330, animated: true })
                this.refs.toast.show(responseSecondStep.message, 5000);
                this.setState({
                    ["error" + responseSecondStep.campo + "Message"]: responseSecondStep.message
                })
            }else{
                this.props.storageInputs(responseSecondStep.form);
                this.refs.homeScroll.scrollTo({ x: 0, y: 0, animated: true });
                this.save(responseSecondStep.form)
            }
        }        
    }

    async save(form){
        console.log('form', form);
        //Requisição de Salvando dados do usuário no banco
        let response = await fetch(server.url + `api/user/update/${this.props.userData._id}?token=`+this.props.userToken, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        });
        response = await response.json()
        if(response.error){
            this.setState({
                errorModal: true,
                message: "Não foi possível realizar a atualização. Tente novamente."
            })
        }else{
            this.setState({
                successModal: true,
                message: response.message
            })
            this.newUserData(form);
        }
    }

    newUserData(form){
        let user = this.props.userData
        let newUser = {
            _id: user._id,
            name: form.name,
            cpf: form.cpf.replace(/\D/g, ''),
            email: form.email,
            status: user.status,
            estado: user.estado,
            voucher: user.voucher,
            rotaCode: user.rotaCode,
            dt_nasc: form.nascimento,
            phone: form.celular.replace(/\D/g, ''),
            address: {
                zipcode: form.zipcode.replace(/\D/g, ''),
                uf: form.uf,
                city: form.city,
                district: form.district,
                street: form.street,
                number: form.number.replace(/\D/g, ''),
                complement: form.complement
            }               

        };              

        this.props.storageUserData(newUser)
        AsyncStorage.setItem("user", JSON.stringify(newUser));
        this.props.navigation.goBack();
        Events.publish("UpdateName");
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
 
    dados(){
        return forms.map((item, index) => (
            <View key={index}>
                {item.label ? 
                <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20]}>{item.label}</Text> : 
                 item.dual ?
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={[styles.txtInputContainer, {flex: item.flex1}]}>
                            <TextInput
                                ref={item.ref1}
                                style={[styles.txtInputContent, { color: this.state[item.errorMessage1] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={item.placeholder1}
                                value={this.state[item.stateName1]}
                                returnKeyType={'done'}
                                autoCapitalize={item.autoCapitalize1}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: item.scrollTo1, animated: true });}}
                                onChangeText={(text)=> { this.setState({ [item.stateName1]: text, [item.errorMessage1]: null}) }}
                                onSubmitEditing={() => {this.refs[item.ref2].focus() }}
                                placeholderTextColor={this.state[item.errorMessage1] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            />
                        </View>
                        <View style={[styles.txtInputContainer, {flex: item.flex2, marginLeft: 10}]}>
                            <TextInput
                                ref={item.ref2}
                                style={[styles.txtInputContent, { color: this.state[item.errorMessage2] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={item.placeholder2}
                                value={this.state[item.stateName2]}
                                returnKeyType={'done'}
                                autoCapitalize={item.autoCapitalize2}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: item.scrollTo2, animated: true });}}
                                onChangeText={(text)=> { this.setState({ [item.stateName2]: text, [item.errorMessage2]: null}) }}
                                onSubmitEditing={() => {this.refs[item.nextRefForm2].focus() }}
                                placeholderTextColor={this.state[item.errorMessage2] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            />
                        </View>
                    </View>
                    { this.state[item.errorMessage1] ?  <Text style={styles.labelError}>{this.state[item.errorMessage1]}</Text> : this.state[item.errorMessage2] ?  <Text style={styles.labelError}>{this.state[item.errorMessage2]}</Text> : null  }
                </View>
                :
                <View>
                    <View style={styles.txtInputContainer}>
                       {item.maskFormat ? 
                            <TextInputMask
                                ref={item.ref}
                                style={[styles.txtInputContent, { color: this.state[item.errorMessage] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={item.placeholder}
                                value={this.state[item.stateName]}
                                returnKeyType={'done'}
                                keyboardType={item.keyboardType}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: item.scrollTo, animated: true });}}
                                onChangeText={(text)=> { 
                                    this.setState({ [item.stateName]: text, [item.errorMessage]: null})
                                    if(item.zipcode && text && text.length == 9){
                                        this.loadCep(text);
                                    }
                                }}
                                onSubmitEditing={() => { item._inputElement ? this.refs[item.nextRefForm]._inputElement.focus() : this.refs[item.nextRefForm].focus() }}
                                placeholderTextColor={this.state[item.errorMessage] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                                type={'datetime'} options={{ format: item.maskFormat}}
                            /> :
                            <TextInput
                                ref={item.ref}
                                style={[styles.txtInputContent, { color: this.state[item.errorMessage] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                                placeholder={item.placeholder}
                                value={this.state[item.stateName]}
                                autoCapitalize={'words'}
                                returnKeyType={'done'}
                                keyboardType={item.keyboardType}
                                onFocus={() => {this.refs.homeScroll.scrollTo({ x: 0, y: item.scrollTo, animated: true });}}
                                onChangeText={(text)=> this.setState({ [item.stateName]: text, [item.errorMessage]: null})}
                                onSubmitEditing={() => {item._inputElement ? this.refs[item.nextRefForm]._inputElement.focus() : this.refs[item.nextRefForm].focus()}}
                                placeholderTextColor={this.state[item.errorMessage] ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                            />
                        }
                    </View>
                    { this.state[item.errorMessage] ?  <Text style={styles.labelError}>{this.state[item.errorMessage]}</Text> :  null }
                </View>}
            </View>
        ));
    }

    render(){
        return(
            <View style={styles.flex1}>
                <ScrollView ref='homeScroll' scrollEnabled={true} style={[styles.flex1, styles.bgWhiteGrey]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <Pageheader title={"EDITAR PERFIL"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                    <KeyboardAvoidingView style={def_styles.p_h_15} behavior={Platform.select({ ios: 'padding', android: null, })}>
                        {this.dados()}
                        <TouchableOpacity style={styles.mainBtn} onPress={() => {this.verifyFields()}}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>SALVAR</Text>}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
                <Toast ref="toast" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
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
    labelError: {
        color: 'red',
        paddingLeft: 5,
        fontSize: FONT.LABEL
    },
    txtInputContent: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
    },
    txtInputContainer: {
        marginTop: 10,
        marginBottom: 2,
        justifyContent: 'space-between',
        backgroundColor: COLOR.WHITE,
        borderColor: COLOR.GREY_WHITE,
        borderWidth: 0.3,
        borderRadius: 6,
        padding: 3
    },
    label: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
    },
    flex1: {
        flex: 1
    },
    bgWhiteGrey:{
        backgroundColor: COLOR.BACKGROUND,
    },
    contentContainer: {
        paddingBottom: 130,
        
    },
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageUserData, storageInputs }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EditPerfil);