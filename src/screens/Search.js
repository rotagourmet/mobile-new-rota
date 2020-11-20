import React, { Component } from 'react'; 
import { Platform, Dimensions, SafeAreaView, View, Text, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Animated, TouchableOpacity, Image, AsyncStorage, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import CategoriasList from '../components/CategoriasList';
import Filters from '../components/Filters';

import RestaurantsList from '../components/RestaurantsList';
import { getApi } from '../environments/config'
import def_styles from '../assets/styles/theme.styles'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageCategorias, storageRestaurantFiltered } from '../actions';
import Theme from '../constants/Theme';
import Events from '../utils/Events';
import Filter from '../utils/Filtros';
import DiasAceitacao from "../components/DiasAceitacao";

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

let aController = new AbortController();

const { width } = Dimensions.get('window');


const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: COLOR.SECONDARY }}
    style={{ backgroundColor: COLOR.WHITE }}
    renderLabel={({ route, focused, color }) => (
        <Text style={{ color: focused ? COLOR.SECONDARY : COLOR.GREY, fontSize: FONT.SMALL}}>
            {route.title}
        </Text>
    )}
  />
);

class Search extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            search: '',
            categorias: null,
            filters: true,
            tabview: true,
            index: 0,
            
            ordenarPor: 'default',
            diasUso: '',
            horario: '',
            atividade: "",

            routes: [
                { key: "first", title: "BÁSICO" },
                { key: "second", title: "CATEGORIAS" }
            ],
            appliedFilters: [],
            showLastSearchs: false,
            fadeNotFound: new Animated.Value(0),
            fadeTabView: new Animated.Value(1),
            fadeHeightSearchBar: new Animated.Value(width - 30),
            loading: false
        };
    }

    fadeInHeightSearchBar(){
        Animated.timing( this.state.fadeHeightSearchBar, { toValue: width * 0.75, duration: 200, useNativeDriver: false }).start();
    }

    fadeOutHeightSearchBar(){
        Animated.timing( this.state.fadeHeightSearchBar, { toValue: width - 30, duration: 200, useNativeDriver: false }).start();
    }

    fadeInTabView(){
        Animated.timing( this.state.fadeTabView, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
    }

    fadeOutTabView(){
        Animated.timing( this.state.fadeTabView, { toValue: 0, duration: 400, useNativeDriver: false }).start();
    }

    fadeInNotFound(){
        Animated.timing( this.state.fadeNotFound, { toValue: 1, duration: 600, useNativeDriver: false }).start();
    }

    fadeOutNotFound(){
        Animated.timing( this.state.fadeNotFound, { toValue: 0, duration: 400, useNativeDriver: false }).start();
    }

    updateSearch = search => {
        this.setState({ search });
        this.filtrar(search);
    };

    updateFilterScreen(filter){ 
        
        this.setState({
            filters: false,
            showLastSearchs: false,
            appliedFilters: filter,
            loading: false
        })
        if (filter && filter.length == 0) {
            this.fadeInNotFound()
        }else if(!filter){
            // CASO NÃO TENHA APLICADO NENHUMA PESQUISA, RETORNA TODOS RESTAURANTES
            this.setState({
                filters: false,
                showLastSearchs: false,
                appliedFilters: this.props.restaurantesList,
                loading: false
            })
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if (this._isMounted) {
            this.listCategorias();
            AsyncStorage.getItem("lastSearched").then((response) => {
                response = JSON.parse(response);
                if (response && response.length > 0) {
                    this.setState({
                        lastSearched: {
                            title: "Recentes",
                            array: response
                        }
                    });
                }else{
                    this.setState({
                        lastSearched: {
                            title: "Sugeridas",
                            array: ["Churrascaria", "Pizza", "Burguer"]
                        }
                    });
                }
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        this.applyFilter = null;
    }

    async listCategorias(){
        //Requisição de listCategorias
        const server = getApi('api');
        let categorias = await fetch(server.url + `api/restaurants/listCategorias?token=` + this.props.userToken);
        categorias = await categorias.json();
        this.props.storageCategorias(categorias)
        this.setState({ categorias })
    }

    applyFiltersBtn(){
        let { index } = this.state;
        this.setState({loading: true})

        if(index == 0){
            //Basicos
            let filters = {
                atividade: this.state.atividade,
                horario: this.state.horario,
                diasUso: this.state.diasUso,
                ordenarPor: this.state.ordenarPor
            };
            let restFilter = Filter.basic(this.props.restaurantesList.restaurantes, filters)
            this.props.storageRestaurantFiltered(restFilter)
            this.updateFilterScreen(restFilter)
        }else{
            //Categorias
            let searched = []
            this.fadeOutNotFound()
            AsyncStorage.getItem("filters").then( async (categoria) => {
                categoria = JSON.parse(categoria);
                searched = this.props.restaurantesList.restaurantes.filter((item) => {
                    if (item.culinariaPrincipal._id == categoria || item.culinariaSecundaria == categoria) {
                        return item;
                    }
                });
                if (searched && searched.length > 0) {
                    this.setState({
                        filters: false,
                        appliedFilters: searched,
                        loading: false
                    })
                }else if(searched && searched.length == 0){
                    this.setState({
                        filters: false,
                        appliedFilters: searched,
                        loading: false
                    })
                    this.fadeInNotFound()
                }
            })
        }
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

    selectedRestaurant(item){
        AsyncStorage.getItem("lastSearched").then((response) => {
            response = JSON.parse(response);

            if (response && response.length > 0) {
                if (!response.includes(item.nomeUnidade)) {    
                    response.push(item.nomeUnidade);

                    AsyncStorage.setItem("lastSearched", JSON.stringify(response));
                    this.props.navigation.navigate("Restaurant", { restaurant: item } )
                }
            }else{
                let lastSearched = [item.nomeUnidade];
                AsyncStorage.setItem("lastSearched", JSON.stringify(lastSearched));
                this.props.navigation.navigate("Restaurant", { restaurant: item } )
            }
        })
    }

    filtrar(query) {
        let newListaRestaurantes = [];
        this.fadeOutNotFound()

        if (query && query.length > 0) {
            for (const u of this.props.restaurantesList.restaurantes) {
                
                let nomeRestaurante = u.nomeUnidade.toUpperCase();
                if (nomeRestaurante.includes(query.toUpperCase())) {
                    newListaRestaurantes.push(u);
                } 
            };
            if (newListaRestaurantes.length == 0) {
                this.setState({
                    filters: false,
                    appliedFilters: newListaRestaurantes
                })
                this.fadeInNotFound()
            }else{
                this.setState({ appliedFilters: newListaRestaurantes, filters: false });
                this.fadeOutNotFound()
            }
        }
        else {
            this.setState({
                filters: true
            })
            this.fadeOutNotFound()
            this.fadeInTabView()
        }
    }


	isIphoneX () {
        const iphoneXLength = 812
        const iphoneXSMaxLength = 896
        const windowDimensions = Dimensions.get('window')
        return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (windowDimensions.width === iphoneXLength ||
        windowDimensions.height === iphoneXLength ||
        windowDimensions.width === iphoneXSMaxLength ||
        windowDimensions.height === iphoneXSMaxLength)
        )
    }


    render(){
        const DimensionsStyle = Platform.OS === 'ios' && this.isIphoneX() ? 95 : 0;
        const { search, index, filters, appliedFilters } = this.state;
        // console.log('appliedFilters', appliedFilters);
        if (filters) {
            return(
                <SafeAreaView style={styles.mainContainer}>
                    <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                    <View style={styles.searchContainer}>
                        <Animated.View style={{ width: this.state.fadeHeightSearchBar }}>
                            <SearchBar
                                cancelIcon={null}
                                ref={search => this.search = search}
                                placeholder="Buscar Restaurantes"
                                containerStyle={styles.containerStyleSearchBar}
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyleSearchBar}
                                onChangeText={this.updateSearch}
                                searchIcon={<Icon name='search' type='font-awesome' color={COLOR.SECONDARY} size={15} />}
                                lightTheme={true}
                                showCancel={true}
                                autoCapitalize={'words'}
                                cancelButtonTitle={"Cancelar"}
                                value={search}
                                showLoading={this.state.loading}
                                onFocus={() => { this.fadeInHeightSearchBar(); this.fadeOutTabView(); this.setState({tabview: false, showLastSearchs: true, btnCancel: true});}}
                                onClear={() => {this.fadeOutHeightSearchBar(); this.setState({tabview: true, btnCancel: false})} }
                                onCancel={() => {this.fadeOutHeightSearchBar(); this.setState({tabview: true, btnCancel: false, showLastSearchs: false, search: null}); this.fadeInTabView();} }

                                returnKeyType={'search'}
                                onSubmitEditing={() => {this.setState({tabview: true, btnCancel: false}); this.fadeOutHeightSearchBar();}}
                                onEndEditing={() => {this.setState({ tabview: true, btnCancel: false, showLastSearchs: false, search: null}); this.fadeOutHeightSearchBar(); this.fadeInTabView();}}
                            />
                            </Animated.View>

                            {this.state.btnCancel ?
                                <TouchableOpacity style={styles.containerBtnCancel} onPress={() => {this.fadeOutHeightSearchBar(); this.setState({btnCancel: false }); Keyboard.dismiss()} }>
                                    <Text style={styles.btnCancelarLabel}>Cancelar</Text>
                                </TouchableOpacity>
                            : null}
                    </View>
                        
                    { this.state.tabview ? 
                        <Animated.View style={{ opacity: this.state.fadeTabView, flex: 1 }}>
                            <TabView
                                renderTabBar={renderTabBar}
                                navigationState={this.state}
                                onIndexChange={index => { this.setState({ index })} }
                                renderScene={SceneMap({
                                    first: () => this.filterDesign(),
                                    second: () => this.state.categorias ? <CategoriasList/> : null,
                                })}
                            />     
                        </Animated.View>
                        : 
                    this.state.showLastSearchs ?
                        <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss(); this.setState({tabview: true, btnCancel: false}); this.fadeInTabView()}}>
                            {this.state.lastSearched ?
                                <View style={styles.containerMainLastSearched}>
                                    <Text style={styles.mainTitleLastSearched}>Busca {this.state.lastSearched.title}</Text>

                                    {this.state.lastSearched.array.map((item, index) => {
                                        return (
                                        <TouchableOpacity key={index} style={styles.containerLastSearched} onPress={() => {this.updateSearch(item)}}>
                                            <Image source={require('../assets/icons/time.png')} style={styles.timeIcon}/>
                                            <Text style={styles.labelLastSearched}>{item}</Text>
                                        </TouchableOpacity>
                                    )})}
                                </View>
                            : null}
                        </TouchableWithoutFeedback>
                    : null}
                    {this.state.tabview ?
                        <View style={[styles.containerBtnStatico, {bottom: DimensionsStyle ? DimensionsStyle : 55,}]}>
                            <View style={styles.flex1}>
                                <TouchableOpacity onPress={() => this.applyFiltersBtn()} style={styles.btnApplyFilters}>
                                    {this.state.loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.txtApplyFilters}>APLICAR FILTROS</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    : null}
                </SafeAreaView>
            )
        }else if(appliedFilters && appliedFilters.length > 0){
            return(
                <SafeAreaView style={styles.mainContainer}>
                    <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                    <View style={styles.searchContainer}>
                        <Animated.View style={{ width: this.state.fadeHeightSearchBar }}>
                            <SearchBar
                                cancelIcon={null}
                                ref={search => this.search = search}
                                placeholder="Buscar Restaurantes"
                                containerStyle={styles.containerStyleSearchBar}
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyleSearchBar}
                                onChangeText={this.updateSearch}
                                searchIcon={<Icon name='search' type='font-awesome' color={COLOR.SECONDARY} size={15} />}
                                lightTheme={true}
                                showCancel={true}
                                autoCapitalize={'words'}
                                cancelButtonTitle={"Cancelar"}
                                value={search}
                                showLoading={this.state.loading}
                                onFocus={() => { this.fadeInHeightSearchBar(); this.fadeOutTabView(); this.setState({tabview: false, showLastSearchs: true, btnCancel: true});}}
                                onClear={() => {this.fadeOutHeightSearchBar(); this.setState({tabview: true, btnCancel: false})} }
                                onCancel={() => {this.fadeOutHeightSearchBar(); this.setState({tabview: true, btnCancel: false});} }

                                returnKeyType={'search'}
                                onSubmitEditing={() => {this.setState({tabview: true, btnCancel: false}); this.fadeOutHeightSearchBar();}}
                                onEndEditing={() => {this.setState({tabview: true, btnCancel: false}); this.fadeOutHeightSearchBar();}}
                            />
                            </Animated.View>

                            {this.state.btnCancel ?
                                <TouchableOpacity style={styles.containerBtnCancel} onPress={() => {this.fadeOutHeightSearchBar(); this.setState({btnCancel: false, filters: true}); Keyboard.dismiss()} }>
                                    <Text style={styles.btnCancelarLabel}>Cancelar</Text>
                                </TouchableOpacity>
                            : null}
                    </View>
                    <View style={[styles.flexDirectionRow, {paddingHorizontal: 15, paddingTop: 10, marginBottom: 10}]}>
                        <TouchableOpacity style={styles.btnFiltro} onPress={() => {this.fadeInTabView(); this.setState({ filters: true, search: '', appliedFilters: null})}}>
                            <Text style={[styles.txtFiltroBtn, {paddingRight: 10}]}>Filtros</Text>
                            <Text style={styles.txtFiltroBtn}>X</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView ref='homeScroll' scrollEnabled={true} style={styles.flex1} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        {appliedFilters ?
                            <View style={[styles.restauranteContentContainer1]}>
                                <Text style={styles.destaquesTitle}>Restaurantes</Text>
                                {appliedFilters.map((item, index) => {
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
                                                        <Text style={styles.detailsRestaurante}>{item.culinariaPrincipal.nomeTipo} {item.distance ? " • " +  item.distance : ""}</Text>
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
                                )
                                })}
                            </View>
                            : null}
                        </ScrollView>
                    
                </SafeAreaView>
            )
        
        }else if(appliedFilters && appliedFilters.length == 0 && !filters){
            return(
                <SafeAreaView style={styles.mainContainer}>
                    <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                    <View style={styles.searchContainer}>
                        <Animated.View style={{ width: this.state.fadeHeightSearchBar }}>
                            <SearchBar
                                cancelIcon={false}
                                ref={search => this.search = search}
                                placeholder="Buscar Restaurantes"
                                containerStyle={styles.containerStyleSearchBar}
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyleSearchBar}
                                onChangeText={this.updateSearch}
                                searchIcon={<Icon name='search' type='font-awesome' color={COLOR.SECONDARY} size={15} />}
                                lightTheme={true}
                                showCancel={true}
                                autoCapitalize={'words'}
                                cancelButtonTitle={"Cancelar"}
                                value={search}
                                showLoading={this.state.loading}
                                onFocus={() => { this.fadeInHeightSearchBar(); this.fadeOutTabView(); this.setState({tabview: false, showLastSearchs: true, btnCancel: true}); }}
                                onClear={() => { this.fadeOutHeightSearchBar(); this.setState({ btnCancel: false}) }}
                                onCancel={() => { this.fadeOutHeightSearchBar(); this.setState({ btnCancel: false}) }}

                                returnKeyType={'search'}
                                onSubmitEditing={() => {this.setState({ btnCancel: false}); this.fadeOutHeightSearchBar();}}
                                onEndEditing={() => {this.setState({ btnCancel: false}); this.fadeOutHeightSearchBar();}}
                            />
                            </Animated.View>

                            {this.state.btnCancel ?
                                <TouchableOpacity style={styles.containerBtnCancel} onPress={() => {this.fadeOutHeightSearchBar(); this.setState({btnCancel: false}); Keyboard.dismiss()} }>
                                    <Text style={styles.btnCancelarLabel}>Cancelar</Text>
                                </TouchableOpacity>
                            : null}
                    </View>
                    <View style={[styles.flexDirectionRow, {paddingHorizontal: 15, paddingTop: 10, marginBottom: 10}]}>
                        <TouchableOpacity style={styles.btnFiltro} onPress={() => {this.fadeInTabView(); this.setState({ filters: true, search: ''})}}>
                            <Text style={[styles.txtFiltroBtn, {paddingRight: 10}]}>Filtros</Text>
                            <Text style={styles.txtFiltroBtn}>X</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss(); this.setState({btnCancel: false})}}>

                        <Animated.View style={[styles.imgContainer, { opacity: this.state.fadeNotFound }]}>
                            <Image source={require('../assets/images/noresults.png')} style={styles.imgNoresults} />
                            <Text style={styles.txtFeedBack}>Nenhum restaurante encontrado</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    
                </SafeAreaView>
            )
        }else{
            return(
                <SafeAreaView style={styles.mainContainer}>
                    <StatusBar showHideTransition={true} backgroundColor={COLOR.PRIMARY} animated={true} barStyle={'dark-content'} networkActivityIndicatorVisible={false} />
                    <View style={styles.searchContainer}>
                        <Animated.View style={{ width: this.state.fadeHeightSearchBar }}>
                        <SearchBar
                            cancelIcon={null}
                            ref={search => this.search = search}
                            placeholder="Buscar Restaurantes"
                            containerStyle={styles.containerStyleSearchBar}
                            inputContainerStyle={styles.inputContainerStyle}
                            inputStyle={styles.inputStyleSearchBar}
                            onChangeText={this.updateSearch}
                            searchIcon={<Icon name='search' type='font-awesome' color={COLOR.SECONDARY} size={15} />}
                            lightTheme={true}
                            showCancel={true}
                            cancelButtonTitle={"Cancelar"}
                            value={search}
                            showLoading={this.state.loading}
                            onFocus={() => {this.setState({filters: false, showLastSearchs: true})}}
                            onClear={() => this.setState({filters: true}) }
                            onCancel={() => this.setState({filters: true}) }
                        />
                        </Animated.View>
                        {this.state.btnCancel ?
                            <TouchableOpacity style={styles.containerBtnCancel} onPress={() => {this.fadeOutHeightSearchBar(); this.setState({btnCancel: false}); Keyboard.dismiss()} }>
                                <Text style={styles.btnCancelarLabel}>Cancelar</Text>
                            </TouchableOpacity>
                        : null}
                    </View>
                    <View style={[styles.flexDirectionRow, {paddingHorizontal: 15, paddingTop: 10, marginBottom: 10}]}>
                        <TouchableOpacity style={styles.btnFiltro} onPress={() => {this.setState({ filters: true, search: ''})}}>
                            <Text style={[styles.txtFiltroBtn, {paddingRight: 10}]}>Filtros</Text>
                            <Text style={styles.txtFiltroBtn}>X</Text>
                        </TouchableOpacity>
                    </View>
                
                </SafeAreaView>
            )
        }
    }

    // COMPONENT FILTERS
    filterDesign(){
        return(
            <View>
                <ScrollView contentContainerStyle={styles.contentContainer2} showsVerticalScrollIndicator={false} >
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

                    <Text style={styles.titleSection}>Atividade</Text>
                    <View style={[styles.flex1, def_styles.p_h_30]}>
                        <View style={styles.ordenarPorContainer}>
                            <TouchableOpacity onPress={() => this.state.atividade === "Acompanhado" ? this.setState({atividade: ""}) : this.setState({atividade: "Acompanhado"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Acompanhado" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                                <Image source={ this.state.atividade == "Acompanhado" ? require('../assets/icons/coupleB.png') : require('../assets/icons/coupleY.png')} style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Acompanhado" ? COLOR.WHITE : COLOR.GREY }]}>Acompanhado</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.state.atividade === "Individual" ? this.setState({atividade: ""}) : this.setState({atividade: "Individual"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Individual" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                                <Image source={ this.state.atividade == "Individual" ? require('../assets/icons/individualB.png') : require('../assets/icons/individualY.png')} style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Individual" ? COLOR.WHITE : COLOR.GREY }]}>Individual</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.ordenarPorContainer}>
                            <TouchableOpacity onPress={() => this.state.atividade === "Delivery" ? this.setState({atividade: ""}) : this.setState({atividade: "Delivery"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.atividade == "Delivery" ? COLOR.SECONDARY : COLOR.GREY_XWHITE }]}>
                                <Image source={this.state.atividade == "Delivery" ? require('../assets/icons/deliveryB.png') : require('../assets/icons/fast-foodY.png')} style={{height: 15, width: 30,}}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.atividade == "Delivery" ? COLOR.WHITE : COLOR.GREY }]}>Delivery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.titleSection}>Horário</Text>
                    <View style={[styles.flex1, def_styles.p_h_30]}>
                        <View style={styles.ordenarPorContainer}>
                            <TouchableOpacity onPress={() => this.state.horario === "Manhã" ? this.setState({horario: ""}) : this.setState({horario: "Manhã"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Manhã" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                                <Image source={this.state.horario == "Manhã" ? require('../assets/icons/manhaB.png') : require('../assets/icons/manha.png') } style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Manhã" ? COLOR.WHITE : COLOR.GREY }]}>Manhã</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.state.horario === "Almoço" ? this.setState({horario: ""}) : this.setState({horario: "Almoço"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Almoço" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                                <Image source={ this.state.horario == "Almoço" ? require('../assets/icons/sunB.png') : require('../assets/icons/sun.png') } style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Almoço" ? COLOR.WHITE : COLOR.GREY}]}>Almoço</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.ordenarPorContainer}>
                            <TouchableOpacity onPress={() => this.state.horario === "Tarde" ? this.setState({horario: ""}) : this.setState({horario: "Tarde"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Tarde" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                                <Image source={ this.state.horario == "Tarde" ? require('../assets/icons/coffeeB.png') : require('../assets/icons/coffee.png') } style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Tarde" ? COLOR.WHITE : COLOR.GREY}]}>Tarde</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.state.horario === "Jantar" ? this.setState({horario: ""}) : this.setState({horario: "Jantar"}) } style={[styles.horarioContainer, def_styles.m_r_10, { backgroundColor: this.state.horario == "Jantar" ? COLOR.SECONDARY : COLOR.GREY_XWHITE}]}>
                                <Image source={ this.state.horario == "Jantar" ? require('../assets/icons/luaB.png') : require('../assets/icons/luaY.png') } style={styles.horarioIcon}/>
                                <Text style={[styles.horarioBtnLabel, {color: this.state.horario == "Jantar" ? COLOR.WHITE : COLOR.GREY}]}>Jantar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    // FILTER COMPONENTE
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
    contentContainer2: {
        // flex: 1,
        paddingBottom: 200,
    },



    // pesquisa
    btnCancelarLabel: {
        color: COLOR.GREY
    },
    containerBtnCancel: {
        width: width * 0.25,
        paddingLeft: 10
    },
    flexDirectionRow:{
        flexDirection: 'row'
    },
    txtFiltroBtn: {
        color: COLOR.WHITE,
        fontSize: FONT.SMEDIUM
    },
    btnFiltro: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLOR.SECONDARY,
    },
    txtFeedBack: {
        color: COLOR.GREY,
        fontSize: FONT.SMEDIUM,
        paddingTop: 20
    },
    imgContainer: {
        flex: 1,
        paddingTop: 30,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    imgNoresults: {
        height: responsiveHeight(25),
        width: responsiveHeight(25)
    },
    mainTitleLastSearched: {
        color: COLOR.GREY,
        fontWeight: WEIGHT.FAT,
        fontSize: FONT.SMALL,
        paddingTop: 5,
        paddingBottom: 25
    },
    timeIcon: {
        height: 15,
        width: 15
    },
    labelLastSearched: {
        color: '#ABACAD',
        paddingLeft: 10
    },
    containerMainLastSearched: {
        flex: 1,
        padding: 15
    },
    containerLastSearched: {
        flexDirection: 'row',
        borderBottomColor: '#ABACAD',
        borderBottomWidth: 0.2,
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    txtApplyFilters: {
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    flex1: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    btnApplyFilters: {
        backgroundColor: COLOR.PRIMARY,
        borderRadius: 6,
        margin:20,
        paddingVertical: 14,
        paddingHorizontal: 35,
        width: '90%'
    },
    containerBtnStatico:{
        borderTopWidth: 0.4,
        backgroundColor: 'white',
        borderTopColor: 'rgba(0,0,0, 0.2)',
        position: 'absolute',
        left: 0,
        right: 0,
    },
    
    inputStyleSearchBar:{
        fontSize: FONT.XSMALL,
    },
    searchContainer: {
        paddingHorizontal: 15,
        flexDirection : 'row', 
        alignItems: 'center'
    },
    containerStyleSearchBar: {
        backgroundColor: COLOR.WHITE,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.20,
        shadowRadius: 3.68,
        paddingVertical:0, 
        paddingHorizontal: 10, 
        elevation: 4,
        marginTop: 10,
        marginBottom: 10,
    },
    inputContainerStyle: {
        backgroundColor: COLOR.WHITE, 
        borderWidth: 0, 
        borderColor: COLOR.WHITE, 
    },
    mainContainer: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: COLOR.WHITE,
    },


    // RESTAURANTE LIST
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
        paddingBottom: 80,
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

});

const mapStateToProps = store => ({
  restaurantesList: store.AuthReducer.restaurantesList,
  userToken: store.AuthReducer.userToken,
  categorias: store.InfoReducer.categorias,
  appliedFilters: store.InfoReducer.appliedFilters,
  restaurantFiltered: store.InfoReducer.restaurantFiltered,
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageCategorias, storageRestaurantFiltered }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Search);