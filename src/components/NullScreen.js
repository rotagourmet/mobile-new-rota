import React, { Component } from 'react'; 
import { View, Text, StyleSheet } from 'react-native';

export default class NullScreen extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 

        }
    }

    render(){
        return(
            <View>

            </View>
        )
    }
}
const styles = StyleSheet.create({

});