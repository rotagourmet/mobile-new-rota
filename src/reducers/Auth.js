import { STORAGE_USER_DATA, STORAGE_USER_DATA2, STORAGE_TOKEN, STORAGE_CITY, STORAGE_RESTAURANTS } from '../actions/actionTypes'; 
import { AsyncStorage } from 'react-native'; 

const initialState = {
  userData: AsyncStorage.getItem("user"),
  userToken: AsyncStorage.getItem("token"),
  city: AsyncStorage.getItem("cidade"),
  restaurantesList: [],
};

export const Auth = (state = initialState, action) => {
  switch (action.type) {
    case STORAGE_USER_DATA:
      return {
        ...state,
        userData: action.userData
      };
    case STORAGE_TOKEN:
      return {
        ...state,
        userToken: action.userToken
      };
    case STORAGE_CITY:
      return {
        ...state,
        city: action.city
      };
    case STORAGE_RESTAURANTS:
      return {
        ...state,
        restaurantesList: action.restaurantesList
      };
    default:
      return state;
  }
};