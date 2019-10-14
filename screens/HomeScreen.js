import React from 'react';
import * as firebase from 'firebase';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import App from '../App';
import BottomMenu from '../components/BottomMenu';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
    headerLeft: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
    };
  }

  componentDidMount() {
    var userId = firebase.auth().currentUser.uid;
    return firebase
      .database()
      .ref('/users/' + userId)
      .once('value')
      .then(snapshot => {
        var curuser =
          (snapshot.val()) || 'Anonymous';
        this.setState({ curuser: curuser, loading: false });
      });
  }

  onLogOutPress() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        alert('Sign out successful.');
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });

    App.reload();
  }

  render() {
    const cur = firebase.auth().currentUser.uid;
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white"/>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Text style={styles.info}>
                  Let's Get It, {this.state.curuser.first_name}
                </Text>
                <Text onPress={this.onLogOutPress.bind()}>Logout</Text>
              </React.Fragment>
            )}
          </View>
        </LinearGradient>
        <BottomMenu curuser={this.state.curuser} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height * 0.8,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 18,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
