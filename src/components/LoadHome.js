import React, { useEffect, useState } from 'react';
import { 
	View, 
	Platform,
	AsyncStorage 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
// EXPO IMPORTS 
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getApi } from '../environments/config';
import Events from '../utils/Events';
// CONSTS DECLARING
const server = getApi('api');

const LoadHome = ({  }) => {

	const [city, setCity] = useState("");
	const [user, setUser] = useState({});

	let userData = useSelector(state => state.AuthReducer.userData);
	let userToken = useSelector(state => state.AuthReducer.userToken);
	const dispatch = useDispatch()

	useEffect(() => {
		Events.subscribe('UpdateSelectedCity', () => { 
            configSelectedCity();
			loadSubscriptionData();
        });
        Events.subscribe('UpdateVouchers', () => { 
			configSelectedCity();
        });
        Events.subscribe('RefreshRouters', () => { 
            configSelectedCity();
        });
		configSelectedCity();
		loadSubscriptionData();
		listCategory();
		loadSubscriptionData();
	}, []);


    function configSelectedCity(){
        AsyncStorage.getItem("cidade").then((response) => {
            if(response){
                setCity(response);
                listAll(response);
            }
        })
    }

	async function listAll(city){
		userToken = await userToken;
		userData = await userData
		if (typeof userData == 'string' || userData instanceof String){
			userData = await JSON.parse(userData);
		}
		console.log('userData BEFORE', userData);
		let infos = {
			"user": userData && userData._id,
			"city": city,
            "os": Platform.OS,
            "version": Platform.Version,
            "appVersion": Constants.manifest.version,
            "model": Constants.dmomenteviceName,
		}
		console.log(server.url + `api/apphome?token=${userToken}`);
		//Requisição de listar todas as infos necessárias para iniciar o App
		let response = await fetch(server.url + `api/apphome?token=${userToken}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(infos)
		});
		response = await response.json();
		
		dispatch({type: 'STORAGE_RESTAURANTS', restaurantesList: response.restaurantes});
		dispatch({type: 'STORAGE_USER_DATA', userData: response.user});
		dispatch({type: 'STORAGE_VOUCHERS', vouchers: response.vouchers});
		Events.publish("LoadRestaurants");
		Events.publish("LoadVouchers");
		Events.publish("LocationLoaded");
		Events.publish("UpdateCityName");
	}

	async function loadSubscriptionData(){
		userToken = await userToken;
		userData = await userData
		if (typeof userData == 'string' || userData instanceof String){
			userData = await JSON.parse(userData);
		}
        if (userData && userData._id) {
            //Requisição de Search for Subscription
            let response = await fetch(server.url + `api/subscription/listByUser/${userData._id}?token=${userToken}`);
            response = await response.json();
			console.log('response loadSubscriptionData', response);
            if (!response.error) {
				dispatch({type: 'STORAGE_SUBSCRIPTION', user: response.subscription});
            }
        }
    }

	async function listCategory(){
        //Requisição de Lista categorias
        let response = await fetch(server.url + `category/list`);
        response = await response.json();
        if (response.error) {
			dispatch({type: 'STORAGE_CATEGORIAS', categorias: null});
        } else {
			dispatch({type: 'STORAGE_CATEGORIAS', categorias: response.category});
        }
    }

    return <View />;
}

export default LoadHome;