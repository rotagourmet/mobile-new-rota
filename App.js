import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Image, Dimensions } from 'react-native';
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

function myiOSPromptCallback(permission){
    // do something with permission value
}
class App extends Component {

    constructor(props) {
      super(props);
      OneSignal.setLogLevel(6, 0);
      // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
      OneSignal.init("e64cdb2b-0208-4a41-8dfc-ba4be06760c3", {kOSSettingsKeyAutoPrompt : false, kOSSettingsKeyInAppLaunchURL: false, kOSSettingsKeyInFocusDisplayOption:2});
      OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.
      
      // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
      OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

      OneSignal.addEventListener('received', this.onReceived);
      OneSignal.addEventListener('opened', this.onOpened);
      OneSignal.addEventListener('ids', this.onIds);

      this.state = {
        signIn: false,
        error: false
      }
    }

    async componentDidMount() {
      OneSignal.removeEventListener('received', this.onReceived);
      OneSignal.removeEventListener('opened', this.onOpened);
      OneSignal.removeEventListener('ids', this.onIds);
      this.refreshEvent = Events.subscribe('RefreshRouters', async () => { 
        const logged = await AsyncStorage.getItem("logged");
        this.setState({ signIn: !this.state.signIn })
      });
      this.checkUpdate();
      // await AsyncStorage.removeItem("cidade")
      
      const data = await AsyncStorage.multiGet(["user", "token", "logged", "cidade"]);

      this.setState({ready: true, signIn: data[2][1] ? JSON.parse(data[2][1]) : false, user: data[0][1] ? JSON.parse(data[0][1]) : null, token: data[1][1], cidade: data[3][1]})
    }

  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
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
