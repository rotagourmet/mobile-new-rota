import React, { useState } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Linking, 
    TouchableOpacity, 
    Dimensions, 
    Platform 
} from 'react-native';
import MapView from 'react-native-maps';
import * as WebBrowser from 'expo-web-browser';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
const { COLOR, FONT, WEIGHT } = Theme;

const Informacoes = ({ restaurant, map }) => {

    const [markers, setMarkers] = useState([]);
    const [latitude, setLatitude] = useState(map.latitude);
    const [longitude, setLongitude] = useState(map.longitude);
    const [loading, setLoading] = useState(true);

    const trimText = (txt) => {
        if (txt) {
            txt = txt.trim();
            return txt;
        }
    }

    const trataTel = (ph) => {
        return `tel:${ph.replace(/\D/g, '')}`;
    }
    
    const chamaWhatsApp = (phone) => {
        let text = `Olá, meu nome é ${props.userData.name}. Faço parte do Clube Rota Gourmet, `
        console.log('phone', phone, text);
        phone = phone.replace(/\D/g, '');
        phone = `55${phone}`
        const urlWhatsapp = Platform.OS === 'ios' ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?phone=${phone}&text=${text}`;
        Linking.openURL(urlWhatsapp);
    }
    
    return(
        <View style={styles.content}>
            <View style={[styles.flexRow,{ paddingTop: 25,}]}>
                <Text style={styles.title}>{trimText(restaurant.restaurante.descricao)}</Text>
            </View>
            {restaurant.website ?
                <TouchableOpacity style={[styles.flexRow,{ paddingTop: 25,}]} onPress={() => {WebBrowser.openBrowserAsync('https://' + restaurant.website)}}>
                    <Image source={require('../assets/icons/www_b.png')} style={styles.iconsize}/>
                    <Text style={styles.infosLabel}>{restaurant.website}</Text>
                </TouchableOpacity>
            : null}
            {restaurant.telefone ? 
                <View style={[styles.flexRow,{ paddingTop: 25,}]}>
                    <Image source={require('../assets/restaurante/phone_g.png')} style={styles.iconsize}/>
                    <Text style={styles.infosLabel}>{restaurant.telefone}</Text>
                </View>
            : null}
            
            { restaurant.telefone || restaurant.celular ? 
            <TouchableOpacity style={[styles.btnChooseCity]} onPress={() => restaurant.celular ? chamaWhatsApp(restaurant.celular) : Linking.openURL(trataTel(restaurant.telefone)) } >
                <Text style={styles.withoutNetBtnLabel}>{restaurant.celular ? "CHAMAR NO WHATSAPP" : "LIGAR AGORA"}</Text>
            </TouchableOpacity>
            : null}
            {map && map.url ? 
            <TouchableOpacity onPress={() => Linking.openURL(map.url)} style={styles.flexRow}>
                <Image source={require('../assets/restaurante/placeholder_g.png')} style={{height: 14, width: 10}}/>
                <Text style={styles.infosLabel}><Text style={def_styles.weight_fat}>Endereço:</Text> {map.url.split("=")[1]}</Text>
            </TouchableOpacity>
            : null}
            <View style={styles.container} onPress={() => Linking.openURL(map.url)}>
                {latitude && longitude ? 
                <MapView
                scrollEnabled={false}
                showsUserLocation={true}
                initialRegion={{
                    latitude: latitude ? latitude : -18.9080151,
                    longitude: longitude ? longitude : -48.2683914,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009
                }} 
                region={{
                    latitude: latitude ? latitude : -18.9080151,
                    longitude: longitude ? longitude : -48.2683914,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009
                }} 
                style={styles.mapStyle} >
                {loading ? null : 

                    <MapView.Marker
                        coordinate={{
                            latitude: latitude ? latitude : -18.9080151,
                            longitude: longitude ? longitude : -48.2683914
                        }}
                        title={restaurant.nomeUnidade}
                        description={restaurant.restaurante.descricao}
                    />
                    }
                </MapView>
                : null}
            </View>
            {latitude && longitude ? 
            <TouchableOpacity style={[styles.btnChooseCity]} onPress={() => Linking.openURL(map.url)}>
                <Text style={styles.withoutNetBtnLabel}>ABRIR NO MAPA</Text>
            </TouchableOpacity>
            : null}
        </View>      
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 30,
        justifyContent: 'center',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height/3,
    },
    withoutNetBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },

    btnChooseCity: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        marginVertical:25,
        paddingVertical: 14,
        paddingHorizontal: 35
    },
    contentDiasSemana: {
        paddingTop: 15,
    },
    diasSemana:{
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,

    },
    title: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY,
        lineHeight: 16,
        textAlign: 'center'
        // paddingTop: 10,
    },
    infosLabel: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,
        color: COLOR.GREY,
        lineHeight: 16,
        paddingLeft: 16,
        // paddingTop: 10,
    },
    iconsize: {
        height: 15, 
        width: 15,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        
    },
    content: {
        flex: 1, 
        paddingHorizontal: 25,
        paddingBottom: 85,
    },
});

export default Informacoes;
