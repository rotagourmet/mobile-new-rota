import React, { useState } from 'react';
import { 
	View, 
	Image, 
	Text, 
	TouchableOpacity, 
	StyleSheet,
	ScrollView,
	Platform,
	Linking
} from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import Swiper from 'react-native-swiper'
import Theme from '../constants/Theme';
const { COLOR, FONT, WEIGHT } = Theme;

const OnboardingComponent = ({hideLastScreen, navigation}) => {
	
	const [lastScreen, setLastScreen] = useState(true)
	const [index, setIndex] = useState(0)

	const suporte = () =>{
		console.log('Teste', );
        let text = `Olá, meu nome é `
		let phone = '553432553690';
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }

	const fim = () =>(
		<View style={styles.containerEnd}>
			<View style={{position: 'absolute', top: -20, }}>
			<TouchableOpacity 
			onPress={suporte}
			style={{width: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 20}}>
				<Text style={{color: 'white', fontSize: 15, paddingRight: 5, color: COLOR.SECONDARY}}> Ajuda? </Text>
				<Image
					style={{height: 20, width: 20}}
					source={require("../assets/perfil/info.png")}
				/>
			</TouchableOpacity>
			</View>
			<ScrollView 
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{alignItems: 'center', justifyContent: 'center', flex:1}}>
				<Image style={styles.imageFinal} source={require('../assets/onboarding/pratos.png')} />
				<Text style={styles.title}>Viu como é fácil!?</Text>
				<Text style={styles.subtitle}>Só aqui você encontra os melhores restaurantes com descontos especiais. Você não vai mais parar em casa!</Text>
				<TouchableOpacity 
					style={styles.btnContainer} 
					onPress={() => navigation.navigate("Register") }>
					<Text style={styles.btnLabelFilled}>CRIAR MINHA CONTA</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate("Login") }>
					<Text style={[styles.btnLabelReenviar]}>ENTRAR</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);

	const swiperContainer = (form) => (
		<View style={[styles.containerEnd2, {top: hideLastScreen ? 50 : 0,}]}>
			{hideLastScreen && 
			<View style={{position: "absolute", top: 120, zIndex: 100}}>
				<View>
					<TouchableOpacity 
					onPress={() => suporte()}
					style={{width: '100%',justifyContent: 'flex-end', flexDirection: 'row', padding:10}}>
						<Text style={[styles.subtitleWhite2]}>{"Ainda com dúvidas?"}</Text>
						<Image
							style={{height: 18, width: 18}}
							source={hideLastScreen ? require("../assets/icons/whatsapp-black.png") : require("../assets/icons/whatsapp.png")}
						/>
					</TouchableOpacity>
				</View>
			</View>}
			<View 
			style={{alignItems: 'center', justifyContent: 'center', flex:1}}>
				<Image style={styles.image01} source={form.image} />
				<Text style={styles.title}>{form.title}</Text>
				<Text style={ hideLastScreen ? styles.subtitleWhite : styles.subtitle}>{form.subtitle}</Text>
			</View>
		</View>
	)
	
  	return (
		<View style={[styles.flex1, {backgroundColor: !hideLastScreen ? COLOR.BLACK : COLOR.BACKGROUND}]}>
			<Swiper 
				showsButtons={true} 
				onIndexChanged={(index) => setIndex(index)}
				buttonWrapperStyle={styles.buttonWrapperStyle}
				dot={<View style={styles.dot} />}
				nextButton={<Text style={styles.buttonText}>›</Text>}
				prevButton={<Text style={styles.buttonText}>‹</Text>}
				activeDot={<View style={styles.activeDot}/>}
				loop={false}>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/hamburguer.png'),
						title: "Bem-vindo ao Rota Gourmet!!",
						subtitle: "Somos o melhor clube Gastronômico do Brasil, conosco você ganha até 100% de desconto no segundo prato, em qualquer um de nossos parceiros. Veja como é rápido e fácil."
					})}
				</View>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/segunda.png'),
						title: "Conhecendo as opções de restaurantes",
						subtitle: "Navegue pelo aplicativo e conheça os restaurantes, seus cardápios, e os dias dos benefícios. Você vai adorar, são muitas opções!"
					})}
				</View>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/modelos.png'),
						title: "Escolha como usar o seu Desconto",
						subtitle: "Se comer fora já era bom, imagina comer nos melhores restaurantes da cidade com descontos excelentes como esses! 100% em um prato se você for acompanhado, até 30% se for sozinho ou até 50% se pedir delivery ou balcão. Aproveite do seu jeito!"
					})}
				</View>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/pratos.png'),
						title: "Você é VIP nos Restaurantes",
						subtitle: "Se já escolheu o restaurante do dia, decidiu se vai sozinho ou acompanhado e confirmou os dias de aceitação, agora basta ir. Chegando lá, aproveite a noite, você merece! Na hora da conta, informe que é associado Rota Gourmet."
					})}
				</View>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/entregador.png'),
						title: "Delivery Simples e Prático",
						subtitle: "E tem mais, alguns parceiros te dão descontos especiais em delivery."
					})}
				</View>
				<View style={styles.flexMiddle}>
					{swiperContainer({
						image: require('../assets/onboarding/desconto.png'),
						title: "Como ganhar o desconto",
						subtitle: "Na hora da conta, seja no restaurante ou na entrega do delivery é sempre igual, basta informar que você é associado Rota Gourmet. Entre no aplicativo e clique no restaurante do momento, escolha a modalidade que está utilizando (acompanhado, individual ou delivery) e clique em UTILIZAR VOUCHER. Preencha os dados e escaneie o código fornecido pelo restaurante. PRONTO !"
					})}
					<Text style={ hideLastScreen ? styles.subtitleWhite : styles.subtitle}></Text>
				</View>
				{!hideLastScreen ? <View style={styles.flexMiddle}>
					{fim()}
				</View> : null}
			</Swiper>
		</View>
  );
}

const styles = StyleSheet.create({
	buttonText: {
		color: COLOR.SECONDARY,
		fontSize: 50,
	},
	activeDot:{
		backgroundColor: COLOR.SECONDARY,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3
	},
	dot:{
		backgroundColor: COLOR.GREY_WHITE,
		width: 6,
		height: 6,
		borderRadius: 4,
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3
	},
	flex1:{
		flex: 1
	},
	flexMiddle:{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	wholeContent: {
		flex: 1,
		backgroundColor: COLOR.BLACK
	},
	image01: {
		height: responsiveWidth(80),
		width: responsiveWidth(80),
	},
	imageFinal: {
		height: responsiveWidth(50),
		width: responsiveWidth(50),
		marginBottom: responsiveWidth(10)
	},
	nextLabel: {
		fontWeight: WEIGHT.FAT,
	},
	title: {
		color: COLOR.SECONDARY,
		marginHorizontal: 20,
		marginVertical: 20,
		justifyContent: 'center',
		alignItems: 'center',
		fontWeight: WEIGHT.MEDIUM,
		fontSize: FONT.XLARGE,
		textAlign: 'center'
	},
	subtitleWhite: {
		justifyContent: 'center',
		alignItems: 'center',
		color: COLOR.GREY,
		marginHorizontal: 20,
		fontSize: FONT.SMALL,
		textAlign: 'center'
	},
	subtitleWhite2: {
		justifyContent: 'center',
		alignItems: 'center',
		color: COLOR.GREY,
		paddingHorizontal: 10,
		fontSize: FONT.SMALL,
		textAlign: 'center'
	},
	subtitle: {
		justifyContent: 'center',
		alignItems: 'center',
		color: COLOR.WHITE,
		marginHorizontal: 20,
		fontSize: FONT.SMALL,
		textAlign: 'center'
	},
	btnLabelReenviar: {
		color: COLOR.PRIMARY,
		fontWeight: WEIGHT.FAT,
		fontSize: FONT.SMALL
	},
	containerEnd: {
		flex: 0.8, 
		width: '90%',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	containerEnd2: {
		flex: 1, 
		width: '90%',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	btnContainer: {
		backgroundColor: COLOR.PRIMARY,
		marginVertical:20,
		paddingVertical: 14,
		paddingHorizontal: 20,
		width: '100%',
		borderRadius: 6,
	},
	btnLabelFilled: {
		fontSize: FONT.SMALL,
		textAlign: 'center',
		color: COLOR.WHITE,
		fontWeight: WEIGHT.FAT
	},
});

export default OnboardingComponent;