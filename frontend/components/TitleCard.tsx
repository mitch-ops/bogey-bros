import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const CustomCard = ({ title, location }) => {
  const cardPosition = location === 'bottom' ? styles.bottom : styles.top;

  return (
    <View style={[styles.container, cardPosition]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenWidth,
    
    backgroundColor: '#434371',
    padding: 20,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 50,
  },
  top: {
    top: 0,
    paddingTop: Platform.OS === 'android' ? 0 : 45,
  },
  bottom: {
    bottom: 0,
  },
});

export default CustomCard;
