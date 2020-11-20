import React, { Component } from 'react';
import { View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

class StatusBarCustom extends Component {

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

    render() {
            return (
                <View style={{height:getStatusBarHeight(),backgroundColor: this.props.color ? this.props.color : 'transparent'}}/>
            )
    }
}
export default StatusBarCustom;