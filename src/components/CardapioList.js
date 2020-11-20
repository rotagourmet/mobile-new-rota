import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Animated, ActivityIndicator  } from 'react-native';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
export default class CardapioList extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            restaurant: null
        }
    }

    async componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            await Promise.all(this.props.restaurant.cardapio.map( (item, index) => {
                    this.setState({
                        ["foodImgOpacity_" + item._id]: new Animated.Value(0),
                    })
            }));
            this.setState({
                restaurant: this.props.restaurant,
                cardapio: this.props.restaurant && this.props.restaurant.cardapio
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    trimText(txt){
        txt = txt.trim();
        return txt;
    }

    diasDeAceitacao(res){
        res = res.split('. ');
        return res.map((item, index) => (
            <Text key={index} style={styles.diasSemana}>• {item}</Text> 
        ))
    }

    onLoad(event){
        if (event) {
            Animated.timing(this.state[event], {
                toValue: 1,
                duration: 800,
                useNativeDriver: false
            }).start();
        } else {
            
        }
    }

    handleLazyLoadComerAgora = ({ viewableItems }) => {
        const newData = this.state.cardapio.map(image =>
            
            viewableItems.find(({ item }) => item._id === image._id) ? { ...image, loaded: true } : image

        );
        this.setState({ cardapio: newData  });
    }

    render(){
        let { restaurant } = this.state;
        if (restaurant && restaurant.cardapio && restaurant.cardapio.length > 0) {
            return(
                <View style={styles.content}>
                    <View style={{backgroundColor: COLOR.PRIMARY}}>
                        <Text style={[styles.txtObs, {color: COLOR.WHITE}]}>{'*Não é possível fazer pedidos pelo nosso app \n**Os preços dos itens podem variar'}</Text>
                    </View>
                    <FlatList 
                        data={this.state.cardapio}
                        scrollEnabled={false}
                        contentContainerStyle={{paddingBottom: 120, }}
                        keyExtractor={( item, index ) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={this.handleLazyLoadComerAgora}
                        onEndReachedThreshold={.7}
                        renderItem={({ item, index }) => {
                        return (
                            <View key={index} style={styles.contentItemRestaurante}>
                                <View style={styles.contentItem}>
                                    <View style={styles.sombraPadrao}>
                                        <View style={{position: 'absolute',}}>
                                            <ActivityIndicator size="small" style={styles.activityImage} color={COLOR.WHITE}/>
                                            <Image
                                                style={styles.comerAgoraBoxImage}
                                                source={require('../assets/images/placeholder.png')}
                                            />
                                        </View>
                                        <Animated.Image onLoad={() => this.onLoad(`foodImgOpacity_${item._id}`)} source={item.foto ? {uri: item.foto} : require('../assets/icons/foto_cardapio.jpg')} style={[styles.comerAgoraBoxImage, {opacity: this.state["foodImgOpacity_" + item._id]}]} />
                                       
                                    </View>
                                    <View style={styles.internoItemRestaurante}>
                                            <View style={styles.flexRowRestaurante}>
                                                <Text style={styles.nameRestaurant}>{item.title && item.title.trim()}</Text>
                                            </View>
                                            
                                            <View style={styles.flexRowRestaurante}>
                                                <Text style={styles.detailsRestaurante}>{item.description && item.description.trim()}</Text>
                                            </View>
                                        <View s>
                                            <Text style={[styles.letrasDias, {color: COLOR.GREY }]}>{item.price}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}}
                    />
                </View>
            )
        } else{
            return (
                <View style={styles.content}>
                    <Text style={[styles.txtObs, {color: COLOR.GREY_WHITE}]}>Este restaurante não possui nenhum item de cardápio cadastrado</Text>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    
    comerAgoraBoxImage: {
        paddingLeft: 10,
        height: 75,
        width: 75,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderRadius: 5,
        zIndex: 15
    },
    sombraPadrao: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.36,
        shadowRadius: 4.68,
        elevation: 11,
    },
    activityImage: {
        position: 'absolute', 
        top: '36%', 
        left: '36%', 
        zIndex: 16
    },
    // RESTAURANTES LIST
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    contentItem: {
        paddingHorizontal: 5, 
        flexDirection: 'row',
        width: '100%',
        
    },
    iconModalidade: {
        height: 18,
        width: 18,
        // flex: 1
    },
    flexRowRestaurante: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    letrasDias: {
        fontWeight: WEIGHT.FAT,
        paddingRight: 5,
        textAlign: 'right',
        // paddingRight: 100,
    },
    nameRestaurant:{
        paddingBottom: 5,
        fontSize: FONT.SMALL,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
    },
    detailsRestaurante: {
        fontSize: FONT.LABEL,
        paddingBottom: 5,
        color: COLOR.GREY,
        fontWeight: WEIGHT.THIN,
        alignSelf: 'stretch',
        // flexDirection: 'row', 
        flexWrap: 'wrap', 
        alignItems: 'stretch',
    },
    internoItemRestaurante: {
        paddingLeft: responsiveHeight(1.5),
        paddingRight: 10,
        paddingBottom: 5,
        flex: 3.5
    },
    restauranteBoxImage: {
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.16,
        shadowRadius: 3.18,
        elevation: 4,
    },
    restauranteImage: {
        height: 75,
        width: 75,
        backgroundColor: 'white',
        borderRadius: 5,
        zIndex: 12
    },    
    contentItemRestaurante: {
        // marginBottom: 15,
        borderRadius: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        marginHorizontal: 5,
        paddingVertical: 10,
        borderBottomColor: COLOR.GREY_WHITE,
        borderBottomWidth: 0.7
    },


    txtObs: {
        textAlign: 'center',
        fontSize: 13,
        padding: 12,
        paddingHorizontal: 14,
    },
    contentDiasSemana: {
        paddingTop: 15,
    },
    diasSemana:{
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,

    },
    title: {
        fontSize: FONT.SMEDIUM,
        fontWeight: WEIGHT.MEDIUM,
        paddingLeft: 10,
        lineHeight: 16,
        color: COLOR.GREY,
        // paddingTop: 10,
    },
    subtitle: {
        fontSize: FONT.XSMALL,
        fontWeight: WEIGHT.THIN,
        paddingLeft: 10,
        lineHeight: 16,
        color: COLOR.GREY
        // paddingTop: 10,
    },
    iconsize: {
        height: 15, 
        width: 15,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 25,
        borderBottomWidth: 0.5,
        borderBottomColor: COLOR.GREY_WHITE,
        paddingHorizontal: 15,
        paddingBottom: 15
    },
    content: {
        flex: 1, 
    },
});