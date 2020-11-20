import React from 'react'; 
import { View } from 'react-native';
import Onboarding from '../screens/Onboarding';

const HowToUse = ({navigation}) => {
  return (
		<View style={{flex: 1, backgroundColor: '#F8F8FA'}}>
			<View style={{flex: 1,  bottom: '11%'}}>
				<Onboarding hideLastScreen={true} navigation={navigation}/>
			</View>
		</View>
  );
}

export default HowToUse;