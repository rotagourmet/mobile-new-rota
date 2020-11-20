import React, {Component} from 'react';
import {Animated, TouchableOpacity, View, Image} from "react-native";
import Icon from '@expo/vector-icons/FontAwesome';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Events from '../utils/Events';

const SIZE = 68;
import Theme from '../constants/Theme';

const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
class AddButton extends Component {
    mode = new Animated.Value(0);
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            restaurant: false,   
        }
    }

    toggleView = () => {
        if (this.state.restaurant) {
            console.log('', );    
        }else{

        }

        Animated.timing(this.mode, {
            toValue: this.mode._value === 0 ? 1 : 0,
            duration: 300
        }).start();
    };
    
    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
        
    }

    render() {
        const firstX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [20, -40]
        });
        const firstY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30]
        });
        const secondX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 20]
        });
        const secondY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -55]
        });
        const thirdX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 80]
        });
        const thirdY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30]
        });
        const opacity = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });
        const rotation = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
        });



        return (
            <View style={{
                position: 'absolute',
                alignItems: 'center'
            }}>
                {/* <Animated.View style={{
                    position: 'absolute',
                    left: firstX,
                    top: firstY,
                    opacity
                }}>
                    <TouchableOpacity
                        onPress={() => {
                        }}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: SIZE / 2,
                            height: SIZE / 2,
                            borderRadius: SIZE / 4,
                            backgroundColor: COLOR.SECONDARY
                        }}
                    >
                        <Icon name="rocket" size={22} color="#F8F8F8"/>
                    </TouchableOpacity>
                </Animated.View> */}
                {/* <Animated.View style={{
                    position: 'absolute',
                    left: secondX,
                    top: secondY,
                    opacity
                }}>
                    <TouchableOpacity
                        onPress={() => {
                        }}
                        style={{
                            position: 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: SIZE / 2,
                            height: SIZE / 2,
                            borderRadius: SIZE / 4,
                            backgroundColor: COLOR.SECONDARY
                        }}
                    >
                        <Icon name="home" size={22} color="#F8F8F8"/>
                    </TouchableOpacity>
                </Animated.View> */}
                {/* <Animated.View style={{
                    position: 'absolute',
                    left: thirdX,
                    top: thirdY,
                    opacity
                }}>
                    <TouchableOpacity
                        onPress={() => {
                        }}
                        style={{
                            position: 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: SIZE / 2,
                            height: SIZE / 2,
                            borderRadius: SIZE / 4,
                            backgroundColor: COLOR.SECONDARY
                        }}

                    >
                        <Icon name="archive" size={22} color="#F8F8F8"/>
                    </TouchableOpacity>
                </Animated.View> */}
                <TouchableOpacity
                    onPress={() => this.toggleView()}
                    underlayColor={COLOR.PRIMARY}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE / 2,
                        backgroundColor: COLOR.SECONDARY
                    }}
                >
                    <Animated.View style={{ transform: [ {rotate: rotation} ] }}>
                        <Image source={ this.state.restaurant ? require('../assets/icons/qrcode.png') : require('../assets/icons/proximidade.png')} style={{height: 40, width: 40}}/>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }
}
export default AddButton;