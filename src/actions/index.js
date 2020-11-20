import { 
  CLICK_UPDATE_VALUE, 
  STORAGE_USER_DATA, 
  STORAGE_TOKEN, 
  STORAGE_CITY, 
  STORAGE_RESTAURANTS, 
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
} from './actionTypes';

// Aqui a função é a Action Creator
export const clickButton = value => ({
  type: CLICK_UPDATE_VALUE,
  newValue: value
});

export const storageUserData = value => ({
  type: STORAGE_USER_DATA,
  userData: value
});

export const storageUserToken = value => ({
  type: STORAGE_TOKEN,
  userToken: value
});

export const storageCity = value => ({
  type: STORAGE_CITY,
  city: value
});

export const storageRestaurants = value => ({
  type: STORAGE_RESTAURANTS,
  restaurantesList: value
});

export const storageVouchers = value => ({
  type: STORAGE_VOUCHERS,
  vouchers: value
});

export const storageCategorias = value => ({
  type: STORAGE_CATEGORIAS,
  categorias: value
});

export const storageFiltros = value => ({
  type: STORAGE_FILTERS,
  appliedFilters: value
});

export const selectedPlanStorage = value => ({
  type: STORAGE_SELECTED_PLAN,
  selectedPLan: value
});

export const storageInputs = value => ({
  type: STORAGE_INPUTS,
  inputs: value
});

export const storageLocation = value => ({
  type: STORAGE_LOCATIONS,
  location: value
});

export const storageSelectedCity = value => ({
  type: STORAGE_SELECTED_CITY,
  selectedCity: value
});

export const storageCurrentSubscription = value => ({
  type: STORAGE_CURRENT_SUBSCRIPTION,
  currentSubscription: value
});

export const storageNavigation = value => ({
  type: STORAGE_NAVIGATION,
  navigation: value
});

export const setCurrentScreen = value => ({
  type: CURRENT_SCREEN,
  currentScreen: value
});

export const modeloNegocioStorage = value => ({
  type: MODELO_DE_NEGOCIO,
  modeloNegocio: value
});

export const setCurrentRestaurant = value => ({
  type: STORAGE_CURRENT_RESTAURANT,
  currentRestaurant: value
});

export const storageVoucherInfo = value => ({
  type: STORAGE_VOUCHER_INFO,
  voucherInfo: value
});

export const storageRestaurantFiltered = value => ({
  type: STORAGE_RESTAURANTES_FILTRADOS,
  restaurantFiltered: value
});

export const storageSubscription = value => ({
  type: STORAGE_SUBSCRIPTION,
  subscription: value
});

export const storageCloseToMe = value => ({
  type: STORAGE_CLOSE_TO_ME,
  closeToMe: value
});
