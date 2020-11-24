import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Image, Dimensions, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Provider } from 'react-redux';
import OneSignal from 'react-native-onesignal'; 
import BottomTabNavigator  from './src/navigation/BottomTabNavigator';
import createRootNavigator from './src/navigation/StackNavigator';
import MessageScreen from './src/components/MessageScreen';
import { Store } from './src/store/index';
import Events from './src/utils/Events';
import LoadReducer from './src/components/LoadReducers';
import { getApi } from './src/environments/config';


const { width, height } = Dimensions.get('window');
const Stack = createStackNavigator();
const server = getApi('api');
var appId = 'e64cdb2b-0208-4a41-8dfc-ba4be06760c3';
var requiresPrivacyConsent = true;

LogBox.ignoreLogs(['Warning: Cannot update a component from inside the function body of a different component.', "Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method."]);
class App extends Component {

    constructor(props) {
      super(props);
      this.state = {
        signIn: false,
        error: false,
		isPrivacyConsentLoading: requiresPrivacyConsent,
      }
      // Log level logcat is 6 (VERBOSE) and log level alert is 0 (NONE)
      OneSignal.setLogLevel(6, 0);

      // Share location of device
      OneSignal.setLocationShared(true);

      OneSignal.setRequiresUserPrivacyConsent(requiresPrivacyConsent);
      OneSignal.init(appId, {
          kOSSettingsKeyAutoPrompt: true,
      });
      // Notifications will display as NOTIFICATION type
      OneSignal.inFocusDisplaying(2);

      // If the app requires privacy consent check if it has been set yet
      if (requiresPrivacyConsent) {
      // async 'then' is only so I can sleep using the Promise helper method
        //   OneSignal.userProvidedPrivacyConsent().then(async (granted) => {
              // For UI testing purposes wait X seconds to see the loading state
            //   await sleep(0);

            //   console.log('Privacy Consent status: ' + granted);
            //   this.setState({hasPrivacyConsent:granted, isPrivacyConsentLoading:false});
        //   });
      }

      OneSignal.getPermissionSubscriptionState((response) => {
          console.log('Device state:');
          console.log(response);

          let notificationsEnabled = response['notificationsEnabled'];
          let isSubscribed = response['subscriptionEnabled'];

          this.setState({isSubscribed:notificationsEnabled && isSubscribed, isSubscriptionLoading:false}, () => {
              OneSignal.setSubscription(isSubscribed);
          });
      }); 
    }

    async componentDidMount() {
      OneSignal.addEventListener('received', this.onNotificationReceived);
      OneSignal.addEventListener('opened', this.onNotificationOpened);
      OneSignal.addEventListener('ids', this.onIdsAvailable);
      // OneSignal.addEventListener('subscription', this.onSubscriptionChange);
      // OneSignal.addEventListener('permission', this.onPermissionChange);
      OneSignal.addEventListener('emailSubscription', this.onEmailSubscriptionChange);
      OneSignal.addEventListener('inAppMessageClicked', this.onInAppMessageClicked);
    
      this.refreshEvent = Events.subscribe('RefreshRouters', async () => { 
        const logged = await AsyncStorage.getItem("logged");
        this.setState({ signIn: !this.state.signIn })
      });
      this.checkUpdate();
      // await AsyncStorage.removeItem("cidade")
      
      const data = await AsyncStorage.multiGet(["user", "token", "logged", "cidade"]);

      this.setState({ready: true, signIn: data[2][1] ? JSON.parse(data[2][1]) : false, user: data[0][1] ? JSON.parse(data[0][1]) : null, token: data[1][1], cidade: data[3][1]})
    }

    componentWillUnmount() {
		OneSignal.removeEventListener('received', this.onNotificationReceived);
		OneSignal.removeEventListener('opened', this.onNotificationOpened);
		OneSignal.removeEventListener('ids', this.onIdsAvailable);
		// OneSignal.removeEventListener('subscription', this.onSubscriptionChange);
		// OneSignal.removeEventListener('permission', this.onPermissionChange);
		OneSignal.removeEventListener('emailSubscription', this.onEmailSubscriptionChange);
		OneSignal.removeEventListener('inAppMessageClicked', this.onInAppMessageClicked);
    }

    async checkUpdate() {
		try {
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				this.setState({ update: true, ready: false });
				await Updates.fetchUpdateAsync();
				Updates.reloadFromCache();
			}
			else {
				this.setState({ ready: true });
			}
		} catch (e) {
			this.setState({ ready: true });
		}
  	}
	
	onNotificationReceived = (notification) => {
        console.log('Notification received: ', notification);

        let debugMsg = 'RECEIVED: \n' + JSON.stringify(notification, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }

    /**
     When a notification is opened this will fire
     The openResult will contain information about the notification opened
     */
    onNotificationOpened = (openResult) => {
        console.log('Message: ', openResult.notification.payload.body);
        console.log('Data: ', openResult.notification.payload.additionalData);
        console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);

        let debugMsg = 'OPENED: \n' + JSON.stringify(openResult.notification, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }

    /**
     Once the user is registered/updated the onIds will send back the userId and pushToken
        of the device
     */
    onIdsAvailable = (device) => {
        console.log('Device info: ', device);
        // Save the userId and pushToken for the device, important for updating the device
        //  record using the SDK, and sending notifications
        this.setState({
            userId: device.userId,
            pushToken: device.pushToken
        });
    }

	onSubscriptionChange = (change) => {
        console.log('onSubscriptionChange: ', change);
    }

    /**
     TODO: Needs to be implemented still in index.js and RNOneSignal.java
     */
    onPermissionChange = (change) => {
        console.log('onPermissionChange: ', change);
    }

    /**
     Success for the change of state for the email record? or setting subscription state of email record (so logging out)?
     TODO: Validate functionality and make sure name is correct
        Should match the onSubscriptionChange and

     TODO: Validate this is working, might be broken after changing name
     */
    onEmailSubscriptionChange = (change) => {
        console.log('onEmailSubscriptionChange: ', change);
        this.setState({isEmailLoading:false});
    }

    /**
     When an element on an IAM is clicked this will fire
     The actionResult will contain information about the element clicked
     */
    onInAppMessageClicked = (actionResult) => {
        console.log('actionResult: ', actionResult);

        let debugMsg = 'CLICKED: \n' + JSON.stringify(actionResult, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }


    render() {
        if (this.state.ready) {
            return (
              <Provider store={Store} >
                  <View style={styles.container}>
                    <LoadReducer city={this.state.cidade}/>
                    {!this.state.signIn ? 
                      <NavigationContainer style={styles.container} ref={this.containerRef} >
                        <Stack.Navigator>
                          <Stack.Screen name="Root"  component={createRootNavigator} />
                        </Stack.Navigator>
                      </NavigationContainer>
                      :
                      <NavigationContainer ref={this.containerRef}>
                        <Stack.Navigator>
                          <Stack.Screen name="Root" component={BottomTabNavigator} city={this.state.cidade} token={this.state.token} user={this.state.user} />
                        </Stack.Navigator>
                      </NavigationContainer>
                    }
                  </View>
              </Provider>
            );
        } else if (this.state.error)
            return (
                <MessageScreen message={'Ocorreu um erro durante a atualização, reinicie o Rota Gourmet.'} />
            );
        else if (this.state.update)
            return (
                <MessageScreen indicator={true} message={'Aguarde enquanto atualizamos o Rota Gourmet.'}
                    message2={'Caso o processo dure mais de 3 minutos, tente utilizar outra conexão.'} />
            );
        else return (
          <View style={styles.container}>
            <Image source={require('./src/assets/images/Splash_pic.png')} resizeMode="contain" style={{width, height}} />
          </View>
        );
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
  },
});

export default App;
