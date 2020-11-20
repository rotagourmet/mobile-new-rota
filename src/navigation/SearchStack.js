import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Search from '../screens/Search'
import Restaurant from '../screens/Restaurant';

const Stack = createStackNavigator();

export default function SearchStack({ navigation, route }) {
    navigation.setOptions({ headerShown: false, });
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={Search}>
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="Restaurant" component={Restaurant} />
        </Stack.Navigator>
    );
}