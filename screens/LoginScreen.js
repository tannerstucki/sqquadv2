import React from 'react';
import * as firebase from 'firebase';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../navigation/NavigationService';

class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login',
    header: null,
  };

  state = {
    email: '',
    password: '',
  };

  componentDidMount() {}

  componentWillUnmount() {}

  onLoginPress() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(function(firebaseUser) {
        NavigationService.navigate('HomeScreen');
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });
  }

  openRegister() {
    NavigationService.navigate('RegisterScreen');
  }

  render() {
    return (
      <LinearGradient
        colors={['#5B4FFF', '#D616CF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}>
        <ScrollView style={styles.fill}>
          <Image
            style={styles.logo}
            source={require('../assets/BigWhite.png')}
          />
          <TextInput
            style={styles.user_input}
            placeholder="Email"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
          <TextInput
            style={styles.user_input}
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
          <TouchableOpacity onPress={this.onLoginPress.bind(this)}>
            <View style={styles.customButton}>
              <Text style={styles.buttonText}>Login</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.openRegister.bind(this)}>
            <Text style={styles.linkText}>Don't have an account yet?</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  fill: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: Dimensions.get('window').height * 0.1,
  },
  logo: {
    height: Dimensions.get('window').height * 0.2,
    width: Dimensions.get('window').height * 0.2,
    alignSelf: 'center',
    margin: 20,
  },
  user_input: {
    height: 40,
    width: 250,
    borderColor: 'lightgrey',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    margin: 10,
    padding: 10,
    alignSelf: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').height * 0.25,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  linkText: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
    margin: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
