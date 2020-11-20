import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Restaurant from '../screens/Restaurant';
import CloseToMe from '../screens/CloseToMe';
const Stack = createStackNavigator();

export default function SearchStack({ navigation, route }) {
    navigation.setOptions({ headerShown: false, });
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={CloseToMe}>
            <Stack.Screen name="CloseToMe" component={CloseToMe} />
            <Stack.Screen name="Restaurant" component={Restaurant} />
        </Stack.Navigator>
    );
}