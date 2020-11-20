import React, { Component } from 'react'; 
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import SkeletonContent from "react-native-skeleton-content";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
const { width, height } = Dimensions.get('window');
import Theme from '../constants/Theme';


const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
export default class SkeletonContentHome extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }

    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    render(){
        return(
            <View style={{ position: 'absolute', zIndex: 1,}}>
                <SkeletonContent
                    containerStyle={{flex: 1, paddingTop: 10 + responsiveHeight(13), flexDirection: 'row', marginLeft: 20}}
                    animationDirection="horizontalRight"
                    layout={[
                        { width: width/3, height: FONT.XMLARGE + 10, marginTop: responsiveHeight(2.1) },
                    ]}
                    isLoading={true}>
                ></SkeletonContent> 
                <SkeletonContent
                    containerStyle={{flex: 1, paddingTop: 18, flexDirection: 'row', marginLeft: 20}}
                    animationDirection="horizontalRight"
                    layout={[
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                    ]}
                    isLoading={true}>
                ></SkeletonContent> 
                
                <SkeletonContent
                    containerStyle={{flex: 1, paddingTop: 25, }}
                    animationDirection="horizontalRight"
                    layout={[
                        { width: width, height: 1, borderRadius: 8 },
                        { width: width - 40, height: 180,  marginTop: responsiveHeight(3.1), borderRadius: 8, marginHorizontal: 20},
                    ]}
                    isLoading={true}>
                ></SkeletonContent> 
                <SkeletonContent
                    containerStyle={{flex: 1, paddingTop: 35, marginLeft: 20}}
                    animationDirection="horizontalRight"
                    layout={[
                        { width: width, height: 1, borderRadius: 8 },
                        { width: width/3, height: FONT.XMLARGE + 10, marginTop: responsiveHeight(2.1) },
                    ]}
                    isLoading={true}>
                ></SkeletonContent> 
                <SkeletonContent
                    containerStyle={{flex: 1, paddingTop: 18, flexDirection: 'row', marginLeft: 20}}
                    animationDirection="horizontalRight"
                    layout={[
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                        { width: responsiveHeight(12), height: responsiveHeight(12), marginRight: 15, borderRadius: 8 },
                    ]}
                    isLoading={true}>
                ></SkeletonContent> 
            </View>
        )
    }
}
const styles = StyleSheet.create({

});