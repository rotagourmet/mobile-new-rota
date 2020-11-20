import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
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

class CardapioComponent extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            formSize: 1, 
            item: [{
                title:{
                    placeholder: "Titulo",
                    stateName: "title",
                    errorMessage: "errorTitleMessage",
                },
                description: {
                    placeholder: "Description",
                    stateName: "description",
                    errorMessage: "errorDescriptionMessage",
                },
                price: {
                    placeholder: "Preço",
                    stateName: "price",
                    errorMessage: "errorPriceMessage",
                }
            },],
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            if (this.props.infos && this.props.infos.cardapio && this.props.infos.cardapio.length > 0) {
                let arrayItems = []
                this.setState({
                    cardapio: this.props.infos && this.props.infos.cardapio ? this.props.infos.cardapio : null
                })
                for (let index = 0; index < this.props.infos.cardapio.length; index++) {
                    let element = this.props.infos.cardapio;
                    arrayItems.push({
                        title:{
                            placeholder: "Titulo",
                            stateName: "title",
                            errorMessage: "errorTitleMessage",
                        },
                        description: {
                            placeholder: "Description",
                            stateName: "description",
                            errorMessage: "errorDescriptionMessage",
                        },
                        price: {
                            placeholder: "Preço",
                            stateName: "price",
                            errorMessage: "errorPriceMessage",
                        }
                    })
                    this.setState({
                        ["title_" + index]: element[index].title,
                        ["description_" + index]: element[index].description,
                        ["price_" + index]: element[index].price,
                    })
                }
                this.setState({
                    item: arrayItems,
                    formSize: this.props.infos.cardapio.length
                })
                
            }else{
            }
        }
    }

    aumentarForm(){
        let form = this.state.item;
        form.push({
                title:{
                    placeholder: "Titulo",
                    stateName: "title",
                    errorMessage: "errorTitleMessage",
                },
                description: {
                    placeholder: "Description",
                    stateName: "description",
                    errorMessage: "errorDescriptionMessage",
                },
                price: {
                    placeholder: "Preço",
                    stateName: "price",
                    errorMessage: "errorPriceMessage",
                }
            })
        this.setState({
            item: form,
            formSize: form.length
        })
    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    async validarCampos(){
        this.setState({
            loading: true
        })
        let formToSend = []
        for (let index = 0; index < this.state.formSize; index++) {
            if (this.state["title_"+index]) {
                let element = {
                    title: this.state["title_"+index],
                    description: this.state["description_" + index],
                    price: this.state["price_" + index],
                };
                formToSend.push(element);
            }
        }
        if (formToSend && formToSend.length > 0) {
            
            let form = {
                _id: this.props.infos._id,
                cardapio: formToSend
            }

            //Requisição de adicionar Cardapio
            let response = await fetch(server.url + `api/units/addCardapio?token=${this.props.userToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
            response = await response.json()
            if (response.error) {
                this.refs.toast.show(response.message, 5000);
                this.setState({
                    loading: false
                })
            }else{
                this.props.navigation.goBack();
                this.setState({
                    loading: false
                })
            }
        }

    }

    formCase = () => {
        return(
            <View style={styles.contentFormDados}>
                {this.state.item.map((item, index) => {return(
                    <View key={index}>
                        <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20]}>Item {index+1}</Text>
                        <View style={[styles.txtInputContainer]}>
                            <TextInput 
                                ref={item.title.stateName + "_" + index}
                                style={[styles.txtInputContent, { color: COLOR.GREY}]}
                                placeholder={"Titulo do Item "  + (index+1)}
                                value={this.state[item.title.stateName + "_" + index]}
                                onChangeText={(text)=> this.setState({ [item.title.stateName + "_" + index]: text})}
                                placeholderTextColor={COLOR.GREY}
                            />
                        </View>
                        <View style={styles.txtInputContainer}>
                            <TextInput 
                                ref={item.description.stateName + "_" + index}
                                style={[styles.txtInputContent, { color: COLOR.GREY}]}
                                placeholder={"Descrição do Item "  + (index+1)}
                                value={this.state[item.description.stateName + "_" + index]}
                                autoCapitalize={'none'}
                                onChangeText={(text)=> this.setState({ [item.description.stateName + "_" + index]: text})}
                                placeholderTextColor={COLOR.GREY}
                            />
                        </View>
                        <View style={styles.txtInputContainer}>
                            <TextInputMask 
                                ref={item.price.stateName + "_" + index}
                                style={[styles.txtInputContent, { color: COLOR.GREY}]}
                                placeholder={"Preço do Item "  + (index+1)}
                                value={this.state[item.price.stateName + "_" + index]}
                                autoCapitalize={'none'}
                                onChangeText={(text)=> this.setState({ [item.price.stateName + "_" + index]: text})}
                                placeholderTextColor={COLOR.GREY}
                                type={'money'}
                            />
                        </View>
                    </View>
            
                )})}

                <TouchableOpacity style={[styles.mainBtn, def_styles.m_t_30]} onPress={() => this.validarCampos()}>
                    {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>SALVAR</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    render(){
        return(
            <View style={styles.flex1}>
                <ScrollView ref={"homeScroll"} style={[styles.bgColorWhite]} contentContainerStyle={[ def_styles.p_b_150]}>
                    <KeyboardAvoidingView style={styles.container}
                        behavior={Platform.select({
                            ios: 'padding',
                            android: null,
                        })}
                    >
                    {this.formCase()}
                    </KeyboardAvoidingView>
                <View style={styles.btnAddContainer}>
                    <Text style={{color: COLOR.PRIMARY, paddingRight: 10}}>Adicionar Item</Text>
                    <TouchableOpacity style={styles.btnContent} onPress={() => this.aumentarForm()}>
                        <Image source={require('../assets/restaurante/plus.png')} style={styles.plus}/>
                    </TouchableOpacity>
                </View>
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
    plus: {
        height: 35,
        width: 35,
    },
    btnContent: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 40,
        borderColor: COLOR.WHITE,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        width: 45,
    },
    btnAddContainer: {
        position: 'absolute',
        top: '3%',
        right: '3%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flex1: {
        flex: 1,
    },
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

export default connect(mapStateToProps)(CardapioComponent);