import React, { Component } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, AsyncStorage } from 'react-native';
import Theme from '../constants/Theme';
import def_styles from '../assets/styles/theme.styles'
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
import Events from '../utils/Events';
import Filter from '../utils/Filtros';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { storageFiltros, storageRestaurantFiltered } from '../actions';
import { getApi } from '../environments/config'

const server = getApi('api');

class Filters extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            ordenarPor: 'default',
            diasUso: '',
            horario: '',
            atividade: '',
            iterations: 0
        }
        this.applyFilters = this.applyFilters.bind(this);
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            this.applyFilter = Events.subscribe('ApplyFilter', this.applyFilters)
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        Events.remove('ApplyFilter')
        this.applyFilter = null
    }

    applyFilters(){
        let filters = {
            atividade: this.state.atividade,
            horario: this.state.horario,
            diasUso: this.state.diasUso,
            ordenarPor: this.state.ordenarPor
        };
        console.log('filters', filters);
        let filter = Filter.basic(this.props.restaurantesList.restaurantes, filters)
        this.setState({iterations:  (this.state.iterations + 1) })
        if (this.state.iterations < 1) {
            Events.publish("UpdateFilterScreen");
        }
        
    }


    render(){
        return(
            <ScrollView style={[styles.flex1]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* ORDENAR POR */}
                <Text style={styles.titleSection}>Ordenar por</Text>
                <View style={styles.ordenarPorContainer1}>
                    <TouchableOpacity style={styles.ordenarPorBtn} onPress={() => {this.setState({ordenarPor: 'default'});}}>
                        <Image style={styles.ordenarPorIcone} source={this.state.ordenarPor == 'default' ? require('../assets/icons/padraoY.png') : require('../assets/icons/padraoB.png')}/>
                        <Text style={styles.ordenarPorBtnLabel}>{'Ordenação \n Padrão'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ordenarPorBtn} onPress={() => {this.setState({ordenarPor: 'distancia'});}}>
                        <Image style={styles.ordenarPorIcone} source={this.state.ordenarPor == 'distancia' ? require('../assets/icons/distanciaY.png') : require('../assets/icons/distanciaB.png')}/>
                        <Text style={styles.ordenarPorBtnLabel}>Distancia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ordenarPorBtn} onPress={() => { null}}>
                        {/* <Image style={styles.ordenarPorIcone} source={this.state.ordenarPor == 'preco' ? require('../assets/icons/preçoY.png') : require('../assets/icons/preçoB.png')}/>
                        <Text style={styles.ordenarPorBtnLabel}>Preço</Text> */}
                    </TouchableOpacity>
                </View>

                {/* DIAS DE USO */}
                <Text style={styles.titleSection}>Dias de uso</Text>
                <View style={[styles.ordenarPorContainer,def_styles.p_h_30 ]} >
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "seg" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'seg' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'seg'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color:  this.state.diasUso == "seg" ? COLOR.WHITE : COLOR.GREY}]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "ter" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'ter' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'ter'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "ter" ? COLOR.WHITE : COLOR.GREY}]}>T</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "qua" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'qua' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'qua'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "qua" ? COLOR.WHITE : COLOR.GREY}]}>Q</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "qui" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'qui' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'qui'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "qui" ? COLOR.WHITE : COLOR.GREY}]}>Q</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "sex" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'sex' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'sex'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "sex" ? COLOR.WHITE : COLOR.GREY}]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "sab" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() =>  { this.state.diasUso == 'sab' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'sab'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "sab" ? COLOR.WHITE : COLOR.GREY}]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.diasDeUsoBtn, { backgroundColor: this.state.diasUso == "dom" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]} onPress={() => { this.state.diasUso == 'dom' ? this.setState({diasUso: ''}) : this.setState({diasUso: 'dom'}) }}>
                        <Text style={[styles.diasDeUsoBtnLabel, {color: this.state.diasUso == "dom" ? COLOR.WHITE : COLOR.GREY}]}>D</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.titleSection}>Horário</Text>
                <View style={[styles.flex1, def_styles.p_h_30]}>
                    <View style={styles.ordenarPorContainer}>
                        <TouchableOpacity onPress={() => {this.setState({horario: "Manhã"});}} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Manhã" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                            <Image source={this.state.horario == "Manhã" ? require('../assets/icons/manhaB.png') : require('../assets/icons/manha.png') } style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Manhã" ? COLOR.WHITE : COLOR.GREY }]}>Manhã</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({horario: "Almoço"}); }} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Almoço" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                            <Image source={ this.state.horario == "Almoço" ? require('../assets/icons/sunB.png') : require('../assets/icons/sun.png') } style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Almoço" ? COLOR.WHITE : COLOR.GREY}]}>Almoço</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ordenarPorContainer}>
                        <TouchableOpacity onPress={() => {this.setState({horario: "Tarde"});}} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Tarde" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                            <Image source={ this.state.horario == "Tarde" ? require('../assets/icons/coffeeB.png') : require('../assets/icons/coffee.png') } style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Tarde" ? COLOR.WHITE : COLOR.GREY}]}>Tarde</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({horario: "Jantar"});}} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Jantar" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                            <Image source={ this.state.horario == "Jantar" ? require('../assets/icons/luaB.png') : require('../assets/icons/luaY.png') } style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Jantar" ? COLOR.WHITE : COLOR.GREY}]}>Jantar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.titleSection}>Atividade</Text>
                <View style={[styles.flex1, def_styles.p_h_30]}>
                    <View style={styles.ordenarPorContainer}>
                        <TouchableOpacity onPress={() => {this.setState({atividade: "Acompanhado"});} } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Acompanhado" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                            <Image source={ this.state.atividade == "Acompanhado" ? require('../assets/icons/coupleB.png') : require('../assets/icons/coupleY.png')} style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Acompanhado" ? COLOR.WHITE : COLOR.GREY }]}>Acompanhado</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({atividade: "Individual"});}} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Individual" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                            <Image source={ this.state.atividade == "Individual" ? require('../assets/icons/individualB.png') : require('../assets/icons/individualY.png')} style={styles.horarioIcon}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Individual" ? COLOR.WHITE : COLOR.GREY }]}>Individual</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ordenarPorContainer}>
                        <TouchableOpacity onPress={() => {this.setState({atividade: "Delivery" });}} style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Delivery" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                            <Image source={this.state.atividade == "Delivery" ? require('../assets/icons/deliveryB.png') : require('../assets/icons/fast-foodY.png')} style={{height: 15, width: 30,}}/>
                            <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Delivery" ? COLOR.WHITE : COLOR.GREY }]}>Delivery</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    horarioBtnLabel: {
        textAlign: 'center',
        fontSize: FONT.SMALL,
        paddingLeft: 10,
    },
    horarioIcon: {
        height: 18,
        width: 18,
    },
    horarioContainer: {
        flex: 1,
        borderRadius: 4,
        height: 38,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
        
    },
    diasDeUsoBtnLabel: {
        textAlign: 'center',
        fontSize: FONT.XSMALL,
    },
    diasDeUsoBtn: {
        borderRadius: 4,
        height: 35,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        color: COLOR.GREY,
        fontSize: FONT.SMALL,
        fontWeight: WEIGHT.FAT,
        paddingVertical: 13,
        paddingLeft: 30
    },
    ordenarPorBtnLabel: {
        textAlign: 'center',
        color: COLOR.GREY,
        fontSize: FONT.XSMALL,
        paddingTop: 5
    },
    ordenarPorBtn: {
        flex: 1,
        alignItems: 'center'
    },
    ordenarPorBtn1: {
        // flex: 1,
        alignItems: 'center'
    },
    ordenarPorContainer1:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingBottom: 15,
    },
    ordenarPorContainer:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 15,
    },
    ordenarPorIcone: {
        height: 60,
        width: 60,
    },
    flex1:{
        flex: 1
    },
    contentContainer: {
        // flex: 1,
        paddingBottom: 200,
    }
});

const mapStateToProps = store => ({
  appliedFilters: store.InfoReducer.appliedFilters, 
  restaurantesList: store.AuthReducer.restaurantesList,
  userToken: store.AuthReducer.userToken,
});


const mapDispatchToProps = dispatch => bindActionCreators({ storageFiltros, storageRestaurantFiltered }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Filters);