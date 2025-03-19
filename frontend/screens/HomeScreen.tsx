import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, SafeAreaView, Image, ImageBackground} from 'react-native';
import background from '../assets/background.jpg'; // From figma first image user sees
import TitleCard from '../components/TitleCard.tsx' // For the border at the top and bottom



export default function HomeScreen() {
    return (
      <View className='flex-1'>
        <StatusBar hidden />
        <ImageBackground
        className='flex-1 justify-center'
        source={background}
        >
          <TitleCard title='BOGEY' location='top' />
          <TitleCard title='BROS' location='bottom'/>
          <View className='shadow-lg'>
            <Text className='text-center text-3xl font-bold text-white'>Welcome!</Text>
            <Text className='text-center text-3xl font-bold text-white'>Tap to continue</Text>
          </View>
        </ImageBackground>
      </View>
    );
}