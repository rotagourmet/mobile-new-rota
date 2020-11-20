
import { AsyncStorage } from 'react-native'
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

const Localization = {
    getCurrentLocation: async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        let form = {};
        if (status !== 'granted') {
            await AsyncStorage.setItem("locationPermission", "false");
            form = {
                errorMessage: 'Permission to access location was denied',
                locationPermission: false,
            };
            return form
        }

        await AsyncStorage.setItem("locationPermission", "true");
        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocodeAsync = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude});
        
        form = { location, localizacao: reverseGeocodeAsync[0], locationPermission: true };

        return form;
    },
}

export default Localization;