import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { Icon, CheckBox } from 'react-native-elements'
import Toast from 'react-native-easy-toast';
import { connect } from 'react-redux';
import { getApi } from '../environments/config'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');
const server = getApi('api');

class EditarUnidadeFormComponent extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({
                infos: this.props.infos,
                instagram: this.props.infos.instagram ? this.props.infos.instagram : null,
                website: this.props.infos.website ? this.props.infos.website : null,
                regras: this.props.infos.regras ? this.props.infos.regras : null,
                playground: this.props.infos.ambiente && this.props.infos.ambiente.playground ? this.props.infos.ambiente.playground : false,
                climatizado: this.props.infos.ambiente && this.props.infos.ambiente.climatizado ? this.props.infos.ambiente.climatizado : false,
                estacionamento: this.props.infos.ambiente && this.props.infos.ambiente.estacionamento ? this.props.infos.ambiente.estacionamento : false,
                wifi: this.props.infos.ambiente && this.props.infos.ambiente.wifi ? this.props.infos.ambiente.wifi : false,
                atendimentoBom: this.props.infos.ambiente && this.props.infos.ambiente.atendimentoBom ? this.props.infos.ambiente.atendimentoBom : false,
                fraldario: this.props.infos.ambiente && this.props.infos.ambiente.fraldario ? this.props.infos.ambiente.fraldario : false,
                petfriend: this.props.infos.ambiente && this.props.infos.ambiente.petfriend ? this.props.infos.ambiente.petfriend : false,
                musica: this.props.infos.ambiente && this.props.infos.ambiente.musica ? this.props.infos.ambiente.musica : false,
                seguranca: this.props.infos.ambiente && this.props.infos.ambiente.seguranca ? this.props.infos.ambiente.seguranca : false,
            })
        }

    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async validarCampos(){
        let form = {
            _id: this.state.infos._id,
            instagram: this.state.instagram,
            website: this.state.website,
            regras: this.state.regras,
            ambiente:{
                playground: this.state.playground,
                climatizado: this.state.climatizado,
                estacionamento: this.state.estacionamento,
                wifi: this.state.wifi,
                atendimentoBom: this.state.atendimentoBom,
                fraldario: this.state.fraldario,
                petfriend: this.state.petfriend,
                musica: this.state.musica,
                seguranca: this.state.seguranca,
            },
        };
        //Requisição de Atualizar unidade de restaurante
        let response = await fetch(server.url + `api/units/editOne?token=${this.props.userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        });
        response = await response.json()
        if (response.error) {
            this.refs.toast.show(response.message, 5000);
        }else{
            this.props.navigation.goBack();
        }

    }

    formCase = () => {
        return(
            <View style={styles.contentFormDados}>
                <View style={[styles.txtInputContainer]}>
                    <TextInput 
                        ref={'instagram'}
                        style={[styles.txtInputContent, { color: this.state.errorInstagramMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Instagram (username - sem @)*"}
                        value={this.state.instagram}
                        autoCapitalize={'words'}
                        onChangeText={(instagram)=> this.setState({ instagram, errorInstagramMessage: null})}
                        onSubmitEditing={() => { this.refs.website.focus()}}
                        placeholderTextColor={this.state.errorInstagramMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorInstagramMessage ?  <Text style={styles.labelError}>{this.state.errorInstagramMessage}</Text> :  null }
                <View style={styles.txtInputContainer}>
                    <TextInput 
                        ref={'website'}
                        style={[styles.txtInputContent, { color: this.state.errorWebsiteMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Website - (sem https://www)"}
                        value={this.state.website}
                        autoCapitalize={'none'}
                        onChangeText={(website)=> this.setState({ website, errorWebsiteMessage: null})}
                        onSubmitEditing={() => { this.refs.regras.focus()}}
                        placeholderTextColor={this.state.errorWebsiteMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorWebsiteMessage ?  <Text style={styles.labelError}>{this.state.errorWebsiteMessage}</Text> :  null }
                <View style={styles.txtInputContainer}>
                    <TextInput 
                        ref={'regras'}
                        style={[styles.txtInputContent, { height: 80, color: this.state.errorRegrasMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
                        placeholder={"Regras*"}
                        multiline={true}
                        value={this.state.regras}
                        autoCapitalize={'words'}
                        onChangeText={(regras)=> this.setState({ regras, errorRegrasMessage: null})}
                        placeholderTextColor={this.state.errorRegrasMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
                    />
                </View>
                { this.state.errorRegrasMessage ?  <Text style={styles.labelError}>{this.state.errorRegrasMessage}</Text> :  null }
                <Text style={{fontSize: 11, color: COLOR.GREY, paddingTop: 5}}>* Digite as regras de utilização e só use ponto final quando for para a próxima regra</Text>
                <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20]}>Sobre o ambiente</Text>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Ambiente Climatizado'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.climatizado}
                    onPress={() => this.setState({climatizado: !this.state.climatizado})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Playground'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.playground}
                    onPress={() => this.setState({playground: !this.state.playground})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Estacionamento'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.estacionamento}
                    onPress={() => this.setState({estacionamento: !this.state.estacionamento})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Wi-fi'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.wifi}
                    onPress={() => this.setState({wifi: !this.state.wifi})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Atendimento Personalizado'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.atendimentoBom}
                    onPress={() => this.setState({atendimentoBom: !this.state.atendimentoBom})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Fraldário'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.fraldario}
                    onPress={() => this.setState({fraldario: !this.state.fraldario})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Pet Friendly'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.petfriend}
                    onPress={() => this.setState({petfriend: !this.state.petfriend})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Música ambiente'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.musica}
                    onPress={() => this.setState({musica: !this.state.musica})}
                    />
                </View>
                <View style={[styles.txtInputContainer, {paddingHorizontal: 0}]}>
                    <CheckBox
                    textStyle={styles.textStyle}
                    containerStyle={styles.contentCheckbox}
                    title='Segurança 24hrs'
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checkedColor={COLOR.SECONDARY}
                    checked={this.state.seguranca}
                    onPress={() => this.setState({seguranca: !this.state.seguranca})}
                    />
                </View>

                <TouchableOpacity style={[styles.mainBtn, def_styles.m_t_30]} onPress={() => this.validarCampos()}>
                    {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>ENVIAR</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    render(){
        return(
            <View style={{flex: 1}}>
                <ScrollView ref={"homeScroll"} style={[styles.bgColorWhite]} contentContainerStyle={[ def_styles.p_b_150]}>
                    <KeyboardAvoidingView style={styles.container}
                        behavior={Platform.select({
                            ios: 'padding',
                            android: null,
                        })}
                    >
                        {this.formCase()}
                    </KeyboardAvoidingView>
                </ScrollView>
                <Toast ref="toast" />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    label: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
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
    labelError: {
        color: 'red',
        paddingLeft: 5,
        paddingTop: 5,
        fontSize: FONT.LABEL
    },
    mainBtn: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        marginVertical:10,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    txtInputContent: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
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
    contentFormDados: {
        flex: 1,
        padding: 15
    },
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

export default connect(mapStateToProps)(EditarUnidadeFormComponent);