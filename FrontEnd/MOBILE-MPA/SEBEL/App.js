  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';

  import Loginform from './src/screens/Loginform';
  import Dashboard from './src/screens/Dashboard';
  import Tabungan from './src/screens/Tabungan';
  import NilaiSiswa from './src/screens/NilaiSiswa';
  import JadwalMengajar from './src/screens/JadwalMengajar';

  const Stack = createStackNavigator();

  export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          
          <Stack.Screen 
            name="Login" 
            component={Loginform} 
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="Dashboard" 
            component={Dashboard} 
            options={{ title: 'Menu Utama' }}
          />

          <Stack.Screen 
            name="Tabungan" 
            component={Tabungan} 
            options={{ title: 'Data Tabungan' }}
          />

          <Stack.Screen 
            name="NilaiSiswa" 
            component={NilaiSiswa} 
            options={{ title: 'Menu Utama' }}
          />

          <Stack.Screen 
            name="JadwalMengajar" 
            component={JadwalMengajar} 
            options={{ title: 'Menu Utama' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    );
  }