import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, SafeAreaView, Image, ImageBackground} from 'react-native';
import background from './assets/background.jpg'; // From figma first image user sees
import "./global.css"; //Needed for tailwind

export default function App() {
  return (
    <View className='flex-1 justify-center items-center bg-gray-300'>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
    // <View style={styles.root}>
    //   <ImageBackground
    //   style={styles.container}
    //   source={background}
    // >
    //   <Text style={styles.welcomeCard}>Welcome Tap to continue</Text>
    // </ImageBackground>
    // </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   root: { flex: 1 },
//   welcomeCard: {
//     textAlign: 'center', 
//     fontSize: 24, 
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   droidSafeArea: {
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? 25 : 0
//   },

// });
