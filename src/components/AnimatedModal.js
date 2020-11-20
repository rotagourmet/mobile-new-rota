import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import Theme from '../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
import Events from '../utils/Events';
import { getApi } from '../environments/config'
import SelectCity from '../components/SelectCity'


const { height } = Dimensions.get('window')

const Modal = ({ show, close, title }) => {
    
    const [state, setState] = useState({
        opacity: new Animated.Value(0),
        container: new Animated.Value(height),
        modal: new Animated.Value(height),
    })

    const openModal = () => {
        
        Animated.sequence([
            Animated.timing(state.container, { toValue: 0, duration: 100,useNativeDriver: true }),
            Animated.timing(state.opacity, { toValue: 1, duration: 300,useNativeDriver: true }),
            Animated.spring(state.modal, { toValue: 0, bounciness: 5, useNativeDriver: true })
        ]).start()
    }

    const closeModal = () => {
        Animated.sequence([
            Animated.timing(state.modal, { toValue: height, duration: 250, useNativeDriver: true }),
            Animated.timing(state.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(state.container, { toValue: height, duration: 100, useNativeDriver: true })
        ]).start()
    }

    useEffect(() => {
        let isMounted = true; 
        if (isMounted){

            if(show){
                openModal()
            }else{
                closeModal()
                show = false
            }
        }

        return () => { isMounted = false };
    }, [show])


    return( 
        <Animated.View style={[styles.container, {zIndex: 3, opacity: state.opacity, transform: [ { translateY: state.container } ] }]} >
            <Animated.View style={[styles.modal, { transform: [ { translateY: state.modal } ] }]}>
            <View style={{flex: 0.1}}>
                <View style={styles.arrowClose}>
                    <View style={{flex:12}}>
                        <Text style={styles.txtCity}>{title}</Text>
                    </View>
                </View>
                <View style={styles.indicator} >
                    <TouchableOpacity style={styles.arrowDown} onPress={close}>
                        <Icon name='chevron-down' type='font-awesome' color={COLOR.PRIMARY} size={20} />
                    </TouchableOpacity>
                </View>
            </View>
                <SelectCity onCloseProps={(onClose) => {  close() }} />
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    arrowDown: {
        paddingHorizontal: 10, 
        paddingBottom: 20, 
        flex: 1
    },
    arrowClose: {
        position: 'absolute',
        top: '50%',
        left: '40%',
        right: '40%',
    },
    txtCity: {
        fontSize: FONT.MEDIUM,
        fontWeight: WEIGHT.FAT,
        color: COLOR.GREY,
        // textAlign: 'center'
    },
    indicator: {
        flex: 1,
        // justifyContent: 'space-between',
        alignItems: 'flex-start',
        top: '50%',
        marginLeft: 25,
        marginRight: 25
    },
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute'
    },
    modal: {
        bottom: -40,
        position: 'absolute',
        height: '80%',
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        
    },

    text: {
        marginTop: 50,
        textAlign: 'center'
    },
});

export default Modal