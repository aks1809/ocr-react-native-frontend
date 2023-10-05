import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './Home';
import CameraPage from './Camera';

// Create a stack navigator
const Stack = createStackNavigator();

// Main component
export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ title: 'Home', headerShown: false }}
        />
        <Stack.Screen
          name="CapturePage"
          component={CameraPage}
          options={{ title: 'Capture Image', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
