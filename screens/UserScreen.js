import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import App from '../App';

export default class UserScreen extends React.Component {
  static navigationOptions = {
    title: 'Account Info',
    //headerLeft: navigate back to home screen
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      otherUser: false,
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    if (params) {
      const otherUser = params.otherUser;
      this.setState({ otherUser: true, curuser: otherUser });
    } else {
      var data_ref = firebase
        .database()
        .ref('users/' + firebase.auth().currentUser.uid);
      data_ref.on('value', snapshot => {
        this.setState({ curuser: snapshot.val(), loading: false });
      });
    }
  }

  onLogoutPress() {
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
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Text style={styles.info}>
                  {this.state.curuser.first_name} {this.state.curuser.last_name}
                </Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Name</Text>
                <Text style={styles.info}>{this.state.curuser.email}</Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Email</Text>
                {/*<Text style={styles.info}>
                  {this.state.curuser.phone_number}
                </Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Phone Number</Text>*/}
                <Text style={styles.info}>{this.state.curuser.zip}</Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Location</Text>
                {!this.state.otherUser ? (
                  <TouchableOpacity onPress={this.onLogoutPress.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Log Out</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </React.Fragment>
            )}
          </View>
          {/*Add change password and edit button here*/}
        </LinearGradient>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height,
  },
  info: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  generic: {
    fontSize: 12,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    color: '#E8E8E8',
  },
  line: {
    backgroundColor: '#E8E8E8',
    height: 1,
    width: '90%',
    alignSelf: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.1,
    marginBottom: Dimensions.get('window').height * 0.1,
    alignSelf: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
