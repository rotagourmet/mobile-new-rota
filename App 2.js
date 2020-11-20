import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Image, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import BottomTabNavigator  from './src/navigation/BottomTabNavigator';
import createRootNavigator from './src/navigation/StackNavigator';
import MessageScreen from './src/components/MessageScreen';
import { Store } from './src/store/index';
import Events from './src/utils/Events';
import LoadReducer from './src/components/LoadReducers';
import { getApi } from './src/environments/config'


const { width, height } = Dimensions.get('window');
const Stack = createStackNavigator();
const server = getApi('api');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
          signIn: false
        }
    }

    async componentDidMount() {
      
      this.refreshEvent = Events.subscribe('RefreshRouters', async () => { 
        const logged = await AsyncStorage.getItem("logged");
        this.setState({ signIn: !this.state.signIn })
      });
      this.checkUpdate();
      // await AsyncStorage.removeItem("cidade")
      
      const data = await AsyncStorage.multiGet(["user", "token", "logged", "cidade"]);

      this.setState({ready: true, signIn: data[2][1] ? JSON.parse(data[2][1]) : false, user: data[0][1] ? JSON.parse(data[0][1]) : null, token: data[1][1], cidade: data[3][1]})
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
