import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../navigation/NavigationService';

class LoadingScreen extends React.Component {
  static navigationOptions = {
    title: 'Loading',
    header: null,
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'HomeScreen' : 'LoginScreen');
    });
    //NavigationService.navigate(user ? 'Homescreen' : 'LoginScreen')
  }

  componentWillUnmount() {}

  render() {
    return (
      <LinearGradient
        colors={['#5B4FFF', '#51FFE8']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.container}>
          <Text style={styles.info}>Loading</Text>
          <ActivityIndicator size="large" color="white" />
        </View>
      </LinearGradient>
    );
  }
}

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontSize: 18,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
