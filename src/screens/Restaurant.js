// LIB IMPORTS
import React, { Component } from 'react'; 
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	TouchableOpacity, 
	Image, 
	Animated,
	Dimensions, 
	Linking, 
	ActivityIndicator 
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import moment from 'moment/min/moment-with-locales'
// REDUX IMPORTS
import { connect } from 'react-redux';
import { setCurrentScreen, modeloNegocioStorage, setCurrentRestaurant } from '../actions';
import { bindActionCreators } from 'redux';
// LOCAL IMPORTS
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import CardapioList from '../components/CardapioList';
import Beneficios from '../components/RestaurantBeneficios';
import Informacoes from '../components/RestaurantInformacoes';
import { getApi } from '../environments/config'
import BtnUtilizarVoucher from '../components/BtnUtilizarVoucher'
import Events from '../utils/Events';
// CONSTS DECLARING
const { COLOR, FONT, WEIGHT } = Theme;
const server = getApi('api');
const { width, height } = Dimensions.get('window');
moment.locale('pt-BR');

const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: COLOR.SECONDARY }}
    style={{ backgroundColor: COLOR.WHITE }}
    renderLabel={({ route, focused, color }) => (
        <Text style={{ color: focused ? COLOR.SECONDARY : COLOR.GREY, margin: 8, fontWeight: WEIGHT.FAT, fontSize: FONT.SMALL}}>
            {route.title}
        </Text>
    )}
  />
);

class Restaurant extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            restaurant: props.route.params.restaurant,
            tabview: true,
            index: 0,
            routes: props.route.params.restaurant && props.route.params.restaurant.cardapio && props.route.params.restaurant.cardapio.length > 0 ? [
                { key: 'first', title: 'Benefícios' },
                { key: 'second', title: 'Cardápio' },
                { key: 'third', title: 'Informações' },
            ] :  [
                { key: 'first', title: 'Benefícios' },
                { key: 'second', title: 'Informações' },
            ],
            Acompanhado: true,
            Individual:true,
            Delivery:true,
            loadingMdn:true,
            assinante: false
        }
    }

    componentDidMount(){
        this._isMounted = true;
        this.props.setCurrentRestaurant(this.state.restaurant)
        if (this._isMounted) { 
            Events.publish("UpdateIcon")
            this.setState({
                modeloNegocio: this.state.restaurant && this.state.restaurant.modeloNegocio,
                
            });
            const modeloNegocios = this.state.restaurant.modeloNegocio;
            let index = 0;
            while (index < modeloNegocios.length) {
                if(modeloNegocios[index].status){
                    this.setState({
                        modeloNegocioName: modeloNegocios[index].name
                    });
                    this.props.modeloNegocioStorage(modeloNegocios[index].name); 
                    index = modeloNegocios.length;
                }
                index++
            }
            this.buscarVouchersUtilizados();
            this.fetchMarkerData();
            this.verificaAssinatura();
            this.verificaSeAceitaHoje(this.state.restaurant);
        }
    }

    verificaAssinatura(){
        let now = moment();

        if (this.props.subscription && !this.props.subscription.error) {
            let endDate = moment(this.props.subscription.endDate);
            if(now <= endDate){
                this.setState({
                    assinante: true
                })
            }else if(this.props.userData && this.props.userData.voucher && this.props.userData.voucher.expirateDate){
                let voucherEndDate;
                voucherEndDate = moment(this.props.userData.voucher.expirateDate);
                if(voucherEndDate && now <= voucherEndDate){
                    if (this.props.userData.voucher.number > 0 || this.props.userData.voucher.number === "FREE") {
                        this.setState({
                            assinante: true
                        })
                    }
                }
            }
        }else if(this.props.userData && this.props.userData.voucher && this.props.userData.voucher.expirateDate){
            let voucherEndDate;
            voucherEndDate = moment(this.props.userData.voucher.expirateDate);

            if(voucherEndDate && now <= voucherEndDate){
                if (this.props.userData.voucher.number > 0 || this.props.userData.voucher.number === "FREE") {
                    this.setState({
                        assinante: true
                    })
                }
            }else{
                this.setState({
                    assinante: false
                })
            }
        }
    }

    async buscarVouchersUtilizados(){
        let { vouchers } = this.props;
        let { restaurant } = this.state;
        // MAP ESTÁ SENDO UTILIZADO PARA: 
        // Verificar se tem um voucher usado neste restaurante;
        // Verificar intervalo de tempo para cada modelo de negocio ativo;

        let intervaloTempo = [];
        if (vouchers && vouchers.vouchers && vouchers.vouchers.length > 0) {
                
            restaurant.modeloNegocio.map((mdn) => {
                vouchers.vouchers.map((item) => {
                    if (mdn.status && item.restaurante.nomeRestaurante === restaurant.restaurante.nomeRestaurante) {
                        if (item.modeloNegocio === mdn.name) {    
                            let form = {
                                intervaloUtilizacao: mdn.intervaloUtilizacao,
                                name: item.modeloNegocio,
                                data: item.createdAt
                            }
                            intervaloTempo.push(form)
                        }
                    }
                })
            });
            
            //Requisição de Busca Intervalos de Utilização e inserir os tempos nos grupos de vouchers utilizados
            let arrayFinal = []
            let response = await fetch(server.url + `api/intervalos/list?token=` + this.props.userToken);
            response = await response.json();
            if (response.error) {
                
            } else {
                intervaloTempo.map((item) => {
                    let intervalo = response.dados.filter((response) => response._id === item.intervaloUtilizacao);
                    intervalo.map((outro) => {
                        let newForm = {
                            dias: outro.dias,
                            nomeIntervalo: outro.nome,
                            name: item.name,
                            data: item.data,
                        };
                        arrayFinal.push(newForm)
                    })
                })
            }
            // AGORA VERIFICA SE O TEMPO ATUAL DEVE OU NÃO HABILITAR O MODELO DE NEGÓCIO
            await Promise.all(arrayFinal.map((item) => {
                let dataAntes = moment(item.data);
                let dataAtual = moment();
                let horas = dataAntes.diff(dataAtual, 'hours');
                let dias = dataAtual.diff(dataAntes, 'days');
                
                if(dias >= item.dias){
                    this.setState({
                        [item.name]:  true,
                        
                    })
                }else{
                    this.setState({
                        [item.name]: false,
                        [item.name + "_disponivelEm"]: item.dias - dias
                    })
                }
            }))
            this.setState({loadingMdn: false})

        }else{
            this.setState({loadingMdn: false})
        }


    }

    verificaSeAceitaHoje(item){
        let hoje = moment().format("ddd");
        if (item && item.modeloNegocio[0].status && (item.modeloNegocio[0].diasAceitacao[hoje+"Noite"] || item.modeloNegocio[0].diasAceitacao[hoje+"Dia"])) { // ACOMPANHADO
        }else if(item && item.modeloNegocio && item.modeloNegocio[1].status && (item.modeloNegocio[1].diasAceitacao[hoje+"Noite"] || item.modeloNegocio[1].diasAceitacao[hoje+"Dia"])){ // INDIVIDUAL
        }else if(item && item.modeloNegocio && item.modeloNegocio[2].status && (item.modeloNegocio[2].diasAceitacao[hoje+"Noite"] || item.modeloNegocio[2].diasAceitacao[hoje+"Dia"])){ // DELIVERY
        }else{
            this.setState({
                // assinante: false
            })
        }
    
    }
		
    componentWillUnmount(){
        this._isMounted = false;
    }
    
    fetchMarkerData() {
        let restaurant  = this.state.restaurant;
        if (restaurant && restaurant.address && restaurant.address.logradouro ) {
            let endereco = restaurant.address.logradouro + ', ' + restaurant.address.numero + ", " + restaurant.address.cep + ' - ' + restaurant.address.bairro
            this.setState({ 
                url: Platform.select({
                    ios: "maps:?q=" + endereco,
                    android: "geo:" + "?q=" + endereco
                })
            }); 
            // fetch('https://maps.googleapis.com/maps/api/geocode/json?address= '+ endereco + 'A&key=AIzaSyB0YH1mH4F_sro1dYmsxwGDhTngl3pnB6A')
            // .then((response) => response.json())
            // .then((response) => {
            //     console.log('response', response);
            //     if (response.results && response.results[0] && response.results[0].geometry && response.results[0].geometry.location) {    
            //         this.setState({ 
            //             infos: {
            //                 latitude: response.results[0].geometry.location.lat,
            //                 longitude: response.results[0].geometry.location.lng,
            //                 loading: false,
            //             },
            //             url: Platform.select({
            //                 ios: "maps:" + endereco,
            //                 android: "geo:" + response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng + "?q=" + endereco
            //             })
            //         }); 
            //     }
            // })
            // .catch((error) => {
            // });
        }
    }

    trataTel(ph){
        return `tel:${ph.replace(/\D/g, '')}`;
    }

    modeloDeNegocio(data){
        this.props.modeloNegocioStorage(data); 
        this.setState({ modeloNegocioName: data })
        this.refs.restScroll.scrollTo({ x: 0, y: 350, animated: true})
    }

    chamaWhatsApp(phone){
        let text = `Olá, meu nome é ${this.props.userData.name}. Faço parte do Clube Rota Gourmet,`
        phone = phone.replace(/\D/g, '');
        phone = `55${phone}`
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }

    render(){
        let {restaurant} = this.state;
        return(
            <View style={[styles.flex1, {backgroundColor: COLOR.WHITE}]}>
                <ScrollView ref={"restScroll"}>
                    {/* PARTE SUPERIOR */}
                    <View style={styles.contentArrow}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack() } style={styles.btnBack}>
                            <Image source={require('../assets/icons/arrow-back-w.png')} resizeMode='contain' style={{ width: responsiveWidth(3.5) }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.overlayImagemRepresentativa} />
                    <Image 
                        source={{uri: restaurant.restaurante.fotoRepresentativa}} 
                        style={styles.imagemRepresentativa}
                    />
                    {/* FIM DA PARTE SUPERIOR */}

                    <View style={styles.wholeContent}>

                        <View style={styles.titleContent}>
                            <Text style={styles.nomeUnidade}>{restaurant.nomeUnidade}</Text>
                            <Text style={styles.categoriasRestaurante}>{restaurant.culinariaPrincipal.nomeTipo}  •  {restaurant.address.bairro}</Text>
                        </View>
                        <View style={styles.containerInformacoes}>
                            <View style={[def_styles.p_r_20, styles.contentLogo]}>
                                <Image source={{uri: restaurant.restaurante.logo}} style={styles.imagemLogo}/>
                            </View>
                            <View style={styles.rowIcons}>
                                <TouchableOpacity style={styles.contactBtn} onPress={() => restaurant.celular ? this.chamaWhatsApp(restaurant.celular) : Linking.openURL(this.trataTel(restaurant.telefone)) }>
                                    <Image source={restaurant.celular ? require('../assets/icons/whatsapp.png') : require('../assets/icons/phone.png')} style={styles.contactBtnIcons}/>
                                </TouchableOpacity>
                                {restaurant.instagram ? 
                                    <TouchableOpacity style={styles.contactBtn}  onPress={() => {Linking.openURL(`https://www.instagram.com/` + restaurant.instagram)}}>
                                        <Image source={ require('../assets/icons/insta.png')} style={styles.contactBtnIcons}/>
                                    </TouchableOpacity>  
                                : null}
                                { this.state.url ?
                                <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(this.state.url)}>
                                    <Image source={ require('../assets/icons/placeholder.png')} style={[{height:18, width: 12}]}/>
                                </TouchableOpacity>
                                : null }
                            </View>


                            <View style={styles.containerAmbient}>
                                {restaurant && restaurant.ambiente && restaurant.ambiente.atendimentoBom ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/paint-board-and-brush.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Atendimento Personalizado</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.climatizado ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/snow.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Ambiente Climatizado</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.musica ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/music.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Música Ambiente</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.wifi ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/internet.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Wifi</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.seguranca ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/surface.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Segurança 24h</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.fraldario ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/pacifier.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Fraldário</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.petfriend ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/pet.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Pet Friendly</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.playground ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/toy.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Playground</Text>
                                </View>
                                :null}
                                {restaurant && restaurant.ambiente &&  restaurant.ambiente.estacionamento ? 
                                <View style={styles.flexDirectionCenter}>
                                    <Image source={require('../assets/restaurante/transport.png')} style={styles.iconAmbient}/>
                                    <Text style={styles.ambientLabel}>Estacionamento</Text>
                                </View>
                                :null}
                            </View>
                            {!this.state.loadingMdn ?
                                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                {restaurant.modeloNegocio[0].status ?
                                    <View>
                                        <TouchableOpacity style={[styles.modeloNegocioContent, 
                                        {backgroundColor: !this.state.Acompanhado ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
                                        {borderColor: this.state.modeloNegocioName === "Acompanhado" ? COLOR.SECONDARY : 'transparent', }]} onPress={() => this.modeloDeNegocio(restaurant.modeloNegocio[0].name)}>
                                            <View style={styles.iconContent}>
                                                {this.state.modeloNegocioName === "Acompanhado" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/>: null}
                                            </View>
                                            <View style={styles.modeloNegocioImgContent}>
                                                <Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/couple.png')}/>
                                            </View>
                                            <Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[0].name}</Text>
                                            <Text style={styles.modeloNegocioDescription}>100% OFF NO 2º prato</Text>
                                            
                                        </TouchableOpacity>
                                        {this.state.Acompanhado_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {this.state.Acompanhado_disponivelEm} dias</Text> : null}
                                    </View>                                    
                                : null}
                                {restaurant.modeloNegocio[1].status ?  
                                    <View>  
                                        <TouchableOpacity style={[styles.modeloNegocioContent, 
                                        {backgroundColor: !this.state.Individual ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
                                        {borderColor: this.state.modeloNegocioName === "Individual" ? COLOR.SECONDARY : 'transparent'}]} onPress={() => this.modeloDeNegocio(restaurant.modeloNegocio[1].name)}>
                                            <View style={styles.iconContent}>
                                                {this.state.modeloNegocioName === "Individual" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
                                            </View>
                                            <View style={styles.modeloNegocioImgContent}>
                                                <Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/individual.png')}/>
                                            </View>
                                            <Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[1].name}</Text>
                                            <Text style={styles.modeloNegocioDescription}>30% OFF</Text>
                                        </TouchableOpacity>
                                        {this.state.Individual_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {this.state.Individual_disponivelEm} dias</Text> : null}
                                    </View>
                                : null}
                                {restaurant.modeloNegocio[2].status ?    
                                    <View>
                                        <TouchableOpacity style={[styles.modeloNegocioContent, 
                                        {backgroundColor: !this.state.Delivery ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
                                        {borderColor: this.state.modeloNegocioName === "Delivery" ? COLOR.SECONDARY : 'transparent'}]} onPress={() => this.modeloDeNegocio(restaurant.modeloNegocio[2].name)}>
                                            <View style={styles.iconContent}>
                                                { this.state.modeloNegocioName === "Delivery" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
                                            </View>
                                            <View style={styles.modeloNegocioImgContent}>
                                                <Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/scooter.png')}/>
                                            </View>
                                            <Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[2].name}</Text>
                                            <Text style={styles.modeloNegocioDescription}>20% a 50% OFF'</Text>
                                        </TouchableOpacity>
                                        {this.state.Delivery_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {this.state.Delivery_disponivelEm} dias</Text> : null}
                                    </View>
                                : null}
                                </View>
                            : 
                                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                    <ActivityIndicator  />
                                </View>
                            }
                            {/* O ESQUEMA CONDICIONAL A SEGUIR É PARA TIRAR A ABA CARDÁPIO, CASO NÃO HAJA ITENS. 
                            PARA FUNCIONAR PRECISA SER FEITA A CONFIGURAÇÃO NO STATE TAMBÉM */}
                            <TabView
                                renderTabBar={renderTabBar}
                                navigationState={this.state}
                                onIndexChange={index => { this.setState({ index })} }
                                renderScene={
                                    restaurant && restaurant.cardapio && restaurant.cardapio.length > 0 ? 
                                    SceneMap({
                                        first:() => <Beneficios restaurant={restaurant} />,
                                        second:() => <CardapioList restaurant={restaurant} />,
                                        third: () => <Informacoes restaurant={restaurant} userData={this.props.userData} map={{...this.state.infos, url: this.state.url}} />,
                                    }) :
                                    SceneMap({
                                        first:() => <Beneficios restaurant={restaurant} />,
                                        second: () => <Informacoes restaurant={restaurant} userData={this.props.userData} map={{...this.state.infos, url: this.state.url}} />,
                                    }) 
                                }
                            />     
                        </View>
                    </View>

                </ScrollView>
                <BtnUtilizarVoucher
                    navigation={this.props.navigation}
                    allow={
                        this.state.modeloNegocioName === "Acompanhado" && this.state.Acompanhado && this.state.assinante ? true :
                        this.state.modeloNegocioName === "Individual" && this.state.Individual && this.state.assinante ? true :
                        this.state.modeloNegocioName === "Delivery" && this.state.Delivery && this.state.assinante ? true : false
                    }
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
	containerAmbient: {
		alignSelf: 'stretch',
		flexDirection: 'row', 
		flexWrap: 'wrap', 
		alignItems: 'stretch', 
		padding: 10, 
		justifyContent: 'center'
	},
	ambientLabel:{
		fontSize: FONT.LABEL,
		fontWeight: WEIGHT.THIN,
		color: COLOR.GREY,
		paddingLeft: 5
	},
	iconAmbient:{
		height: 11,
		width: 11,
	},
	flexDirectionCenter:{
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 5
	},
	modeloNegocioTitle: {
		fontSize: FONT.XSMALL,
		fontWeight: WEIGHT.FAT,
		paddingBottom: 5,
		color: COLOR.GREY,
		textAlign: 'center'
	},
	modeloNegocioDescription: {
		fontSize: FONT.LABEL,
		fontWeight: WEIGHT.THIN,
		paddingBottom: 5,
		color: COLOR.GREY,
		textAlign: 'center'
	},
	correctImg: {
		height: responsiveHeight(1.7),
		width: responsiveHeight(1.7),
	},
	iconContent: {
		position: 'absolute',
		top:  '2%',
		left:  '2%',
		borderWidth: 1,
		borderColor: COLOR.SECONDARY,
		height: responsiveHeight(2.0),
		width: responsiveHeight(2.0),
		borderRadius: 10,
	},
	modeloNegocioImgContent: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 4,
		paddingBottom: 10,
	},
	imgModeloNegocio: {
		height: 35,
		width: 35,
		marginBottom: responsiveHeight(0.5)
	},
	modeloNegocioContent: {
		borderWidth: 1.5,
		justifyContent: 'center',
		marginBottom: 15,
		padding: 5,
		marginHorizontal: 4,
		borderRadius: 6,
		height: responsiveHeight(19.5),
		width: responsiveWidth(29.0),
		shadowColor: "#000",
		shadowOffset: {
				width: 0,
				height: 3,
		},
		shadowOpacity: 0.26,
		shadowRadius: 2.68,
		elevation: 4,
	},
	contactBtn: {
		margin: 10,
		height: 35,
		width: 35,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLOR.BACKGROUND,
		borderRadius: 40,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.26,
		shadowRadius: 3.68,
		elevation: 4,
	},
	contactBtnIcons: {
		height: 16,
		width: 16,
	},
	rowIcons: {
		flexDirection: 'row',
		paddingTop: 10,
		paddingLeft: 10,
	},
	contentLogo: {
		position: 'absolute',
		right: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowOpacity: 0.26,
		shadowRadius: 3.68,
		elevation: 4,
		top: -55
	},
	imagemLogo: {
		width: 100,
		height: 100,
		borderRadius: 100
	},
	rowTopWholeContent:{
			flexDirection: 'row',
			justifyContent: 'space-between'
	},
	containerInformacoes: {
		backgroundColor: COLOR.WHITE,
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		zIndex: 4
	},
	contentArrow: {
		zIndex: 3,
		position: 'absolute',
	},
	btnBack: {
		paddingHorizontal: 30,
		paddingVertical: 20
	},
	titleContent: {
		paddingLeft: 20,
		paddingBottom: 10,
	},
	nomeUnidade:{
		fontSize: FONT.XLARGE,
		fontWeight: WEIGHT.FAT,
		color: COLOR.WHITE
	},
	categoriasRestaurante:{
		fontSize: FONT.XSMALL,
		color: COLOR.WHITE
	},
	wholeContent: {
		flex: 1,
		top: -100,
		zIndex: 3,
	},
	imagemRepresentativa: {
		width,
		height: height/2.8,
		zIndex: 1
	},
	overlayImagemRepresentativa: {
		width,
		height: height/2.5,
		position: 'absolute',
		zIndex: 2,
		backgroundColor: '#000000',
		opacity: 0.4
	},
	flex1: {
		flex: 1,
	}
});

const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    currentScreen: store.InfoReducer.currentScreen,
    modeloNegocio: store.InfoReducer.modeloNegocio,
    vouchers: store.InfoReducer.vouchers,
    subscription: store.InfoReducer.subscription
});

const mapDispatchToProps = dispatch => bindActionCreators({ setCurrentScreen, modeloNegocioStorage, setCurrentRestaurant }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Restaurant);