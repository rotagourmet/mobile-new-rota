import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import LottieView from "lottie-react-native";
import { responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
const { width, height } = Dimensions.get('window');
export default class Setup extends Component {


    render(){
        return(
            <View style={{flex: 1,}}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 12, position: 'relative'}}>
                    <Image source={require('../assets/images/2dourado.png')} style={{height: 80, width: 80}}/>
                    {/* <Text style={{fontSize: 25, textAlign: 'center', fontWeight: '300',}}>Olá!</Text> */}
                    <LottieView
                            ref={animation => this.animation = animation}
                            loop={true}
                            autoPlay={true}
                            style={styles.locationImage}
                            source={require('../assets/animations/25516-cooking.json')}
                    />
                    <Text style={{fontSize: 18, color: 'grey', textAlign: 'center', fontWeight: '300', padding: 20}}>Estamos realizando configurações para melhor lhe atender. Tente mais tarde</Text>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    locationImage: {
        marginVertical: responsiveHeight(3),
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(25),
        width: responsiveHeight(25),
    },

});