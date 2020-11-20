import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Theme from '../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

export default class Input extends Component {

    valueChange;
    focusValue;
    onSubmit;

    constructor(props){
        super(props);
        this.state={
            value: this.props.value,
            focus: false,
        };
        this.valueChange = this.props.onChangeText;
        this.onSubmit = this.props.onSubmitEditing;
        this.focusValue = this.props.onFocusProps;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })

    }

    render () {
        const {borderColor, containerStyle, autoCapitalize, maxLength, editable, keyboardType, placeholder, placeholderTextColor, returnKeyType, value, textColor, ref, refs } = this.props;
        return (
            <View style={[containerStyle ? containerStyle : styles.container, {borderColor: borderColor ? borderColor : 'rgba(255, 255, 255, 0.6)'}]}>
                <TextInput 
                    ref={ref}
                    autoCapitalize={ autoCapitalize ? autoCapitalize : 'none'}
                    style={[styles.textInput, {color: textColor ? textColor : COLOR.WHITE}]}
                    editable={ editable }
                    keyboardType={keyboardType ? keyboardType : 'default'}
                    maxLength={maxLength ? maxLength : 50}
                    placeholder={placeholder ? placeholder : ''}
                    placeholderTextColor={placeholderTextColor ? placeholderTextColor : '#FFFFFF'}
                    returnKeyType={returnKeyType ? returnKeyType : 'none' }
                    value={this.state.value ? this.state.value : ''}
                    onSubmitEditing={() => {
                        if (this.onSubmit instanceof Function) {
                            this.onSubmit();
                        }
                    }}
                    onChangeText={texto => {
                        this.setState({ value: texto });
                        if (this.valueChange instanceof Function) {
                            this.valueChange(texto);
                        }
                    }}
                    onFocus={() => {
                        this.setState({ focus: true });
                        if (this.focusValue instanceof Function) {
                            this.focusValue(true);
                        }
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        width: '80%',
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 0.5,
        
    },
    textInput: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        fontSize: FONT.SMALL
    },
});
