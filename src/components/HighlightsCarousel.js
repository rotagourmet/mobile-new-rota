import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, AsyncStorage, ActivityIndicator } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import Theme from '../constants/Theme';
import Events from '../utils/Events';
import { getApi } from '../environments/config'
import Carousel, { Pagination } from 'react-native-snap-carousel';

import stylesImport, { colors } from '../assets/styles/index.styles'
import { ENTRIES1 } from '../static/entries';
import { sliderWidth, itemWidth } from '../assets/styles/SliderEntry.js';
import SliderEntry from '../components/SliderEntry';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storageUserToken } from '../actions';

const SLIDER_1_FIRST_ITEM = 0;
const { height } = Dimensions.get('window')
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;


class HighlightsCarousel extends Component {

    _isMounted = false;
    navigation = {};

    constructor (props) {
        super(props);
        this.state = {
            slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
            entries: []
        };
        this.setStateConfig = this.setStateConfig.bind(this);
        this.navigation = this.props.navigation;
    }

    _renderItemWithParallax ({item, index}, parallaxProps) {
        return (
            <SliderEntry
                data={item}
                parallax={true}
                parallaxProps={parallaxProps}
            />
        );
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.LoadRestaurants = Events.subscribe('LoadRestaurants', this.setStateConfig);
            this.setState({
                entries: this.props.content
            })
        }
    }

    setStateConfig(){
        let destaques = [];
        this.props.restaurantesList.restaurantes.map((res) => {
            if (res.destaque) {
                destaques.push(res)
            }
        });
        this.setState({
            entries: destaques
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
        Events.remove('LoadRestaurants')
        this.LoadRestaurants = null;
    }

    render(){
        const { slider1ActiveSlide } = this.state;
        return(
            <View style={styles.destaquesContainer}>
                <View>
                    <Carousel
                    ref={c => this._slider1Ref = c}
                    data={this.state.entries}
                    renderItem={this._renderItemWithParallax}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    hasParallaxImages={true}
                    firstItem={SLIDER_1_FIRST_ITEM}
                    inactiveSlideScale={0.94}
                    inactiveSlideOpacity={0.7}
                    // inactiveSlideShift={20}
                    containerCustomStyle={stylesImport.slider}
                    loop={false}
                    loopClonesPerSide={1}
                    autoplay={true}
                    autoplayDelay={100}
                    autoplayInterval={10000}
                    onSnapToItem={(index) => this.setState({ slider1ActiveSlide: index }) }
                    />
                    <Pagination
                    dotsLength={this.state.entries && this.state.entries.length > 22 ? 22 : this.state.entries.length}
                    activeDotIndex={slider1ActiveSlide}
                    containerStyle={stylesImport.paginationContainer}
                    dotColor={'#FFBC00'}
                    dotStyle={stylesImport.paginationDot}
                    inactiveDotColor={COLOR.GREY}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                    carouselRef={this._slider1Ref}
                    tappableDots={!!this._slider1Ref}
                    />
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    destaquesContainer: {
        paddingTop: 25,
        height: 230,
    },
});

const mapStateToProps = store => ({
  userToken: store.AuthReducer.userToken,
  restaurantesList: store.AuthReducer.restaurantesList,
  
});

const mapDispatchToProps = dispatch => bindActionCreators({ storageUserToken }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(HighlightsCarousel);