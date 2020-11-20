import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { connect } from 'react-redux';

import Theme from '../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class RestaurantList extends Component {
    
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({
                restaurantes: this.props.appliedFilters
            })

        }
    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    novoTarja(data){
        const now = new Date(); // Data de hoje
        const past = new Date(data); // Outra data no passado
        const diff = Math.abs(now.getTime() - past.getTime()); // Subtrai uma data pela outra
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (days < 50) {  
            return(
                <Text style={[styles.detailsRestaurante, {color: COLOR.SECONDARY}]}>Novo!</Text>
            );
        }else{
            return null;
        }
    }

    render(){
        let { restaurantes } = this.state;
        return(
            <ScrollView ref='homeScroll' scrollEnabled={true} style={styles.flex1} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {restaurantes ?
                <View style={[styles.restauranteContentContainer1]}>
                    <Text style={styles.destaquesTitle}>Restaurantes</Text>
                    {restaurantes.map((item, index) => {
                    return (
                        <TouchableOpacity key={index} style={styles.contentItemRestaurante}>
                            <View style={styles.contentItem}>
                                <View style={styles.restauranteBoxImage}>
                                    <Image source={{uri: item.restaurante.logo}} style={styles.restauranteImage} />
                                </View>
                                <View style={styles.internoItemRestaurante}>
                                
                                <View style={{flex: 1}}>
                                    <Text style={styles.nameRestaurant}>{item.nomeUnidade}</Text>
                                    
                                    <View style={styles.flexRowRestaurante}>
                                        <Text style={styles.detailsRestaurante}>{item.culinariaPrincipal.nomeTipo + " • "+ item.distance}</Text>
                                        <Image style={styles.iconModalidade} source={require('../assets/icons/delivery.png')}/>
                                    </View>
                                    
                                    <View style={styles.iconsContainer}>
                                        <Image style={styles.iconModalidade} source={require('../assets/icons/acompanhado.png')}/>
                                        <Image style={styles.iconModalidade} source={require('../assets/icons/individual.png')}/>
                                    </View>
                                </View>

                                <View style={styles.flexRowRestaurante}>
                                    {this.novoTarja(item.createdAt)}
                                    <View style={styles.letrasDiasContent}>
                                        <Text style={[styles.letrasDias, {color: item.domDia || item.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>
                                        <Text style={[styles.letrasDias, {color: item.segDia || item.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                        <Text style={[styles.letrasDias, {color: item.terDia || item.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                                        <Text style={[styles.letrasDias, {color: item.quaDia || item.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                                        <Text style={[styles.letrasDias, {color: item.quiDia || item.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                                        <Text style={[styles.letrasDias, {color: item.sexDia || item.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                        <Text style={[styles.letrasDias, {color: item.sabDia || item.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                    })}
                </View>
                : null}
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    restauranteBoxImage: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 3.68,
        elevation: 4,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    flex1:{
        flex: 1
    },
    destaquesTitle: {
        fontSize: FONT.XLARGE,
        fontWeight: WEIGHT.MEDIUM,
        color: COLOR.GREY,
        paddingHorizontal: 20,
        paddingBottom: responsiveHeight(1.5),
    },
    restauranteContentContainer1: {
        flex: 1,
        paddingTop: 10, 
        
    },
    contentItemRestaurante: {
        flex: 1,
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.36,
        shadowRadius: 3.68,
        elevation: 8,
    },
    contentItem: {
        padding:5, 
        paddingRight:10, 
        flexDirection: 'row',
        flex: 1
    },
    restauranteImage: {
        height: 80,
        width: 80,
        backgroundColor: 'white',
        borderRadius: 5
    },
    internoItemRestaurante: {
        paddingLeft: responsiveHeight(1.5),
        justifyContent: 'space-between',
        flex: 2.7
    },
    nameRestaurant:{
        paddingVertical: 2,
        fontSize: FONT.SMEDIUM,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
    },
    detailsRestaurante: {
        fontSize: FONT.XSMALL,
        paddingBottom: 2,
        color: COLOR.GREY,
    },
    iconModalidade: {
        height: 18,
        width: 18,
        // flex: 1
    },
    flexRowRestaurante: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    letrasDiasContent: {
        flex: 1, 
        justifyContent: 'flex-end', 
        flexDirection: 'row'
    },
    letrasDias: {
        
        fontWeight: WEIGHT.FAT,
        paddingRight: 5
    },
});


const mapStateToProps = store => ({
  restaurantesList: store.AuthReducer.restaurantesList,
});

export default connect(mapStateToProps)(RestaurantList);