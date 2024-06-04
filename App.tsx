import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';


// import { Provider } from 'react-redux';
// import store from './src/redux/store';

const Stack = createNativeStackNavigator();

function App() {
  return (
    // <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator
       screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    // </Provider>
  );
}

export default App;