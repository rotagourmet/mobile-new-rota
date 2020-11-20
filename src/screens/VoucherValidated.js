import React, { useState, useEffect } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ActivityIndicator,
    AsyncStorage
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
// LOCAL IMPORTS
import Theme from '../constants/Theme';
import { getApi } from '../environments/config'
import Events from '../utils/Events';
import def_styles from '../assets/styles/theme.styles'
// CONSTS DECLARING
const { COLOR, FONT, WEIGHT } = Theme;
const server = getApi('api');
moment.locale('pt-BR');

const VoucherValidated = ({navigation}) => {

    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch();
    const userData = useSelector(state => state.AuthReducer.userData);
    const userToken = useSelector(state => state.AuthReducer.userToken);
    const currentRestaurant = useSelector(state => state.InfoReducer.currentRestaurant);
    const voucherInfo = useSelector(state => state.InfoReducer.voucherInfo);
    const modeloNegocio = useSelector(state => state.InfoReducer.modeloNegocio);

    useEffect(() => {
        Events.publish("OpacityBottomTabFalse");
        sendReq();
    }, [])

    const sendReq = async () => {
        //Requisição de Salvar uso de Voucher
        let form = {
            unidade: currentRestaurant._id,
            restaurante: currentRestaurant.restaurante._id,
            cidade: currentRestaurant.address.cidade,
            codigo: currentRestaurant.qrcode,
            incluidoPor: userData._id,
            modeloNegocio: modeloNegocio,
            ...voucherInfo
        }
        let response = await fetch(server.url + `api/voucher/create?token=${userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        });
        response = await response.json();
        if (!response.error) {
            dispatch({type: 'STORAGE_VOUCHERS', vouchers: response });
            AsyncStorage.setItem("vouchers", JSON.stringify(response))
        }
    };
    

    const formatDate = date => {
        let dia = moment(date).format("DD")
        let mes = moment(date).format("MMMM")
        let ano = moment(date).format("YYYY")
        let hora = moment(date).format("HH")
        let minuto = moment(date).format("mm")
        let total = dia + " de " + mes + " de " + ano + " • " + hora + ":" + minuto;
        return total;
    }
       
    return(
        <View style={[styles.flex1, def_styles.padding_20, {backgroundColor: 'white'}]}>
            <View style={[styles.flex1, def_styles.align_items_center]}>
                <View style={[def_styles.justify_content_center, {flex: 1}]} >
                    <View style={[def_styles.justify_content_center, def_styles.align_items_center, styles.restauranteBoxImage]}>
                        <Image 
                         style={styles.imgSize} 
                         source={require('../assets/icons/qr_code-vali.png')}/>
                    </View>
                    <Text style={[styles.txtTitle, def_styles.p_t_10]}>Voucher validado com sucesso</Text>
                    {/* RESTAURANTE */}
                    <View style={[def_styles.flexRow, def_styles.align_items_center, def_styles.p_t_20, ]}>
                        <View style={styles.restauranteBoxImage}>
                            <Image 
                                style={styles.imgRest} 
                                source={{uri: currentRestaurant.restaurante.logo}}/>
                        </View>
                        <View style={def_styles.m_l_10}>
                            <Text style={styles.nomeRest}>{currentRestaurant.nomeUnidade}</Text>
                            <Text style={styles.dataRest}>{formatDate(new Date())}</Text>
                        </View>
                    </View>
                    <Text style={[def_styles.m_t_20, def_styles.m_b_10, styles.datasFonts]}>Código: {currentRestaurant.qrcode}</Text>
                    <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                        <Text style={styles.datasFonts}>Valor da conta sem desconto</Text>
                        <Text style={styles.datasFonts}>R$ {voucherInfo.valorSemDesconto.replace(".", ",")}</Text>
                    </View>
                    <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                        <Text style={styles.datasFonts}>Pago com desconto</Text>
                        <Text style={styles.datasFonts}>R$ {voucherInfo.valorComDesconto.replace(".", ",")}</Text>
                    </View>
                    <View style={[def_styles.flexRow, def_styles.justify_content_between]}>
                        <Text style={styles.datasEconomia}>Desconto</Text>
                        <Text style={styles.datasEconomia}>R$ {voucherInfo.valorEconomizado.replace(".", ",")}</Text>
                    </View>
                </View>
            </View>
            <View style={{flex: 0.3}}>
                <TouchableOpacity 
                    style={styles.mainBtn} 
                    onPress={() => { setLoading(true); navigation.navigate("Home"); Events.publish("OpacityBottomTabTrue"); Events.publish("LoadVouchers")}}>
                    {loading ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={styles.mainBtnLabel}>FINALIZAR</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
    
}

const styles = StyleSheet.create({
    imgSize: {
        height: 220, 
        width: 280
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
        marginHorizontal: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
    }, 
    restauranteBoxImage: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.26,
        shadowRadius: 3.18,
        elevation: 4,
    },
    txtTitle: {
        fontSize: FONT.MEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY,
        textAlign: 'center'
    },
    datasEconomia: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.FAT,
        color: 'green',
        paddingTop: 5
    },
    datasFonts: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY,
        paddingTop: 5
    },
    dataRest: {
        fontSize: FONT.LABEL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY
    },
    nomeRest: {
        fontSize: FONT.SMALL,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY
    },
    imgRest: {
        height: 60, 
        width: 60, 
        borderRadius: 50
    },
    flex1: {
        flex: 1,
    }
});


const mapStateToProps = store => ({
    userData: store.AuthReducer.userData,
    userToken: store.AuthReducer.userToken,
    currentRestaurant: store.InfoReducer.currentRestaurant,
    voucherInfo: store.InfoReducer.voucherInfo,
    modeloNegocio: store.InfoReducer.modeloNegocio,
});

export default VoucherValidated;