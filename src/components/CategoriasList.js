import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AsyncStorage } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageFiltros } from '../actions';

import Events from '../utils/Events';

import Theme from '../constants/Theme';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

class CategoriasList extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            categoria: '',
            catego: []
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            let categorias = this.props.categorias.sort(this.compare);
            let list = []
            categorias.map( (item, index) => {
                if(item.status){
                    list.push(item);
                }
            })
            this.setState({ catego: list })
        }

    }

    compare(a, b) {
        const bandA = a.index;
        const bandB = b.index;

        let comparison = 0;
        if (bandA > bandB) {
            comparison = 1;
        } else if (bandA < bandB) {
            comparison = -1;
        }
        return comparison;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    saveCategoria(item){
        if(this.state.categoria == item._id){
            this.setState({categoria: ""})
        }else{ 
            this.setState({categoria: item._id})
        }
        AsyncStorage.setItem("filters", JSON.stringify(item._id));
    }

    render(){
        
        return(
            <View style={{flex: 1, padding: 10}}>

                <Text style={styles.title}>Culinárias</Text>
                <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 200}} showsVerticalScrollIndicator={false}>
                    <View style={styles.flex1}>
                        {this.state.catego.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} onPress={() => this.saveCategoria(item) } style={[styles.btnCategoria, {backgroundColor: this.state.categoria == item._id ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}> 
                                    <Text style={{color: this.state.categoria == item._id ? COLOR.WHITE : COLOR.GREY }}>{item.nomeTipo}</Text>
                                </TouchableOpacity>
                            )})
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    title: {
      fontSize: FONT.SMEDIUM,
      color: COLOR.GREY,
      fontWeight: WEIGHT.FAT,
      paddingTop: 10,
      paddingLeft: 10,
      paddingBottom: 10,
    },
    btnCategoria: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        margin: 5
    },
    flex1:{
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        paddingTop: 20,
    } 
});

const mapStateToProps = store => ({
    categorias: store.InfoReducer.categorias,
    // appliedFilters: store.InfoReducer.appliedFilters,       
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageFiltros }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps )(CategoriasList);