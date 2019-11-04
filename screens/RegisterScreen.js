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

class RegisterScreen extends React.Component {
  static navigationOptions = {
    title: 'Register',
    header: null,
  };

  state = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    zip: '',
  };

  componentDidMount() {}

  componentWillUnmount() {}

  onRegisterPress() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(result => {
        firebase
          .database()
          .ref('users/' + result.user.uid)
          .set({
            first_name: this.state.first_name.trim(),
            last_name: this.state.last_name.trim(),
            first_name_lower: this.state.first_name.toLowerCase().trim(),
            last_name_lower: this.state.last_name.toLowerCase().trim(),
            email: this.state.email.toLowerCase().trim(),
            zip: this.state.zip.trim(),
          });
      })
      .then(function() {
        NavigationService.navigate('HomeScreen');
      })
      .then(function() {
        alert(
          'Welcome to Squad! Create a squad or check out your invites to get started.'
        );
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });
  }

  openLogin() {
    NavigationService.navigate('LoginScreen');
  }

  render() {
    var isEnabled = 'false';
    var text_color = 'grey';
    if (
      (this.state.first_name.length > 0) &
      (this.state.last_name.length > 0) &
      (this.state.email.length > 0) &
      (this.state.zip.length > 0) &
      (this.state.password.length > 0)
    ) {
      isEnabled = '';
      text_color = 'white';
    }
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
            placeholder="First Name"
            onChangeText={first_name => this.setState({ first_name })}
            value={this.state.first_name}
          />
          <TextInput
            style={styles.user_input}
            placeholder="Last Name"
            onChangeText={last_name => this.setState({ last_name })}
            value={this.state.last_name}
          />
          <TextInput
            style={styles.user_input}
            placeholder="Zip Code"
            onChangeText={zip => this.setState({ zip })}
            value={this.state.zip}
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
          <TouchableOpacity
            onPress={this.onRegisterPress.bind(this)}
            disabled={isEnabled}>
            <View style={styles.customButton}>
              <Text
                style={{
                  color: text_color,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Create Account
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.openLogin.bind(this)}>
            <Text style={styles.linkText}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }
}

export default RegisterScreen;

const styles = StyleSheet.create({
  fill: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
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
