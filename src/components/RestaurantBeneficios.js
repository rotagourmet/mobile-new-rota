import React, { useEffect, useState } from 'react'; 
import { 
	View, 
	Text, 
	StyleSheet, 
	Image
} from 'react-native';
import { useSelector } from 'react-redux';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'

const { COLOR, FONT, WEIGHT } = Theme;
const server = getApi('api');

const Beneficios = ({restaurant}) => {
	
	const [intervalos, setIntervalos] = useState([])

	const mdn = useSelector(state => state.InfoReducer.modeloNegocio);
	const userToken = useSelector(state => state.AuthReducer.userToken);

	useEffect(() => {
		intervalosFn();
	}, []);

	async function intervalosFn() {
		//Requisição de listar intervalos
		let response = await fetch(server.url + `api/intervalos/list?token=${userToken}`);
		response = await response.json();
		if(response.error){
		}else{
			setIntervalos(response.dados)
		}
	}


	const intervalosText = (restaurant) => {
		let index = 0
		if(mdn === "Acompanhado"){
			index = 0
		}else if(mdn === "Individual"){
			index = 1
		}else{
			index = 2
		}
		let intervaloUtilizado = intervalos.filter((res) => res._id === restaurant.modeloNegocio[index].intervaloUtilizacao)
		if(intervaloUtilizado && !intervaloUtilizado[0]){
			intervaloUtilizado = [intervalos[0]]
		}
		return(
			<Text style={[styles.diasSemana]}>{intervaloUtilizado && intervaloUtilizado[0] && intervaloUtilizado[0].nome}</Text>
		)
	}

	if (restaurant) {
		return(
			<View style={styles.content}>
				<View style={styles.containerMdn}>
					<Image
					style={styles.iconMdn}
					 source={
						 mdn === "Acompanhado" ? require('../assets/restaurante/couple.png') : 
						 mdn === "Individual" ? require('../assets/restaurante/individual.png') : 
						 require('../assets/restaurante/scooter.png')}
						/>
					<Text style={styles.mdnText}>{mdn}</Text>
				</View>
				<View style={styles.flexRow}>
					<Image source={require('../assets/restaurante/gift.png')} style={styles.iconsize}/>
					<Text style={styles.title}>{mdn === "Acompanhado" ? restaurant.modeloNegocio[0].beneficio : mdn === "Individual" ? restaurant.modeloNegocio[1].beneficio : restaurant.modeloNegocio[2].beneficio}</Text>
				</View>
				{intervalos && intervalos.length ?
				 <View style={styles.flexRow}>
					<Image source={require('../assets/restaurante/intervalo.png')} style={styles.iconsize}/>
					<Text style={[styles.title]}>Intervalo de Utilização: </Text>
					{intervalosText(restaurant)}

				</View> : null}
				<View style={styles.flexRow}>
					<Image source={require('../assets/restaurante/clock.png')} style={styles.iconsize}/>
					<Text style={[styles.title, def_styles.weight_fat]}>Dias e Horários de Aceitação</Text>
				</View>
				<View style={styles.contentDiasSemana}>
					<Text style={styles.diasSemana}>{restaurant.horarioFuncionamento}</Text> 
				</View>
				<View style={styles.flexRow}>
					<Image source={require('../assets/restaurante/regras.png')} style={styles.iconsize}/>
					<Text style={[styles.title, def_styles.weight_fat]}>Regras</Text>
				</View>
				<View style={styles.contentDiasSemana}>
					<Text style={[styles.diasSemana, def_styles.weight_fat]}>{mdn === "Acompanhado" ? restaurant.modeloNegocio[0].regulamento : mdn === "Individual" ? restaurant.modeloNegocio[1].regulamento : restaurant.modeloNegocio[2].regulamento}</Text>
				</View>
			</View>
		);
	} else {
		return <View/>
	}
}

const styles = StyleSheet.create({
	iconMdn: {
		height: 22,
		width: 22,
		marginRight: 10,
		marginTop: 3
	},
	containerMdn:{
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		// marginTop: 10,
		paddingVertical: 12,
		backgroundColor: COLOR.BACKGROUND
	},
	mdnText: {
		fontSize: FONT.SMEDIUM,
		color: COLOR.SECONDARY,
		textAlign: 'center',
		fontWeight: WEIGHT.FAT,
	},
	contentDiasSemana: {
		paddingTop: 15,
		paddingHorizontal: 25
	},
	diasSemana:{
		fontSize: FONT.XSMALL,
		color: COLOR.GREY,
		fontWeight: WEIGHT.THIN,
		lineHeight: 20
	},
	title: {
		fontSize: FONT.XSMALL,
		fontWeight: WEIGHT.THIN,
		paddingLeft: 10,
		lineHeight: 16,
		color: COLOR.GREY
	},
	iconsize: {
		height: 15, 
		width: 15,
	},
	flexRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 25,
		paddingHorizontal: 25,
	},
	content: {
		flex: 1, 
		
	},
});

export default Beneficios;
