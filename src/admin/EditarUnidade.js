// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon, CheckBox } from 'react-native-elements'
import Toast from 'react-native-easy-toast';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { connect } from 'react-redux';
// LOCAL IMPORTS
import Pageheader from '../components/Pageheader';
import EditarUnidadeFormComponent from './EditarUnidadeFormComponent';
import CardapioComponent from './CardapioComponent';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');
const server = getApi('api');
let aController = new AbortController();
let signal = aController.signal;

const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: COLOR.SECONDARY }}
    style={{ backgroundColor: COLOR.BACKGROUND }}
    renderLabel={({ route, focused, color }) => (
        <Text style={{ color: focused ? COLOR.SECONDARY : COLOR.GREY, margin: 8, fontWeight: WEIGHT.FAT, fontSize: FONT.SMALL}}>
            {route.title}
        </Text>
    )}
  />
);

class EditarUnidade extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            unidade: props.route.params.unidade,
            arrowSize: 15,
            city: 'Uberlândia',
            listRestaurantes: null,
            index: 0,
            routes: [
                { key: 'first', title: 'Editar Dados' },
                { key: 'second', title: 'Editar Cardápio' },
            ],
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
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
        let response = await fetch(server.url + `api/units/listOne/${this.state.unidade.unidades._id}?token=${this.props.userToken}`);
        response = await response.json();
        if (!response.error) {
            this.setState({
                infos: response.unity
            })
        }else{
            this.setState({error: true, message: response.message})
        }
    }

    render(){
        if (this.state.infos) {
            return(
                <View style={[styles.flex1, {backgroundColor: '#F8F8FA'}]}>
                    
                    <Pageheader title={"EDITAR UNIDADE"} navigation={this.props.navigation} statusBarColor={'transparent'}/>

                            <TabView
                                renderTabBar={renderTabBar}
                                navigationState={this.state}
                                onIndexChange={index => { this.setState({ index })} }
                                renderScene={SceneMap({
                                    first: () => <EditarUnidadeFormComponent navigation={this.props.navigation} infos={this.state.infos}/>,
                                    second:() => <CardapioComponent navigation={this.props.navigation} infos={this.state.infos}/>,
                                })}
                            /> 

                    <Toast ref="toast" />
                </View>
            )
        }else{
            return (
                <View style={[styles.flex1, {backgroundColor: '#F8F8FA'}]}>
                    <Pageheader title={"RESTAURANTES"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                    <View style={{flex: 1, alignItems: "center", justifyContent: 'center'}}>
                        {!this.state.error ? <ActivityIndicator color={COLOR.GREY}/> : <Text>{this.state.message}</Text> }
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    contentFormDados: {
        flex: 1,
        padding: 15
    },
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

export default connect(mapStateToProps)(EditarUnidade);