// LIB IMPORTS
import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Animated, AsyncStorage, Platform } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import Events from '../utils/Events';
// CONSTS DECLARING
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

if(Platform.OS === 'android') { // SERVE PARA QUE AS MASCARAS DE NÚMEROS FUNCIONEM NO ANDROID
  require('intl'); // import intl object
  require('intl/locale-data/jsonp/pt-BR'); // load the required locale details
}

class TopBarHome extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            economiaLoading: true,
        };
        this.setCity = this.setCity.bind(this);
        this.setName = this.setName.bind(this);
        this.setupEconomia = this.setupEconomia.bind(this);
        this.setCityAgain = this.setCityAgain.bind(this);
    }
    setCity(){
        this.setState({
            cityLoading: true
        })
    }

    setName(){
        let name = this.props.userData && this.props.userData.name && this.props.userData.name.split(' ');
        this.setState({ name: name && name[0] ? name[0] : "" })
    }

    async setCityAgain(){
        this.setState({ selectedCity: await this.props.selectedCity }) 
        setTimeout(() => {
            this.setState({
                cityLoading: false
            })
        }, 2000);
    }

    async componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.LoadingScreen = Events.subscribe('LoadingScreen', this.setCity);
            this.UpdateName = Events.subscribe('UpdateName', this.setName);
            this.LoadVouchers = Events.subscribe('LoadVouchers', this.setupEconomia);
            this.UpdateCityName = Events.subscribe('UpdateCityName', this.setCityAgain);

            let userData = this.props.userData;
            if ( this.props.userData instanceof Promise || typeof  this.props.userData == 'promise'){
                userData = await this.props.userData;
                userData = await JSON.parse(userData);
            }
            let name = userData && userData.name && userData.name.split(' ');
            this.setState({
                name: name && name[0],
                selectedCity: await this.props.localizacao
            });
            this.setupEconomia();
        }
    }


    componentWillUnmount(){
        this._isMounted = false;
        Events.remove('LoadingScreen')
        this.LoadingScreen = null;
        
        Events.remove('UpdateName')
        this.UpdateName = null;
        
        Events.remove('LoadVouchers')
        this.LoadVouchers = null;
        
        Events.remove('UpdateCityName')
        this.UpdateCityName = null;
    }

    setupEconomia(){
        
        let economia = 0;

        this.setState({ economiaLoading: true })
        
        if (!this.props.vouchers || this.props.vouchers && this.props.vouchers.error) {
            this.setState({economia: null, economiaLoading: false})
        }else{
            if (this.props.vouchers && this.props.vouchers.vouchers && this.props.vouchers.vouchers) {
                this.props.vouchers.vouchers.map((item) => {
                    economia = economia + item.valorDesconto;
                });
                economia = economia.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2})
                
                this.setState({economia, economiaLoading: false})
            } else {
                this.setState({economia: null, economiaLoading: false})
            }
        }
    }

    render(){
        const { localizacao, selectedCity} = this.state;

        if(this.props.network){

            return(
                <View style={[styles.containerTopBar]}>
                    <LinearGradient colors={['#FFB31C', '#DDAA45']} style={styles.degradeContainer}>
                        <View style={styles.flexRowTopBar}>
                            {/* INICIO DO LADO DA LOGO */}
                            <View style={styles.flexRow}>
                                <View>
                                    <Image style={styles.logoImg} source={IMAGES.logoPreta} />
                                </View>
                                <View>
                                    
                                    <Text style={styles.nameTopBar}>{this.state.name ? `Olá, ${this.state.name}!` : "Olá!"}</Text>
                                    
                                    <View style={[styles.chooseCity]}>
                                    { this.props.localizacao != 'not allowed' && !this.state.cityLoading ? 
                                        <TouchableOpacity onPress={() => { Events.publish("OpacityBottomTabFalse"); Events.publish("OpenModalCity")}} style={[styles.flexRow, {justifyContent: 'center', alignItems: 'center'}]}>
                                            <Icon name='map-marker' type='font-awesome' color={COLOR.WHITE} size={19} />
                                                <Text style={styles.cityTopBar}>{this.props.localizacao}</Text>
                                            <Icon name='chevron-down' type='font-awesome' color={COLOR.WHITE} size={8} />
                                        </TouchableOpacity>
                                    : this.props.localizacao == 'not allowed' && !this.state.cityLoading ? 
                                        <TouchableOpacity onPress={() => { Events.publish("OpacityBottomTabFalse"); Events.publish("OpenModalCity")}} style={[styles.flexRow, {justifyContent: 'center', alignItems: 'center'}]}>
                                            <Icon name='map-marker' type='font-awesome' color={COLOR.WHITE} size={19} />
                                            <Text style={styles.cityTopBar}>Onde você está?</Text>
                                            <Icon name='chevron-down' type='font-awesome' color={COLOR.WHITE} size={8} />
                                        </TouchableOpacity>
                                    :   
                                        <ActivityIndicator size="small" color={COLOR.WHITE} />
                                    }
                                    </View>
                                </View>
                            </View>
                            {/* FIM DO LADO DA LOGO */}
                            {/* INICIO DO LADO DO "Você já economizou" */}
                            <View style={styles.containerEconomia}>
                                {this.state.economiaLoading ? null : <Text style={styles.topBarTitleEconomia}>{this.state.economia ? 'Você já economizou' : 'Você ainda não\neconomizou'}</Text>}
                                {this.state.economia ?
                                    <TouchableOpacity style={styles.btnEconomia} onPress={() => this.props.navigation.navigate("Historic")}>
                                        <Image source={require('../assets/icons/receipt.png')} style={styles.imageReciept}/>
                                        <Text style={styles.topBarSubTitleEconomia}>{this.state.economia}</Text>
                                        <Icon name='chevron-right' type='font-awesome' color={COLOR.BLACK} size={8} />
                                    </TouchableOpacity>
                                : null}
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            )
        }else if(!this.props.network){
            return(
                <View style={styles.containerTopBar}>
                    <LinearGradient colors={['#FFB31C', '#DDAA45']} style={styles.degradeContainer}>
                        <View style={styles.flexRowTopBar}>
                            <View style={styles.flexRow}>
                                <View style={styles.contentComerAgora}>
                                    <Image style={styles.logoImg} source={IMAGES.logoPreta} />
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    topBarSubTitleEconomia: {
        color: COLOR.BLACK,
        fontSize: FONT.SMEDIUM,
        paddingHorizontal: 8
    },
    imageReciept: {
        height: responsiveHeight(1.7),
        width: responsiveHeight(1.7),
    },
    btnEconomia: {
        backgroundColor: COLOR.WHITE, 
        borderRadius: 5, 
        paddingVertical: 5, 
        paddingHorizontal: 12, 
        flexDirection : 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    topBarTitleEconomia: {
        color: COLOR.WHITE,
        fontSize: responsiveFontSize(1.82),
        paddingBottom: 5,

    },
    containerEconomia: {
        alignItems: 'flex-end',
        paddingRight: 5
    },
    cityTopBar: {
        fontSize: FONT.SMALL,
        paddingHorizontal: 5,
        color: COLOR.WHITE,
    },
    contentComerAgora:{
        flex: 1, 
        alignItems: 'center', 
        
    },
    flexRow: {
        flexDirection: 'row'
    },
    chooseCity: {
        alignItems: 'center',
        paddingLeft: 5,
        paddingTop: 5,
    },
    nameTopBar: {
        fontSize: FONT.MEDIUM,
        paddingLeft: 5,
        color: COLOR.WHITE,
        fontWeight: '600'
    },
    logoImg: {
        height: responsiveWidth(13),
        width: responsiveWidth(13),
    },
    flexRowTopBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    containerTopBar: {
        height: responsiveHeight(14),
        position: 'absolute',
        zIndex: 10,
        left: 0,
        right: 0,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 4.68,
        elevation: 4,
    },
    degradeContainer: {
        // borderBottomRightRadius: 15, 
        borderRadius: 15, 
        flex: 1,  
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        flexDirection: 'row', 
        paddingBottom: responsiveHeight(2), 
        paddingHorizontal: 8,
    },
});


const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    selectedCity: store.InfoReducer.selectedCity
});

export default connect(mapStateToProps)(TopBarHome);