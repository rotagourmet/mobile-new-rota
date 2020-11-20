import React, { useState } from 'react';
import { 
	View,
	StyleSheet,
	ScrollView,
	Image,
	Text,
	TouchableOpacity,
	Linking,
	Platform
} from 'react-native';
import { useSelector } from 'react-redux'
import { responsiveWidth } from 'react-native-responsive-dimensions';
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import Pageheader from './Pageheader'
// CONSTS DECLARING
const { COLOR, FONT, WEIGHT } = Theme;

const VoucherInstructions = ({navigation, close}) => {

	const userData = useSelector(state => state.AuthReducer.userData);
	const currentRestaurant = useSelector(state => state.InfoReducer.currentRestaurant);
	// [validarVoucher, setValidarVoucher] = useState(validarVoucher)
	const trataTel = (ph) => {
		return `tel:${ph.replace(/\D/g, '')}`;
	}

	const chamaWhatsApp = (phone) => {
		let text = `Olá, meu nome é ${userData.name}. Faço parte do Clube Rota Gourmet,`
		phone = phone.replace(/\D/g, '');
		phone = `55${phone}`
		const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
		Linking.openURL(urlWhatsapp);
	}

	const firstStepAction = () => {
		close();
	}

  return (
		<View style={styles.flex1}>
			<Pageheader 
				title={"DELIVERY"} 
				navigation={navigation} 
				statusBarColor={'transparent'} 
			/>
			<ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
				<View style={styles.flexMiddle}>
					<Image 
						source={require('../assets/restaurante/pedir.png')} 
						style={styles.imgPedir}/>
					<View style={styles.contentTitles}>
						<Text style={styles.specialNmber}>1</Text>
						<View>
							<Text style={styles.titleDelivery}>Faça seu Pedido</Text>
							<Text style={styles.subTitleDelivery}>entre em contato com o restaurante</Text>
						</View>
					</View>
					<View style={styles.flexRow}>
					{currentRestaurant.celular ?
						<View style={{flex: 1}}>
							<TouchableOpacity 
								style={[styles.mainBtn, {marginHorizontal: 5,}]} 
								onPress={() => chamaWhatsApp(currentRestaurant.celular)}>
								<Text style={styles.mainBtnLabel}>WHATSAPP</Text>
							</TouchableOpacity>
						</View>
					: null}
					{currentRestaurant.telefone ?
						<View style={{ flex: 1}}>
							<TouchableOpacity 
								style={[styles.mainBtn, {marginHorizontal: 5,}]} 
								onPress={() => Linking.openURL(trataTel(currentRestaurant.telefone))}>
								<Text style={styles.mainBtnLabel}>TELEFONAR</Text>
							</TouchableOpacity>
						</View>
					:null}
					</View>
					<Image 
						source={require('../assets/restaurante/scooter_2.png')} 
						style={styles.section}/>
					<View style={styles.contentTitles}>
						<Text style={styles.specialNmber}>2</Text>
						<View>
							<Text style={styles.titleDelivery}>Espere seu Pedido chegar</Text>
							<Text style={styles.subTitleDelivery}>ligue para o Restaurante caso atrase</Text>
						</View>
					</View>
					<Image 
						source={require('../assets/restaurante/qrcode.png')} 
						style={styles.section}/>
					<View style={styles.contentTitles}>
						<Text style={styles.specialNmber}>3</Text>
						<View>
							<Text style={styles.titleDelivery}>Valide seu Voucher</Text>
							<Text style={styles.subTitleDelivery}>{"quando o pedido chegar, valide o Voucher\nno nosso app e depois pague seu pedido"}</Text>
						</View>
					</View>
					<View style={styles.btnContainer}>
						<TouchableOpacity 
							style={[styles.mainBtn, {marginHorizontal: 25,}]} 
							onPress={close}>
							<Text style={styles.mainBtnLabel}>UTILIZAR VOUCHER</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
  );
}
const styles = StyleSheet.create({
	flexRow: {
		flexDirection: 'row'
	},
	flex1: {
		flex: 1
	},
	imgPedir: { 
		marginTop: 10, 
		height: responsiveWidth(42), 
		width: responsiveWidth(42)
	},
	section: { 
		marginTop: 40, 
		height: responsiveWidth(35), 
		width: responsiveWidth(35)
	},
	btnContainer: {
		width: '100%', 
		paddingTop: 20
	},
	contentTitles: {
			flexDirection: 'row', 
			alignItems: 'center', 
			justifyContent: 'center', 
			paddingTop: 20
	},
	subTitleDelivery: {
			fontWeight: WEIGHT.THIN,
			fontSize: FONT.XSMALL,
			color: COLOR.GREY,
	},
	titleDelivery: {
			fontSize: FONT.MEDIUM,
			fontWeight: WEIGHT.FAT,
			color: COLOR.GREY,
	},
	specialNmber: {
			fontSize: FONT.XXXLARGE,
			fontWeight: WEIGHT.FAT,
			color: COLOR.SECONDARY,
			paddingRight: 10
	},
	flexMiddle: {
			paddingHorizontal: 20,
			width: '100%',
			justifyContent: 'center',
			alignItems: 'center'
	},
	contentContainer: {
			paddingBottom: 250,    
	},
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
	title: {
			fontSize: FONT.SMEDIUM,
			textAlign: 'center',
			color: COLOR.GREY,
			paddingTop: 10,
			fontWeight: WEIGHT.FAT
	}
});
export default VoucherInstructions;