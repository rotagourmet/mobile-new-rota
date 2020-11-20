
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import LottieView from "lottie-react-native";
import Theme from '../constants/Theme';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

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
        return (
            <View style={styles.component}>
                <View style={[styles.wholeContent, { height: this.props.boxSize ? this.props.boxSize : responsiveWidth(100)}, ]}>
                    <TouchableOpacity style={styles.close} onPress={() => {
                        this.setState({ modalVisible: false });
                        if (this.valueChange instanceof Function) {
                            this.valueChange(false);
                        }
                    }}>
                        {/* <Text style={styles.xLabel}>X</Text> */}
                    </TouchableOpacity>
                    {/* <View style={styles.animationContainer}>
                        <LottieView
                            ref={animation => this.animation = animation}
                            loop={true}
                            autoPlay={true}
                            style={{ width: responsiveWidth(50), height: responsiveWidth(50), marginBottom: 10 }}
                            source={require('../images/animations/1712-bms-rocket.json')}
                        />
                    </View> */}
                    <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 20, }}>
                        <Text style={styles.mainTitle}>{this.state.title}</Text>
                    </View>
                    <View>
                        <View>
                            <View style={{ marginTop: 15, paddingHorizontal: 5 }} >
                                <Text style={{ color: COLOR.GREY, textAlign: 'center', fontSize: FONT.SMALL, paddingBottom: 20 }}>{this.state.subtitle}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: '#d0d0d0'  }}>

                            <TouchableOpacity onPress={() => {this.telaPremium()}}
                            style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 10, paddingHorizontal: 90 }}>
                            <Text style={{ color: COLOR.GREY, fontWeight: WEIGHT.FAT, fontSize: responsiveFontSize(2.3)}}>{this.state.btnText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    component: { position: 'absolute', zIndex: 10, justifyContent: 'center', alignItems: 'center', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)" },

    wholeContent: { justifyContent: 'center', alignItems: 'stretch', backgroundColor: 'white', borderRadius: 0, width: responsiveWidth(80), borderRadius: 10},

    close: { position: 'absolute', right: '5%', top: '5%', zIndex: 100, height: responsiveWidth(10), width: responsiveWidth(6) },

    xLabel: { color: COLOR.GREY, fontSize: responsiveFontSize(2.7), fontWeight: '600' },

    mainTitle: { color: COLOR.GREY, width: '100%', marginBottom: 10, fontWeight: WEIGHT.FAT, fontSize: responsiveFontSize(2.3), justifyContent: 'center', textAlign: 'center' },

    animationContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, },

})