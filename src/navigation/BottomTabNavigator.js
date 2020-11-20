import React, { useState } from 'react'
import { 
  Image, 
  View, 
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import HomeStack from './HomeStack'
import PerfilStack from './PerfilStack';
import HowToUse from '../screens/HowToUse';
import TabBarIcon from '../components/TabBarIcon';
import SearchStack from '..//navigation/SearchStack';
import Theme from '../constants/Theme';
import Events from '../utils/Events';
import CloseToMe from '../screens/CloseToMe';

const { COLOR } = Theme;
const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {

  const [opacity, setOpacity] = useState(1);
  
  navigation.setOptions({ headerShown: false, });

  let opacityBottomTabTrue = Events.subscribe('OpacityBottomTabTrue', () => { 
      setOpacity(1)
  });
  let opacityBottomTabFalse = Events.subscribe('OpacityBottomTabFalse', () => { 
      setOpacity(0)
  });

  function isIphoneX () {
    const iphoneXLength = 812
    const iphoneXSMaxLength = 896
    const windowDimensions = Dimensions.get('window')
    return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTVOS &&
    (windowDimensions.width === iphoneXLength ||
      windowDimensions.height === iphoneXLength ||
      windowDimensions.width === iphoneXSMaxLength ||
      windowDimensions.height === iphoneXSMaxLength)
    )
  }

  const DimensionsStyle = {
    safeAreaBottomHeight: Platform.OS === 'ios' && isIphoneX() ? 35 : 0
  }

  return (
    <BottomTab.Navigator style={{ opacity: 0}} tabBarOptions={{
        labelStyle:{fontSize: responsiveFontSize(1.4)},
        activeTintColor: COLOR.PRIMARY,
        style: [styles.mainStyle, 
        {
          height: opacity > 0 && DimensionsStyle && (DimensionsStyle.safeAreaBottomHeight || DimensionsStyle.safeAreaBottomHeight === 0) ?  DimensionsStyle.safeAreaBottomHeight + 55 : 20, 
          opacity: opacity, 
          paddingBottom: DimensionsStyle && (DimensionsStyle.safeAreaBottomHeight || DimensionsStyle.safeAreaBottomHeight === 0) ? DimensionsStyle.safeAreaBottomHeight + 2 : 5,
        }],
      }}
       initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Home"
        component={HomeStack}
        listeners={{
          tabPress: e => {
              Events.publish("UpdateScroll");
          },
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={focused ? "home_gold" : "home_grey"} name="md-home" />,
        }}
      />
      <BottomTab.Screen
        name="Busca"
        component={SearchStack}
        options={{
          title: 'Busca',
          tabBarIcon: ({ focused }) => (<TabBarIcon icon={focused ? "search_gold" : "search_grey"} name="md-search" />),
        }}
      />
        {/* <BottomTab.Screen
          name="CloseToMe"
          component={CloseToMe}
          options={{
            title: 'Perto de mim',
            tabBarIcon: ({ focused }) => (
              <View style={{position: 'absolute', bottom: '20%', backgroundColor: COLOR.SECONDARY, borderRadius: 30, height: responsiveWidth(13), width: responsiveWidth(13), justifyContent: 'center', alignItems: 'center'}}>
                {opacity > 0 ?
                    <Image source={require('../assets/icons/proximidade.png')} style={{height: responsiveWidth(8), width: responsiveWidth(8)}}/>
                : null}
              </View> 
            ),
          }}
      /> */}
      <BottomTab.Screen
        name="Como usar"
        component={HowToUse}
        options={{
          title: 'Como usar',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={focused ? "how_gold" : "how_grey"} name="md-help-circle-outline" />,
        }}
      />
      <BottomTab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={focused ? "user_gold" : "user_grey"} name="md-person" />,
        }}
      />
    </BottomTab.Navigator>
  );
}


const styles = StyleSheet.create({
  mainStyle:{
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: COLOR.BACKGROUND,
    borderTopWidth: 0,
    bottom: 0,
    position: 'absolute',
    shadowColor: "rgba(0, 0, 0, 0.6)",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  }
});