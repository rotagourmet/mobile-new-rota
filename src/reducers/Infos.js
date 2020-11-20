import { AsyncStorage } from 'react-native'; 

import { 
  
  STORAGE_VOUCHERS, 
  STORAGE_CATEGORIAS, 
  STORAGE_FILTERS, 
  STORAGE_SELECTED_PLAN, 
  STORAGE_INPUTS, 
  STORAGE_LOCATIONS,
  STORAGE_SELECTED_CITY,
  STORAGE_CURRENT_SUBSCRIPTION,
  STORAGE_NAVIGATION,
  CURRENT_SCREEN,
  MODELO_DE_NEGOCIO,
  STORAGE_CURRENT_RESTAURANT,
  STORAGE_VOUCHER_INFO,
  STORAGE_RESTAURANTES_FILTRADOS,
  STORAGE_SUBSCRIPTION,
  STORAGE_CLOSE_TO_ME,
  
} from '../actions/actionTypes'; 
// import { AsyncStorage } from 'react-native'; 

const initialState = {
  vouchers: null,
  categorias: null,
  appliedFilters: null,
  selectedPLan: null,
  inputs: null,
  location: null,
  selectedCity: AsyncStorage.getItem("cidade"),
  currentSubscription: null,
  navigation: {},
  currentScreen: "Home",
  modeloNegocio: "Acompanhado",
  currentRestaurant: null,
  voucherInfo: null,
  restaurantFiltered: null,
  subscription: null,
  closeToMe: [],
};

export const Infos = (state = initialState, action) => {
  switch (action.type) {
    case STORAGE_VOUCHERS:
      return {
        ...state,
        vouchers: action.vouchers
      };
    case STORAGE_CATEGORIAS:
      return {
        ...state,
        categorias: action.categorias
      };
    case STORAGE_FILTERS:
      return {
        ...state,
        appliedFilters: action.appliedFilters
      };
    case STORAGE_SELECTED_PLAN:
      return {
        ...state,
        selectedPLan: action.selectedPLan
      };
    case STORAGE_INPUTS:
      return {
        ...state,
        inputs: action.inputs
      };
    case STORAGE_LOCATIONS:
      return {
        ...state,
        location: action.location
      };
    case STORAGE_SELECTED_CITY:
      return {
        ...state,
        selectedCity: action.selectedCity
      };
    case STORAGE_CURRENT_SUBSCRIPTION:
      return {
        ...state,
        currentSubscription: action.currentSubscription
      };
    case STORAGE_NAVIGATION:
      return {
        ...state,
        navigation: action.navigation
      };
    case CURRENT_SCREEN:
      return {
        ...state,
        currentScreen: action.currentScreen
      };
    case MODELO_DE_NEGOCIO:
      return {
        ...state,
        modeloNegocio: action.modeloNegocio
      };
    case STORAGE_CURRENT_RESTAURANT:
      return {
        ...state,
        currentRestaurant: action.currentRestaurant
      };
    case STORAGE_VOUCHER_INFO:
      return {
        ...state,
        voucherInfo: action.voucherInfo
      };
    case STORAGE_RESTAURANTES_FILTRADOS:
      return {
        ...state,
        restaurantFiltered: action.restaurantFiltered
      };
    case STORAGE_SUBSCRIPTION:
      return {
        ...state,
        subscription: action.subscription
      };
    case STORAGE_CLOSE_TO_ME:
      return {
        ...state,
        closeToMe: action.closeToMe
      };
    default:
      return state;
  }
};