// LIB IMPORTS
import React, { useState, useEffect } from 'react'
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
import moment from 'moment/min/moment-with-locales'
import { useSelector, useDispatch } from 'react-redux'
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import CardapioList from '../components/CardapioList';
import Beneficios from '../components/RestaurantBeneficios';
import Informacoes from '../components/RestaurantInformacoes';
import { getApi } from '../environments/config'
import BtnUtilizarVoucher from '../components/BtnUtilizarVoucher'
import Events from '../utils/Events';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();
// CONSTS DECLARING
const { COLOR, FONT, WEIGHT } = Theme;
const server = getApi('api');
const { width, height } = Dimensions.get('window');
moment.locale('pt-BR');




function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const Restaurant = ({ route, navigation }) => {
	// STATE
	const [infos, setInfos] = useState({
		latitude: new Animated.Value(0),
		longitude: new Animated.Value(height),
		loading: new Animated.Value(height)
	})
	const [url, setUrl] = useState("")
	const [restaurant, setRestaurant] = useState(route.params.restaurant)
	const [modeloNegocioName, setModeloNegocioName] = useState("")
	const [loadingMdn, setLoadingMdn] = useState(false)
	const [acompanhado, setAcompanhado] = useState(true)
	const [individual, setIndividual] = useState(true)
	const [delivery, setDelivery] = useState(true)
	const [state, setState] = useState({});
	const [index, setIndex] = useState(0);
	// const [routeState, setRouteState] = useState({
	// 	tabview: true,
	// 	index: 0,
	// 	routes: route.params.restaurant && route.params.restaurant.cardapio && route.params.restaurant.cardapio.length > 0 ? [
	// 			{ key: 'first', title: 'Benefícios' },
	// 			{ key: 'second', title: 'Cardápio' },
	// 			{ key: 'third', title: 'Informações' },
	// 	] :  [
	// 			{ key: 'first', title: 'Benefícios' },
	// 			{ key: 'second', title: 'Informações' },
	// 	]});
	// REDUX
	const dispatch = useDispatch()
	const userData = useSelector(state => state.AuthReducer.userData);
	const userToken = useSelector(state => state.AuthReducer.userToken);
	const mdn = useSelector(state => state.InfoReducer.modeloNegocio);
	const vouchers = useSelector(state => state.InfoReducer.vouchers);
	dispatch({type: 'STORAGE_CURRENT_RESTAURANT', currentRestaurant: restaurant});

	
	useEffect(() => {
		const modeloNegocios = restaurant.modeloNegocio;
		let index = 0;

		while (index < modeloNegocios.length) {
			if(modeloNegocios[index].status){
				setModeloNegocioName(modeloNegocios[index].name);
				dispatch({type: 'MODELO_DE_NEGOCIO', modeloNegocio: modeloNegocios[index].name});
				index = modeloNegocios.length;
			}
			index++
		}
		buscarVouchersUtilizados();
		fetchMarkerData();
	}, [])

	const fetchMarkerData = () => {
		if (restaurant) {
			let endereco = restaurant.address.logradouro + ', ' + restaurant.address.numero + ' - ' + restaurant.address.bairro + ' ' + restaurant.address.cep
			fetch('https://maps.googleapis.com/maps/api/geocode/json?address= '+ endereco + 'A&key=AIzaSyAXAPVfRS5PKR_X1TSYqwmK7cqhHp09JpU')
			.then((response) => response.json())
			.then((response) => {
				if (response.results && response.results[0] && response.results[0].geometry && response.results[0].geometry.location) {    
					setInfos({
						latitude: response.results[0].geometry.location.lat,
						longitude: response.results[0].geometry.location.lng,
						loading: false,
					})
					setUrl(
						Platform.select({
							ios: "maps:" + response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng + "?q=" + endereco,
							android: "geo:" + response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng + "?q=" + endereco
						})
					)
				}
			}).catch((error) => {
			});
		}
	}

  const buscarVouchersUtilizados = async () => {
		// MAP ESTÁ SENDO UTILIZADO PARA: 
		// Verificar se tem um voucher usado neste restaurante;
		// Verificar intervalo de tempo para cada modelo de negocio ativo;
		let intervaloTempo = [];
		if (vouchers && vouchers.vouchers && vouchers.vouchers.length > 0) {
			restaurant.modeloNegocio.map((mdn) => {
				vouchers.vouchers.map((item) => {
					if (mdn.status && item.restaurante.nomeRestaurante === restaurant.restaurante.nomeRestaurante) {
						let form = {
							intervaloUtilizacao: mdn.intervaloUtilizacao,
							name: item.modeloNegocio,
							data: item.createdAt
						}
						intervaloTempo.push(form)
					}
				})
			});
			//Requisição de Busca Intervalos de Utilização e inserir os tempos nos grupos de vouchers utilizados
			let arrayFinal = []
			let response = await fetch(server.url + `api/intervalos/list?token=` + userToken);
			response = await response.json();
			if (!response.error) {
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
					setState({ 
						...state, 
						[item.name]:  true
					});
				}else{
					setState({ 
						...state, 
						[item.name]:  false, 
						[item.name + "_disponivelEm"]: item.dias - dias
					})
				}
			}))
		}
		setLoadingMdn(false);
	}

  const trataTel = (ph) => {
		return `tel:${ph.replace(/\D/g, '')}`;
	}

  const modeloDeNegocio = (data) => {
		dispatch({type: 'MODELO_DE_NEGOCIO', modeloNegocio: data});
		setModeloNegocioName(data);
		// this.refs.restScroll.scrollTo({ x: 0, y: 350, animated: true});
	}

  const chamaWhatsApp = (phone) => {
		let text = `Olá, meu nome é ${userData.name}. `
		phone = phone.replace(/\D/g, '');
		phone = `55${phone}`
		const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
		Linking.openURL(urlWhatsapp);
	}

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

	const BeneficiosComponent = props => (
		<Beneficios restaurant={restaurant} />
	);

	const InformacoesComponent = props => (
		<Informacoes 
			restaurant={restaurant}
			userData={userData} map={{...infos, url}}
			/>
	);

	return (
		<View style={[styles.flex1, {backgroundColor: COLOR.WHITE}]}>
			<ScrollView >
				{/* PARTE SUPERIOR */}
				<View style={styles.contentArrow}>
					<TouchableOpacity onPress={() => { navigation.goBack(); Events.publish('UpdateIcon') }} style={styles.btnBack}>
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
							<TouchableOpacity style={styles.contactBtn} onPress={() => restaurant.celular ? chamaWhatsApp(restaurant.celular) : Linking.openURL(trataTel(restaurant.telefone)) }>
								<Image 
									source={restaurant.celular ? require('../assets/icons/whatsapp.png') : require('../assets/icons/phone.png')} 
									style={styles.contactBtnIcons}/>
							</TouchableOpacity>
							{restaurant.instagram ? 
								<TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`https://www.instagram.com/` + restaurant.instagram)}>
									<Image 
									source={ require('../assets/icons/insta.png')}
									style={styles.contactBtnIcons}/>
								</TouchableOpacity>  
							: null}
							{url ?
							<TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(url)}>
								<Image source={ require('../assets/icons/placeholder.png')} style={[{height:18, width: 12}]}/>
							</TouchableOpacity>
							: null }
						</View>

						<View style={styles.containerAmbient}>
							{restaurant && restaurant.ambiente && restaurant.ambiente.atendimentoBom ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/paint-board-and-brush.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Atendimento Personalizado</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.climatizado ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/snow.png')}
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Ambiente Climatizado</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.musica ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/music.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Música Ambiente</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.wifi ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/internet.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Wifi</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.seguranca ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/surface.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Segurança 24h</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.fraldario ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/pacifier.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Fraldário</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.petfriend ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/pet.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Pet Friendly</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.playground ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/toy.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Playground</Text>
							</View>
							:null}
							{restaurant && restaurant.ambiente &&  restaurant.ambiente.estacionamento ? 
							<View style={styles.flexDirectionCenter}>
									<Image 
										source={require('../assets/restaurante/transport.png')} 
										style={styles.iconAmbient}/>
									<Text style={styles.ambientLabel}>Estacionamento</Text>
							</View>
							:null}
						</View>
						{!loadingMdn ?
								<View style={styles.mdnRow}>
								{restaurant.modeloNegocio[0].status ?
									<View>
										<TouchableOpacity style={[styles.modeloNegocioContent, 
										{backgroundColor: !acompanhado ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
										{borderColor: modeloNegocioName === "Acompanhado" ? COLOR.SECONDARY : 'transparent', }]} onPress={() => modeloDeNegocio(restaurant.modeloNegocio[0].name)}>
											<View style={styles.iconContent}>
													{modeloNegocioName === "Acompanhado" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/>: null}
											</View>
											<View style={styles.modeloNegocioImgContent}>
													<Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/couple.png')}/>
											</View>
											<Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[0].name}</Text>
											<Text style={styles.modeloNegocioDescription}>100% OFF NO 2º prato</Text>
										</TouchableOpacity>
										{state.Acompanhado_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {state.Acompanhado_disponivelEm} dias</Text> : null}
									</View>                                    
								: null}
								{restaurant.modeloNegocio[1].status ?  
									<View>  
										<TouchableOpacity style={[styles.modeloNegocioContent, 
										{backgroundColor: !individual ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
										{borderColor: modeloNegocioName === "Individual" ? COLOR.SECONDARY : 'transparent'}]} onPress={() => modeloDeNegocio(restaurant.modeloNegocio[1].name)}>
											<View style={styles.iconContent}>
													{modeloNegocioName === "Individual" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
											</View>
											<View style={styles.modeloNegocioImgContent}>
													<Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/individual.png')}/>
											</View>
											<Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[1].name}</Text>
											<Text style={styles.modeloNegocioDescription}>30% OFF</Text>
										</TouchableOpacity>
										{Individual_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {state.Individual_disponivelEm} dias</Text> : null}
									</View>
								: null}
								{restaurant.modeloNegocio[2].status ?    
									<View>
										<TouchableOpacity style={[styles.modeloNegocioContent, 
										{backgroundColor: !delivery ? COLOR.WHITE_DISABLED2 : COLOR.WHITE}, 
										{borderColor: modeloNegocioName === "Delivery" ? COLOR.SECONDARY : 'transparent'}]} onPress={() => modeloDeNegocio(restaurant.modeloNegocio[2].name)}>
											<View style={styles.iconContent}>
													{ modeloNegocioName === "Delivery" ? <Image source={require('../assets/perfil/correctY.png')} style={styles.correctImg}/> : null}
											</View>
											<View style={styles.modeloNegocioImgContent}>
													<Image style={styles.imgModeloNegocio} source={require('../assets/restaurante/scooter.png')}/>
											</View>
											<Text style={styles.modeloNegocioTitle}>{restaurant.modeloNegocio[2].name}</Text>
											<Text style={styles.modeloNegocioDescription}>20% a 50% OFF'</Text>
										</TouchableOpacity>
										{state.Delivery_disponivelEm ? <Text style={{color: COLOR.GREY, fontSize: 9}}>Disponível em {state.Delivery_disponivelEm} dias</Text> : null}
									</View>
								: null}
							</View>
						: 
							<View style={styles.containerLoad}>
								<ActivityIndicator  />
							</View>
						}	
						{/* O ESQUEMA CONDICIONAL A SEGUIR É PARA TIRAR A ABA CARDÁPIO, CASO NÃO HAJA ITENS. 
						PARA FUNCIONAR PRECISA SER FEITA A CONFIGURAÇÃO NO STATE TAMBÉM */}
						
							
					</View>
				</View>
			<Tab.Navigator>
				<Tab.Screen name="Beneficios" component={BeneficiosComponent} />
				<Tab.Screen name="Informacoes" component={InformacoesComponent} />
				{/* <Tab.Screen name="Informacoes" component={Informacoes} /> */}
			</Tab.Navigator>
			</ScrollView>
			<BtnUtilizarVoucher
					navigation={navigation}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	mdnRow:{
		flexDirection: 'row', 
		justifyContent: 'center'
	},
	containerLoad: {
		flexDirection: 'row', 
		justifyContent: 'center'
	},
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

export default Restaurant;