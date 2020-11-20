import * as React from 'react';
import { Image, View} from 'react-native';
import Colors from '../constants/Colors';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import home_gold from '../assets/icons/home_gold.png'
import home_grey from '../assets/icons/home_grey.png'
import search_gold from '../assets/icons/search_gold.png'
import search_grey from '../assets/icons/search_grey.png'
import user_gold from '../assets/icons/user_gold.png'
import user_grey from '../assets/icons/user_grey.png'
import how_gold from '../assets/icons/how_gold.png'
import how_grey from '../assets/icons/how_grey.png'

export default function TabBarIcon(props) {
  return (
    <Image
      style={{height: responsiveWidth(6), width:responsiveWidth(6)}}
      source={
        props.icon == "home_gold" ? home_gold : 
        props.icon == "home_grey" ? home_grey : 
        props.icon == "search_gold" ? search_gold : 
        props.icon == "search_grey" ? search_grey : 
        props.icon == "user_gold" ? user_gold : 
        props.icon == "user_grey" ? user_grey :
        props.icon == "how_gold" ? how_gold : how_grey
        }
    />
  );
}
