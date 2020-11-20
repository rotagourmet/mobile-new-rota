import React, { useState } from 'react';
import { 
	View, 
	StyleSheet, 
	Animated 
} from 'react-native';
import { useSelector } from 'react-redux'
import VoucherInstructions from '../components/VoucherInstructions';
import VoucherDetails from '../components/VoucherDetails';

const Voucher = ({navigation}) => {
  
	const [validarVoucher, setValidarVoucher] = useState(false);
	const modeloNegocio = useSelector(state => state.InfoReducer.modeloNegocio);

	return (
		<View style={styles.flex1}>
		 	{modeloNegocio === "Delivery" && !validarVoucher ? 
			 	<VoucherInstructions 
				 	navigation={navigation} 
					close={() => setValidarVoucher(!validarVoucher)}/> 
				: 
				<VoucherDetails 
					navigation={navigation}
					close={() => setValidarVoucher(!validarVoucher)}
				/>
			}
		</View>
  );
}

const styles = StyleSheet.create({
	flex1: {
		flex: 1
	}
});

export default Voucher;