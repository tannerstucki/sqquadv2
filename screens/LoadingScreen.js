import React from 'react';
import * as firebase from 'firebase';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import NavigationService from '../navigation/NavigationService';

class LoadingScreen extends React.Component {
  static navigationOptions = {
    title: 'Loading',
    header: null,
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'HomeScreen' : 'LoginScreen')
    })
      //NavigationService.navigate(user ? 'Homescreen' : 'LoginScreen')
  }

  componentWillUnmount(){}

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
      </View>
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