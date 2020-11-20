import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ParallaxImage } from 'react-native-snap-carousel';

import styles from '../assets/styles/SliderEntry';

class SliderEntry extends Component {
    
    _isMounted = false;

    static propTypes = {
        data: PropTypes.object.isRequired,
        even: PropTypes.bool,
        parallax: PropTypes.bool,
        parallaxProps: PropTypes.object
    };

    get image () {
        const {data, parallax, parallaxProps, even } = this.props;

        return parallax ? (
            <View style={{flex: 1}}>
                <View style={{position:'absolute', width: '100%', height: '100%', zIndex: 100, }}>
                    <View style={[styles.image, styles.imageMiddle]}/>
                </View>
                <ParallaxImage
                    source={ { uri: data.restaurante.fotoRepresentativa }}
                    containerStyle={[styles.imageContainer]}
                    style={styles.image}
                    parallaxFactor={0.1}
                    showSpinner={true}
                    spinnerColor={even ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.15)'}
                    {...parallaxProps}
                />
                <View style={{position:'absolute', top: '25%', left: '35%', zIndex: 101}}>
                    <Image source={{uri: data.restaurante.logo,}} style={{height: 80, width: 80, borderRadius: 100}} />
                </View>
            </View>
        ) : (
            <View style={{flex: 1}}>
                <View style={{position:'absolute', width: '100%', height: '100%', zIndex: 100, }}>
                    <View style={[styles.image, styles.imageMiddle]}/>
                </View>
            </View>
        );
    }
    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render () {
        const { data: { nomeUnidade, subtitle }, even } = this.props;
        return (
            <TouchableOpacity activeOpacity={1} style={styles.slideInnerContainer} onPress={() => this.props.navigation.navigate("Restaurant", { restaurant: this.props.data})}>
                <View style={styles.shadow} />
                <View style={[styles.imageContainer]}>
                    { this.image }
                </View>
            </TouchableOpacity>
        );
    }
}

const mapStateToProps = store => ({
    navigation: store.InfoReducer.navigation,
});

export default connect(mapStateToProps)(SliderEntry);