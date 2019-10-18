import React from 'react';
import * as firebase from 'firebase';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
        colors={['#5B4FFF', '#D616CF']}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
