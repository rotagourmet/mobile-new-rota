import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image, StatusBar } from 'react-native';
import Theme from '../constants/Theme';
import { responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import StatusBarCustom from './StatusBarCustom';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;


export default class PageHeader extends Component {

    _isMounted = false;
    backValue;

    constructor(props) {
        super(props);
        this.state = { 

        }
        this.backValue = this.props.onPress;
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    onPress(){
        if (this.backValue instanceof Function) {
            this.backValue();
        }else {
            this.props.navigation.goBack();
        }
    }

    render(){
        return(
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={{ height: responsiveHeight(9) + getStatusBarHeight(), zIndex: 200 }}>
                    <StatusBarCustom color={this.props.statusBarColor}/>
                    <StatusBar barStyle={'dark-content'} />
                    <View style={styles.content}>

                        <TouchableOpacity onPress={() => this.onPress()} style={styles.btnBack}>
                            <View style={styles.containArrow}>
                                <Image source={this.props.arrow ? this.props.arrow : require('../assets/icons/arrow-back.png')} resizeMode='contain' style={{ width: responsiveWidth(3.5) }} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.contentTitle}>
                            <Text style={styles.txt}>{this.props.title}</Text>
                        </View>

                        <View style={styles.rightContent}/>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
const styles = StyleSheet.create({
    rightContent: { alignItems: 'center', justifyContent: 'center', flex: 0.15, alignSelf: 'stretch' },
    
    contentTitle:{ flexDirection: 'row', flex: 0.75, justifyContent: 'center', alignItems: 'center' },

    content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },

    containArrow: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },

    btnBack: {
        flex: 0.15, flexDirection: 'column', borderRightWidth: 3, borderColor: 'transparent' 
    },
    txt: {
        textAlign: 'center',
        color: COLOR.GREY, 
        fontWeight: WEIGHT.FAT, 
        fontSize: FONT.MEDIUM
    }

});