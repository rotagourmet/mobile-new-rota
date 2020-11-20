import React, { useState, useEffect } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	TouchableOpacity, 
	Animated,
	Dimensions,
	Platform
} from 'react-native';
import { useSelector } from 'react-redux';
import Theme from '../constants/Theme';

const { COLOR, FONT, WEIGHT } = Theme;
const { height } = Dimensions.get('window')

export default function btnUtilizarVoucher({navigation, allow}) {

	const [state, setState] = useState({
		container: new Animated.Value(70),
		modal: new Animated.Value(70),
	});

	const mdn = useSelector(state => state.InfoReducer.modeloNegocio);

	const openModal = () => {
		Animated.sequence([
				Animated.timing(state.container, { toValue: 0, duration: 500, useNativeDriver: true }),
				Animated.spring(state.modal, { toValue: 300, bounciness: 5, useNativeDriver: true })
		]).start()
	};

	useEffect(() => {
		openModal()
	}, [state.container]);

	function isIphoneX () {
    const iphoneXLength = 812
    const iphoneXSMaxLength = 896
    const windowDimensions = Dimensions.get('window')
    return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTVOS &&
    (windowDimensions.width === iphoneXLength ||
      windowDimensions.height === iphoneXLength ||
      windowDimensions.width === iphoneXSMaxLength ||
      windowDimensions.height === iphoneXSMaxLength)
    )
  }

  const DimensionsStyle = {
    safeAreaBottomHeight: Platform.OS === 'ios' && isIphoneX() ? 75 : 0
  }

  return (
		<Animated.View style={[styles.container, { bottom: DimensionsStyle && (DimensionsStyle.safeAreaBottomHeight) ? DimensionsStyle.safeAreaBottomHeight : 35, transform: [ { translateY: state.container } ] }]}>
			<View style={styles.flex}>
				<TouchableOpacity 
					style={[styles.mainBtn, { backgroundColor: allow ? COLOR.SECONDARY : COLOR.PRIMARY_DISABLED }]} 
					onPress={() => allow ? navigation.navigate("Voucher") : null}>
					<Text style={styles.mainBtnLabel}>{mdn === "Delivery" ? "PEDIR" :"UTILIZAR VOUCHER"}</Text>
				</TouchableOpacity>
			</View>
		</Animated.View>
  );
};

const styles = StyleSheet.create({
	mainBtnLabel:{
		color: COLOR.WHITE,
		fontSize: FONT.SMALL,
		fontWeight: WEIGHT.FAT,
		textAlign: 'center',
	},
	mainBtn: {
		marginHorizontal: 25,
		borderRadius: 6,
		marginVertical:20,
		paddingVertical: 14,
		paddingHorizontal: 20
	},    
	container:{
		position: 'absolute',
		right: 0,
		left: 0,
		zIndex: 100
	},
	flex:{
		flex: 1,
		borderTopWidth: 0.4,
		paddingBottom: 25,
		backgroundColor: COLOR.WHITE,
		borderTopColor: COLOR.GREY_WHITE,
	}
});