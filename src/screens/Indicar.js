import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Image,
    Dimensions,
    StyleSheet,
    Text,
    RefreshControl,
    ScrollView,
    Clipboard,
    Linking,
    Share,
    TouchableOpacity
} from 'react-native';
import { useSelector } from 'react-redux';
import { getApi } from '../environments/config';
import Pageheader from '../components/Pageheader';
import Theme from '../constants/Theme';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import def_styles from '../assets/styles/theme.styles';
// CONST DECLARING
const { COLOR, FONT, WEIGHT } = Theme;
const server = getApi('api');
const { width, height } = Dimensions.get('window');

const Indicar = ({ navigation }) => {

    const [copy, setCopy] = useState(false);
    const [info, setInfo] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const userData = useSelector(state => state.AuthReducer.userData);
    const userToken = useSelector(state => state.AuthReducer.userToken);

    const shareToWhatsApp = () => {
        let text =  `Clica nesse link para ser redirecionado para a página de cupons: https://cupom.cluberotagourmet.com.br?${userData._id}`
        Linking.openURL(`whatsapp://send?text=${text}`);
    }

    const copyToClipboard = () => {
        Clipboard.setString(`https://cupom.cluberotagourmet.com.br?${userData._id}`);
        setCopy(true);
        setTimeout(() => {
            setCopy(false);
        }, 2000);
    }

    const share = async () => {
        try {
            const result = await Share.share({
                title: 'Rota Gourmet',
                message: 'Clica nesse link para ser redirecionado para a página de cupons.',
                url:`https://cupom.cluberotagourmet.com.br?${userData._id}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                // shared with activity type of result.activityType
                } else {
                // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    }

    useEffect(() => {
        list();
    },[]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
            setTimeout(() => {
                list();
            }, 1000);
    }, []);

    async function list(){
        //Requisição de Listar módulos de localização
        let response = await fetch(server.url + `indicar/list/${userData._id}`);
        response = await response.json();
        if(response.error){
            setRefreshing(false);
        }else{
            setRefreshing(false);
            setInfo(response)
        }
    }

    return (
        <View>
            <Pageheader 
                title={"INDIQUE E GANHE"} 
                navigation={navigation} 
                statusBarColor={'transparent'}
            />
            <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.scroll}>
                <Image 
                    source={require("../assets/perfil/indicar.png")} 
                    style={styles.topImage} 
                />
                <Text style={styles.regrasTxt}>{"• Indique o Rota para seus amigos e ganhe 15 dias no app pra cada amigo que usar!"} <Text style={{color: COLOR.PRIMARY}}>{"*máximo de 180 dias por usuário"}</Text> {"\n• Seu amigo ganhará 30 dias grátis no aplicativo."}</Text>
                {/* COMPARTILHE COM SEUS AMIGOS */}
                <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Compartilhar com os amigos</Text>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.box} onPress={shareToWhatsApp}>
                        <Image
                            source={require("../assets/perfil/Whatsapp.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.subtitle}>Whatsapp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box} onPress={copyToClipboard}>
                        <Image
                            source={copy ? require("../assets/perfil/Link-green.png") : require("../assets/perfil/Link.png")}
                            style={styles.icon}
                        />
                        <Text style={[styles.subtitle, {color: copy ? "#56c54e" : COLOR.GREY}]}>Copiar Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box} onPress={share}>
                        <Image
                            source={require("../assets/perfil/More.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.subtitle}>Outras opções</Text>
                    </TouchableOpacity>
                </View>
                <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Minhas Recompensas</Text>
                <View style={styles.content}>
                    <View style={styles.box}>
                        <Text style={styles.days}>{info.diasAprovado ? info.diasAprovado : 0}</Text>
                        <Text style={styles.subtitle}>Dias ganhos</Text>
                    </View>
                    <View style={styles.bar}/>
                    <View style={styles.box}>
                        <Text style={styles.days}>{info.diasPendentes ? info.diasPendentes : 0}</Text>
                        <Text style={styles.subtitle}>Dias pendentes</Text>
                    </View>
                </View>
                <Text style={[styles.label, def_styles.m_b_10, def_styles.m_t_20, def_styles.p_h_15]}>Dias Utilizados</Text>
                <View style={styles.content}>
                    {/* <View style={styles.box}>
                        <Text style={styles.subtitle}>Você já usou</Text>
                        <Text style={styles.days}>{info.diasAprovado ? info.dias : 0}</Text>
                        <Text style={styles.subtitle}>Dias</Text>
                    </View> */}
                    {/* <View style={styles.bar}/> */}
                    <View style={styles.box}>
                        <Text style={styles.subtitle}>Você ainda tem</Text>
                        <Text style={styles.days}>{info.diasAprovado ? info.dias : "0"}</Text>
                        <Text style={styles.subtitle}>Dias</Text>
                    </View>
                </View>
                
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    iconContent:{
        flex: 1
    },
    icon:{
        width: responsiveHeight(5.2),
        height: responsiveHeight(5.3)
    },
    scroll: {
        paddingBottom: 280
    },

    subtitle: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.THIN,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: FONT.XSMALL
    },
    days:{
        color: COLOR.SECONDARY,
        fontSize: FONT.XXLARGE,
        fontWeight: WEIGHT.FAT
    },
    content: {
        backgroundColor: COLOR.WHITE,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        paddingVertical: 10, 
        paddingHorizontal: 10 , 
        marginHorizontal: 15 ,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
    },
    box: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20
    },
    bar:{
        backgroundColor: COLOR.SECONDARY,
        width: 1,
        height: "100%"
    },
    label: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMEDIUM,
    },
    topImage: {
        width,
        height: responsiveHeight(22)
    },
    regrasTxt: {
        fontSize: FONT.XSMALL,
        color: COLOR.GREY,
        padding: 20,
        textAlign: "center"
    }
})

export default Indicar;