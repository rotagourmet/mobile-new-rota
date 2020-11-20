import React, { useState, useEffect }  from 'react';
import { 
    View,
    TouchableOpacity,
    Text,
    AsyncStorage,
    StyleSheet
} from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import LottieView from "lottie-react-native";
import Theme from '../constants/Theme';
const { COLOR, FONT, WEIGHT } = Theme;

const PopupVouchers = ({close}) => {

    const userData = useSelector(state => state.AuthReducer.userData);
    const [number, setnumber] = useState(0)

    useEffect(() => {
        let user = userData;
        if(user)
            setnumber(user.voucher.number)
    
    }, [])

    function setStorage() {
        AsyncStorage.setItem("modalVoucherRegistered", "true");
        close();
    }
    return (
        <View style={styles.component}>
            <View style={styles.wholeContent}>
                <View style={{flex: 1}}>
                    <View style={styles.animationContainer}>
                        <LottieView
                            loop={true}
                            autoPlay={true}
                            style={styles.locationImage}
                            source={require('../assets/animations/voucher_animation.json')}
                        />
                    </View>
                    <Text style={styles.title}>SURPRESA!</Text>
                    <Text style={styles.subtitle}>Você ganhou {number === "FREE" ? "ilimitados vouchers" :`${number} vouchers grátis`}, para experimentar o Rota Gourmet onde quiser.</Text>
                    <TouchableOpacity style={styles.mainBtn} onPress={setStorage}>
                        <Text style={styles.mainBtnLabel} >OK</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    title:{
		fontSize: FONT.LARGE,
        color: COLOR.GREY,
        textAlign: "center",
        fontWeight: WEIGHT.FAT,

    },
    subtitle:{
		fontSize: FONT.SMALL,
        color: COLOR.GREY,
        textAlign: "center",
        fontWeight: WEIGHT.THIN,
        paddingVertical: 10
    },
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
		paddingHorizontal: 20,
        backgroundColor: COLOR.SECONDARY
	},    

    component: { 
        position: 'absolute', 
        zIndex: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        top: 0, 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: "rgba(0,0,0,0.5)" 
    },

    wholeContent: { 
        height: responsiveWidth(95),
        width: responsiveWidth(80), 
        justifyContent: 'center', 
        alignItems: 'stretch', 
        backgroundColor: 'white', 
        borderRadius: 0, 
        borderRadius: 10,
    },
    btnText: { 
        color: COLOR.GREY, 
        fontWeight: WEIGHT.FAT, 
        fontSize: responsiveFontSize(2.3)
    },

    flex:{
		borderTopWidth: 0.4,
		paddingBottom: 25,
		backgroundColor: COLOR.WHITE,
		borderTopColor: COLOR.GREY_WHITE,
	},
    
    locationImage: {
        // marginVertical: responsiveHeight(4),
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(20),
        width: responsiveHeight(20),
    },

    animationContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1, 
    }
})

export default PopupVouchers;