import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PerfilScreen from '../screens/Perfil'
import Plans from '../screens/Plans';
import Dados from '../screens/Dados';
import Faq from '../screens/Faq';
import EditPerfil from '../screens/EditPerfil';
import QueroParticipar from '../screens/QueroParticipar';
import MyPlan from '../screens/MyPlan';
import ChangePlan from '../screens/ChangePlan';
//TELAS ADMINISTRATIVAS
import EditarUnidade from '../admin/EditarUnidade';
import Restaurantes from '../admin/Restaurantes';
import About from '../screens/About';
import Indicar from '../screens/Indicar';
import CheckInRestaurants from '../screens/CheckInRestaurants';

const Stack = createStackNavigator();

export default function HomeStack({ navigation, route }) {
    navigation.setOptions({ headerShown: false, });
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={PerfilScreen}>
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Plans" component={Plans} />
            <Stack.Screen name="Dados" component={Dados} />
            <Stack.Screen name="EditPerfil" component={EditPerfil} />
            <Stack.Screen name="MyPlan" component={MyPlan} />
            <Stack.Screen name="ChangePlan" component={ChangePlan} />
            <Stack.Screen name="Faq" component={Faq} />
            <Stack.Screen name="QueroParticipar" component={QueroParticipar} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Indicar" component={Indicar} />
            <Stack.Screen name="CheckInRestaurants" component={CheckInRestaurants} />
            
            {/* FUNCOES ADMINISTRATIVAS */}
            <Stack.Screen name="Restaurantes" component={Restaurantes} />
            <Stack.Screen name="EditarUnidade" component={EditarUnidade} />
        </Stack.Navigator>
    );
}