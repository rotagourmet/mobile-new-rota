import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home'
import Historic from '../screens/Historic'
import Plans from '../screens/Plans';
import Restaurant from '../screens/Restaurant';
import Dados from '../screens/Dados';
import Categories from '../screens/Categories';
import ConferirValidacao from '../screens/ConferirValidacao';
import Voucher from '../screens/Voucher'
import VoucherValidation from '../screens/VoucherValidation';
import VoucherValidated from '../screens/VoucherValidated';
const Stack = createStackNavigator();

export default function HomeStack({ navigation, route }) {
    navigation.setOptions({ headerShown: false, });
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={Home}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Historic" component={Historic} />
            <Stack.Screen name="Restaurant" component={Restaurant} />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="ConferirValidacao" component={ConferirValidacao} />
            <Stack.Screen name="Voucher" component={Voucher} />
            <Stack.Screen name="VoucherValidation" component={VoucherValidation} />
            <Stack.Screen name="VoucherValidated" component={VoucherValidated} />
        </Stack.Navigator>
    );
}