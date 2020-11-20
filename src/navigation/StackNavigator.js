import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login'
import Register from '../screens/Register'
import StartupApp from '../screens/StartupApp'
import Onboarding from '../screens/Onboarding'
const Stack = createStackNavigator();

export default function SingnedOutStack({ navigation, route }) {
	navigation.setOptions({ headerShown: false, });
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={Login}>
			<Stack.Screen name="Onboarding" component={Onboarding} />
			<Stack.Screen name="Register" component={Register} />
			<Stack.Screen name="StartupApp" component={StartupApp} />
			<Stack.Screen name="Login" component={Login} />
		</Stack.Navigator>
	);
}