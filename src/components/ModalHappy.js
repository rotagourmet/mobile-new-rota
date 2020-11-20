
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import LottieView from "lottie-react-native";
import Theme from '../constants/Theme';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');

export default class Modal extends Component {
    onChange;
    onRoute;
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: true,
            routeChange: false,

            title: this.props.title,
            subtitle: this.props.subtitle,
            content: this.props.content,
            btnText: this.props.btnText,
        }
        this.valueChange = this.props.onChange;
        this.routeChange = this.props.onRoute;
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            modalVisible: nextProps.modalVisible,
            routeChange: nextProps.routeChange
        })
    }
    telaPremium() {
        // this.props.navigation.navigate('Plans');
        this.setState({ routeChange: true });
        if (this.routeChange instanceof Function) {
            this.routeChange(false);
        }
    }

    render() {
        console.log('method', this.props.method);
        return (
            <View style={styles.component}>
                <View style={[styles.wholeContent, { height: this.props.boxSize ? this.props.boxSize : responsiveWidth(110)}, ]}>
                    <TouchableOpacity style={styles.close} onPress={() => {
                        this.setState({ modalVisible: false });
                        if (this.valueChange instanceof Function) {
                            this.valueChange(false);
                        }
                    }}>
                        <Text style={styles.xLabel}>X</Text>
                    </TouchableOpacity>
                    <View style={styles.animationContainer}>
                        <LottieView
                            ref={animation => this.animation = animation}
                            loop={false}
                            autoPlay={true}
                            style={{ width: (this.props.paymentError || this.props.method === 'boleto') ? responsiveWidth(25) : responsiveWidth(100) , height: (this.props.paymentError || this.props.method === 'boleto') ? responsiveWidth(25) : responsiveWidth(100), marginBottom: 10 }}
                            source={this.props.paymentError ? 
                            require('../assets/animations/error.json') : this.props.method === 'debit' || this.props.method === 'credit' ? 
                            require('../assets/animations/4930-checkbox-animation.json') : require('../assets/animations/boleto.json')
                            }
                        />
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 20, }}>
                        <Text style={styles.mainTitle}>{this.state.title}</Text>
                    </View>
                    <View style={{ marginTop: 5, paddingHorizontal: 15 }} >
                        <Text style={{ color: COLOR.GREY, textAlign: 'center', fontSize: FONT.SMALL, paddingBottom: 20 }}>{this.state.subtitle}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {this.telaPremium()}}
                        style={styles.mainBtn}>
                        <Text style={styles.mainBtnLabel}>{this.state.btnText}</Text>
                    </TouchableOpacity>
                        
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainBtnLabel:{
        color: COLOR.WHITE,
        fontSize: FONT.SMALL,
        textAlign: 'center',
        fontWeight: WEIGHT.FAT
    },
    mainBtn: {
        backgroundColor: COLOR.SECONDARY,
        borderRadius: 6,
        marginVertical:20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 15,
    },
    component: { position: 'absolute', zIndex: 10000, justifyContent: 'center', alignItems: 'center', top: 0, bottom: '5%', left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", height},

    wholeContent: { justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'white', width: responsiveWidth(85), borderRadius: 5},

    close: { position: 'absolute', right: '5%', top: '5%', zIndex: 100, height: responsiveWidth(10), width: responsiveWidth(6) },

    xLabel: { color: COLOR.SECONDARY, fontSize: responsiveFontSize(2.7), fontWeight: '600' },

    mainTitle: { color: COLOR.GREY, width: '100%', marginBottom: 10, fontWeight: WEIGHT.FAT, fontSize: responsiveFontSize(2.3), justifyContent: 'center', textAlign: 'center' },

    animationContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, },

})