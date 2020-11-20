// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux';
import Toast from 'react-native-easy-toast';
// LOCAL IMPORTS
import Pageheader from '../components/Pageheader';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');
const server = getApi('api');
let aController = new AbortController();
let signal = aController.signal;

class Restaurantes extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            arrowSize: 15,
            city: 'Uberlândia',
            listRestaurantes: null
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        aController.abort();
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.listUnidades();
        }
    }

    async listUnidades(){
        //Requisição de listar todas unidades ativas
        let arrayUberlandia = []
        let arrayUberaba = []
        let response = await fetch(server.url + `api/restaurants/list?token=${this.props.userToken}`);
        response = await response.json();
        if (!response.error) {
            
            await Promise.all(response.restaurants.map( (item, index) => {
                if (item.cidade.municipio == 'Uberlândia') {
                    arrayUberlandia.push(item)
                }else{
                    arrayUberaba.push(item)
                }
            }))
            this.setState({
                listRestaurantes: this.state.city == 'Uberlândia' ? arrayUberlandia : arrayUberaba,
                arrayUberlandia,
                arrayUberaba
            })
        }else{
            this.setState({error: true})
        }
    }

    render(){
        if (this.state.listRestaurantes) {
            
        return(
            <View style={[styles.flex1, {backgroundColor: '#F8F8FA'}]}>
                <Pageheader title={"RESTAURANTES"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <ScrollView ref={"homeScroll"} style={[styles.bgColorWhite, def_styles.p_h_15]} contentContainerStyle={[ def_styles.p_b_150]}>
                <View style={{flexDirection: 'row', }}>

                    <TouchableOpacity onPress={() => this.setState({city: 'Uberlândia', listRestaurantes: this.state.arrayUberlandia})}
                    style={[styles.topContainerAccordion, def_styles.m_t_15, def_styles.m_r_10, {flex: 1, borderColor: this.state.city == 'Uberlândia' ? COLOR.SECONDARY : 'transparent', borderWidth: 2}]}>
                        <Text style={styles.itemClickableLabel}>Uberlândia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({city: 'Uberaba', listRestaurantes: this.state.arrayUberaba})}
                    style={[styles.topContainerAccordion, def_styles.m_t_15, def_styles.m_l_10,  {flex: 1, borderColor: this.state.city == 'Uberaba' ? COLOR.SECONDARY : 'transparent', borderWidth: 2}]}>
                        <Text style={[styles.itemClickableLabel]}>Uberaba</Text>
                    </TouchableOpacity>
                </View>
                {this.state.listRestaurantes.map((item, index) => {return(
                    <TouchableOpacity key={index} style={[styles.topContainerAccordion, def_styles.m_t_15, {}]} 
                    onPress={() => { item && item.unidades && item.unidades._id ? this.props.navigation.navigate("EditarUnidade", {unidade: item}) :this.refs.toast.show("Este restaurante não possui unidades cadastradas ainda", 5000); }}>
                        <View style={{flex: 10, alignItems: 'center', flexDirection: 'row'}}>
                            <View style={styles.restauranteBoxImage}>
                                <Image source={{uri: item.logo}} style={styles.restauranteImage}/>
                            </View>
                            <Text style={styles.itemClickableLabel}>{item.nomeRestaurante}</Text>
                        </View>

                        <View style={{flex: 1, alignItems: 'flex-end',}}>
                            <Icon name={this.state.activeSections && index == this.state.activeSections[0] ? 'chevron-down' : 'chevron-right'} type='font-awesome' color={COLOR.SECONDARY} style={{}} size={this.state.arrowSize} />
                        </View>
                    </TouchableOpacity>
                )})}
                </ScrollView>
                <Toast ref="toast" />
            </View>
        )
        }else{
            return (
                <View style={[styles.flex1, {backgroundColor: '#F8F8FA'}]}>
                    <Pageheader title={"RESTAURANTES"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                    <View style={{flex: 1, alignItems: "center", justifyContent: 'center'}}>

                        {!this.state.error ? <ActivityIndicator color={COLOR.GREY}/> : <Text>Problema ao trazer os restaurantes</Text> }
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    restauranteBoxImage: {
        paddingRight: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.26,
        shadowRadius: 3.68,
        elevation: 4,
    },
    restauranteImage: {
        height: 35,
        width: 35,
        backgroundColor: 'white',
        borderRadius: 25
    },
    topContainerAccordion: {
        borderRadius: 6,
        backgroundColor: COLOR.WHITE,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15, 
        paddingHorizontal: 15 , 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
    },
    itemClickableLabel: {
        color: COLOR.GREY,
        paddingLeft: 5,
        fontWeight: WEIGHT.MEDIUM,
        fontSize: FONT.SMALL, 
    },
    flexMiddle: {
        paddingTop: responsiveHeight(21),
        justifyContent: 'center',
        // alignItems: 'center'
    },    
    headerContent: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        paddingBottom: 15, 
        paddingHorizontal: 15, 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
        backgroundColor: "#ffffff",
    },
    flex1: {
        flex:1,
    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
});

export default connect(mapStateToProps)(Restaurantes);