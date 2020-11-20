import React, { Component } from 'react';
import { ActivityIndicator, Image, View,Text } from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

class MessageScreen extends Component {

  constructor(props) {
      super(props);
  
      this.state = {
          ready:false,
      }
  }

  componentDidMount(){  
    setTimeout(() => {
      if(this.props.message2)
        this.setState({message2:this.props.message2});
    }, 5000);
  }
    render() {
    
      return (
        <View style={{flex: 1, flexDirection:'column', justifyContent: 'space-between', alignItems: 'center',}}>
            <Image style={{ height:responsiveHeight(100), width: responsiveWidth(100), position: 'absolute', top:0, left:0 }} source ={require('../assets/images/fundo_login.png')} />
            <View style={{width:responsiveWidth(100),height:responsiveHeight(35)}}/>            
            <View style={{width:responsiveWidth(100),height:responsiveHeight(20),justifyContent:'center',alignItems:'center'}}>
              {this.props.indicator?<ActivityIndicator color='white' size='small'/>:null}
              <Text style={{color:'white',fontSize:responsiveFontSize(2.2),textAlign:'center',margin:10}}>{this.props.message}</Text>
            </View>
              {this.state.message2?<Text style={{color:'white',fontSize:responsiveFontSize(1.6),textAlign:'center',margin:10}}>{this.props.message2}</Text>:null}
            <View style={{width:responsiveWidth(100),height:responsiveHeight(20)}}>
            </View>
        </View>
      )
    }
}
export default MessageScreen;