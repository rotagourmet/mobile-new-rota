// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Keyboard } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
// REDUX IMPORTS
import { connect } from 'react-redux';
import { selectedPlanStorage } from '../actions';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import def_styles from '../assets/styles/theme.styles'
import Pageheader from '../components/Pageheader';
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const api_key = 'ak_live_oxDVAhSHumPJ9gTKlT7R9R227eUD32'; //API_KEY
const server = getApi('api');

class ChangePlan extends Component {

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
            let currentPlan = this.props.currentSubscription;
            this.setState({
                id: currentPlan.id, 
                plan: currentPlan
            })
            this.listPlans()
        }
    }

    async listPlans(){
        //Requisição de Listar planos
        let plans = await fetch(server.url + `api/plans/list?token=` + this.props.userToken);
        plans = await plans.json();
        this.setState({ plans })
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

    render(){
        return(
            <View style={[styles.flex1, styles.bgColorWhite,]}>
                <Pageheader title={"MEU PLANO"} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                <View style={def_styles.p_h_15}>
                    
                    {this.state.plans && this.state.plans.plans ?
                            this.state.plans.plans.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} style={[styles.contentBtn, { borderColor: item.plan_id == this.state.id ? COLOR.SECONDARY : 'transparent',  }]} onPress={() => { this.setState( { id: item.plan_id, plan: item } ); Keyboard.dismiss() }}>
                                    <View style={[styles.flexRow, styles.contentCenter, {flex: 3}]}>
                                        <View style={styles.iconContent}>
                                            {item.plan_id == this.state.id ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
                                        </View>
                                        <View style={def_styles.p_l_10}>
                                            <Text style={styles.txtTitle}>{item.titleApp}</Text>
                                            <Text style={styles.txtDescri}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.flexRow, styles.contentEnd, {flex: 1.2}]}>
                                        <Text style={styles.txtcifrao}>R$<Text style={styles.txtNumero}> {this.planPrice(item.price)}</Text>,{this.planPriceCents(item.price)}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                            }) : 
                            <View style={styles.contentLoader}> 
                                <ActivityIndicator color={COLOR.GREY} />  
                            </View>
                        }
                        <TouchableOpacity style={styles.mainBtn} onPress={() => this.nextStep()}>
                            {this.state.loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>ALTERAR PLANO</Text>}
                        </TouchableOpacity>
                </View>
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
        fontSize: FONT.SMALL,
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
    bgColorWhite:{
        backgroundColor: COLOR.BACKGROUND, 
    },
    flex1: {
        flex:1,
    }
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    currentSubscription: store.InfoReducer.currentSubscription,
});

const mapDispatchToProps = dispatch => bindActionCreators({ selectedPlanStorage }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ChangePlan);