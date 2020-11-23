import React, { Component } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Dimensions, 
    Image, 
    ScrollView 
} from 'react-native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import Theme from '../constants/Theme';
import Events from '../utils/Events';
import { getApi } from '../environments/config'
import def_styles from '../assets/styles/theme.styles'
import Pageheader from '../components/Pageheader'
import DiasAceitacao from "../components/DiasAceitacao";

const { height } = Dimensions.get('window')
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class Categories extends Component {

    constructor(props){
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        this.setState({
            restaurantes: []
        })
        this.carregaRestaurantes()
    }

    async carregaRestaurantes(){
        let categoria = this.props.route && this.props.route.params && this.props.route.params.item;
        // console.log('categoria', categoria);
        this.setState({ categoria });
        let restaurantes = this.props.restaurantesList.restaurantes;
        let categoriaEscolhida = [];
        await Promise.all(restaurantes.map( (item, index) => {
            if(categoria._id === item.culinariaPrincipal._id){
                return categoriaEscolhida.push(item)
            }else if(categoria._id === item.culinariaSecundaria._id){
                return categoriaEscolhida.push(item)
            }
        }));
        this.setState({
            restaurantes:categoriaEscolhida
        })
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
        let { restaurantes, categoria } = this.state;
        return(
            <View style={{flex: 1}}>
                <Pageheader title={ categoria ? categoria.nomeTipo : ""} navigation={this.props.navigation} statusBarColor={'transparent'}/>
                {restaurantes && restaurantes.length > 0 ? 
                
                <ScrollView ref='homeScroll' scrollEnabled={true} style={styles.flex1} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {restaurantes.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.contentItemRestaurante} onPress={() => this.props.navigation.navigate("Restaurant", { restaurant: item})}>
                                <View style={styles.contentItem}>
                                    <View style={styles.restauranteBoxImage}>
                                        <Image source={{uri: item.restaurante.logo}} style={styles.restauranteImage} />
                                    </View>
                                    <View style={styles.internoItemRestaurante}>
                                        <View style={{flex: 1}}>
                                            <View style={styles.flexRowRestaurante}>
                                                <Text style={styles.nameRestaurant}>{item.nomeUnidade}</Text>
                                                {this.novoTarja(item.createdAt)}
                                            </View>
                                            
                                            <View style={styles.flexRowRestaurante}>
                                                <Text style={styles.detailsRestaurante}>{item.culinariaPrincipal.nomeTipo}</Text>
                                            </View>
                                            
                                        </View>

                                        <View style={styles.flexRowRestaurante}>
                                            <View style={styles.iconsContainer}>
                                                { item.modeloNegocio && item.modeloNegocio[0] && item.modeloNegocio[0].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/acompanhado.png')}/> : null}
                                                { item.modeloNegocio && item.modeloNegocio[1] && item.modeloNegocio[1].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/individual.png')}/> : null }
                                                { item.modeloNegocio && item.modeloNegocio[2] && item.modeloNegocio[2].status ? <Image style={styles.iconModalidade} source={require('../assets/icons/delivery.png')}/> : null}
                                            </View>
                                            <DiasAceitacao item={item} />
                                        </View>
                                    </View>
                                </View>
                        </TouchableOpacity>
                    )})}
                </ScrollView>
                : 
                <View style={def_styles.d_flex_complete_center}>
                    <Text style={{color: COLOR.GREY, fontSize: FONT.LABEL}}>Nenhum restaurante cadastrado nessa categoria</Text>
                </View>
                    }
            </View>
        )
    }
  
}

const styles = StyleSheet.create({
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    contentItem: {
        padding:5, 
        paddingRight:10, 
        flexDirection: 'row',
        flex: 1
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
    detailsRestaurante: {
        fontSize: FONT.XSMALL,
        paddingBottom: 5,
        color: COLOR.GREY,
    },
    nameRestaurant:{
        paddingVertical: 5,
        fontSize: FONT.SMEDIUM,
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
    },
    internoItemRestaurante: {
        paddingLeft: responsiveHeight(1.5),
        paddingBottom: 5,
        justifyContent: 'space-between',
        flex: 2.7
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
    restauranteImage: {
        height: 75,
        width: 75,
        backgroundColor: 'white',
        borderRadius: 5
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
        shadowRadius: 3.18,
        elevation: 8,
    },    

    restauranteContentContainer1: {
        flex: 1,
        paddingTop: 10, 
        
    },
    flex1: {
        flex: 1,
    },
    contentContainer: {
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingTop: 20,
        paddingBottom: 180,
    },    
});

const mapStateToProps = store => ({
    restaurantesList: store.AuthReducer.restaurantesList,
});

export default connect(mapStateToProps)(Categories);