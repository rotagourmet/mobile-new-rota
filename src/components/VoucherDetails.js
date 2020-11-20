import React, { useState, useRef } from 'react';
import { 
	View,
	Text,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
	Animated,
	ActivityIndicator,
	Keyboard
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { Icon, CheckBox } from 'react-native-elements'
import { TextInputMask } from 'react-native-masked-text';
import Toast from 'react-native-easy-toast';
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import def_styles from '../assets/styles/theme.styles'
import Pageheader from './Pageheader'
// CONSTS DECLARING
const { COLOR, FONT, WEIGHT } = Theme;

const VoucherDetails = ({navigation, close}) => {
	const [fadeEconomizado, setFadeEconomizado] = useState( new Animated.Value(0) );
	const [choosed, setChoosed] = useState('');
	const [valorSemDesconto, setValorSemDesconto] = useState('');
	const [errorValorSemDescontoMessage, setErrorValorSemDescontoMessage] = useState(null);
	const [valorComDesconto, setValorComDesconto] = useState('');
	const [errorValorComDescontoMessage, setErrorValorComDescontoMessage] = useState(null);
	const [valorEconomizado, setValorEconomizado] = useState('');
	const [next, setNext] = useState(false);
	const [loading, setLoading] = useState(false);
	
	const vcdRef = useRef(null);
	
	const dispatch = useDispatch();
	const modeloNegocio = useSelector(state => state.InfoReducer.modeloNegocio);

	const fadeInEconomizado = () => {
		Animated.timing(
			fadeEconomizado, { 
				toValue: 1, 
				duration: 500,
				useNativeDriver: false
			}
		).start();
	}

  const fadeOutEconomizado = () => {
		Animated.timing( 
			fadeEconomizado, {
				toValue: 0, 
				duration: 500,
				useNativeDriver: false
			}
		).start();
	}

  const handleTextValorComDesconto = (text) => {
		if(valorSemDesconto && valorComDesconto > valorSemDesconto){
			setErrorValorComDescontoMessage("Valor com desconto não pode ser maior que o valor sem desconto")
			setNext(false)
		}else{
		}
		setErrorValorComDescontoMessage(null)
		setValorComDesconto(text)
		fadeOutEconomizado();
	}

	const verifyFields = () => {
		setLoading(true);
		Keyboard.dismiss();
		if(choosed && valorSemDesconto && valorComDesconto){
			let vcd = valorComDesconto.replace("R", '')
			vcd = vcd.replace("$", '')
			vcd = vcd.replace(" ", '')
			vcd = vcd.replace(".", '')
			vcd = vcd.replace(",", '.')
			
			let vsd = valorSemDesconto.replace("R", '')
			vsd = vsd.replace("$", '')
			vsd = vsd.replace(" ", '')
			vsd = vsd.replace(".", '')
			vsd = vsd.replace(",", '.')
			let valorEconomizado = (Number(vsd) - Number(vcd)).toFixed(2);
			let descontoPermitido = vsd * 0.5;

			if (Number(vsd) >= Number(vcd) && Number(vcd) >=  descontoPermitido) {
				setValorEconomizado((valorEconomizado).replace(".", ','));
				setNext(true);
				fadeInEconomizado();
				dispatch({type: 'STORAGE_VOUCHER_INFO', voucherInfo: {choosed: choosed, valorEconomizado, valorSemDesconto: vsd, valorComDesconto: vcd }});
				setTimeout(() => {
					setLoading(false);
					navigation.navigate("VoucherValidation");
				},1000);
			}else if(Number(vsd) < Number(vcd)) {
				setNext(false);
				setLoading(false);
				setErrorValorComDescontoMessage("Valor com desconto não pode ser maior que o valor sem desconto");
			}else if(Number(vcd) < descontoPermitido){
				setNext(false);
				setLoading(false);
				descontoPermitido = descontoPermitido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', minimumFractionDigits: 2})
				setErrorValorComDescontoMessage("Valor com desconto não pode ser menor do que " + descontoPermitido + ".");
			}
		} else if (!choosed) {
			setLoading(false);
		} else if (!valorSemDesconto){
			setLoading(false);
			setErrorValorSemDescontoMessage("Valor da Conta sem desconto é um campo obrigatório");
		} else if (!valorComDesconto){
			setLoading(false);
			setErrorValorComDescontoMessage("Valor da Conta com desconto é um campo obrigatório");
		}
	}

	const handleBackBtn = () => {
		if(modeloNegocio === "Delivery"){
			close()
		}else{
			navigation.goBack()
		}
	}

  return(
		<View style={{flex: 1}}>
			<ScrollView scrollEnabled={true} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
					<Pageheader 
							title={"VALIDAÇÃO"} 
							navigation={navigation} 
							statusBarColor={'transparent'}
							onPress={handleBackBtn}
					/>
					<KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: null, })}>
						<Text style={styles.title}>Já esteve nesse Estabelecimento?</Text>
						<View style={def_styles.padding_10}>
							<View style={[styles.txtInputContainer]}>
								<CheckBox
								textStyle={styles.textStyle}
								containerStyle={styles.contentCheckbox}
								title='Não'
								checkedIcon='dot-circle-o'
								uncheckedIcon='circle-o'
								checkedColor={COLOR.SECONDARY}
								checked={choosed === 'Não'}
								onPress={() => setChoosed('Não')}
								/>
							</View>
							<View style={[styles.txtInputContainer]}>
								<CheckBox
								textStyle={styles.textStyle}
								containerStyle={styles.contentCheckbox}
								title='Sim, nos últimos de 30 dias'
								checkedIcon='dot-circle-o'
								uncheckedIcon='circle-o'
								checkedColor={COLOR.SECONDARY}
								checked={choosed === 'Sim, nos últimos de 30 dias'}
								onPress={() => setChoosed('Sim, nos últimos de 30 dias')}
								/>
							</View>
							<View style={[styles.txtInputContainer]}>
								<CheckBox
								textStyle={styles.textStyle}
								containerStyle={styles.contentCheckbox}
								title='Sim, há mais de 30 dias'
								checkedIcon='dot-circle-o'
								uncheckedIcon='circle-o'
								checkedColor={COLOR.SECONDARY}
								checked={choosed === 'Sim, há mais de 30 dias'}
								onPress={() => setChoosed('Sim, há mais de 30 dias')}
								/>
							</View>
						</View>
						<View style={[def_styles.p_h_25]}>
							<Text style={styles.txtOutside}>Valor da Conta (sem desconto)</Text>
							<View style={styles.txtInputContainer2}>
								<TextInputMask 
									// ref={'valorSemDesconto'}
									type={'money'}
									style={[styles.txtInputContent, { color: errorValorSemDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
									placeholder={"R$ 0,00"}
									value={valorSemDesconto}
									onChangeText={(valorSemDesconto)=> { 
										setErrorValorSemDescontoMessage(false); 
										setValorSemDesconto(valorSemDesconto); 
										fadeOutEconomizado();
										setNext(false);
									}}
									placeholderTextColor={errorValorSemDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
								/>
							</View>
							{errorValorSemDescontoMessage ? <Text style={styles.labelError}>{errorValorSemDescontoMessage}</Text> : null }
							
							<Text style={styles.txtOutside}>Valor final da Conta (com desconto)</Text>
							<View style={styles.txtInputContainer2}>
								<TextInputMask 
									ref={vcdRef}
									type={'money'}
									style={[styles.txtInputContent, { color: errorValorComDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}]}
									placeholder={"R$ 0,00"}
									value={valorComDesconto}
									onChangeText={handleTextValorComDesconto}
									onSubmitEditing={verifyFields}
									placeholderTextColor={errorValorComDescontoMessage ? 'rgba(255, 0, 0, 0.6)' : COLOR.GREY}
								/>
							</View>
							{ errorValorComDescontoMessage ?  <Text style={styles.labelError}>{errorValorComDescontoMessage}</Text> :  null }
						</View>
					</KeyboardAvoidingView>
					<Animated.View style={[def_styles.d_flex_complete_center, {opacity: fadeEconomizado}]}>
						<Text style={styles.parabens}>Parabéns! Você economizou</Text>
						<Text style={styles.valorEconomizado}>R$ {valorEconomizado}</Text>
					</Animated.View>
					<TouchableOpacity style={[styles.mainBtn, {marginHorizontal: 25,}]} onPress={verifyFields}>
						{loading ? <ActivityIndicator size="small" color="#FFFFFF"/> :  <Text style={styles.mainBtnLabel}>{next ? 'PRÓXIMO' : 'VALIDAR'}</Text>}
					</TouchableOpacity>                    
			</ScrollView>
			{/* <Toast ref="toast" /> */}
	</View>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 250,    
	},
	valorEconomizado:{
		paddingTop: 15,
		color: COLOR.SECONDARY,
		fontSize: FONT.XXLARGE,
		textAlign: 'center',
		fontWeight: WEIGHT.FAT
	},
	parabens:{
		paddingTop: 15,
		color: COLOR.GREY,
		fontSize: FONT.MEDIUM,
		textAlign: 'center',
		fontWeight: WEIGHT.FAT
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
	txtOutside:{
		marginTop: 10,
		fontSize: FONT.LABEL,
		color: COLOR.GREY,
	},
	txtInputContent: {
		paddingHorizontal: 10,
		paddingVertical: 7,
		fontSize: FONT.MEDIUM,
		color: COLOR.GREY,
	},
	labelError: {
		color: 'red',
		paddingLeft: 5,
		paddingTop: 5,
		fontSize: FONT.LABEL
	},
	textStyle:{
		fontSize: FONT.XSMALL,
		fontWeight: '400'
	},
	contentCheckbox: {
		backgroundColor: 'transparent',
		borderWidth: 0,
		margin: 0
	},    
	txtInputContainer2: {
		marginTop: 5,
		justifyContent: 'space-between',
		backgroundColor: COLOR.WHITE,
		borderColor: COLOR.GREY_WHITE,
		borderWidth: 0.3,
		borderRadius: 6,
		padding: 5
	},
	txtInputContainer: {
		marginTop: 5,
		paddingHorizontal: 0,
		justifyContent: 'space-between',
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		borderWidth: 0.3,
		borderRadius: 6,
		padding: 0
	},
	title: {
		fontSize: FONT.SMEDIUM,
		textAlign: 'center',
		color: COLOR.GREY,
		paddingTop: 10,
		fontWeight: WEIGHT.FAT
	}
});

export default VoucherDetails;