import * as React from 'react';
import * as firebase from 'firebase';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Button,
  Alert,
  Headers,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { createStackNavigator } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import NavigationService from '../navigation/NavigationService';
import HomeScreen from './HomeScreen';

export default class CreateSquadScreen extends React.Component {
  static navigationOptions = {
    title: 'Create New Squad',
  };

  constructor(props) {
    super(props);
    this.state = {
      id: '',
      name: '',
      description: '',
      zip: '',
      organizer_id: '',
      loading: true,
    };
  }

  componentDidMount() {
    this.setState({
      organizer_id: firebase.auth().currentUser.uid,
      loading: false,
    });
  }

  onCreatePress(curuser) {
    var squad_post = firebase
      .database()
      .ref('squads/')
      .push({
        name: this.state.name,
        description: this.state.description,
        organizer_id: firebase.auth().currentUser.uid,
        zip: this.state.zip,
      })
      .then(snapshot => {
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid)
          .child('squads')
          .push({
            squad_id: snapshot.key,
          });
      })
      .then(function() {
        NavigationService.navigate('MenuScreen');
      })
      .then(function() {
        alert(
          'Squad successfully created. Send out some invites and get rolling!'
        );
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });
  }

  render() {
    var isEnabled = 'false';
    var text_color = 'grey';
    if (
      (this.state.name.length > 0) &
      (this.state.description.length > 0) &
      (this.state.zip.length > 0)
    ) {
      isEnabled = '';
      text_color = 'white';
    }

    return (
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
              <TextInput
                style={styles.user_input}
                placeholder="Name"
                onChangeText={name => this.setState({ name })}
                value={this.state.name}
              />
              <TextInput
                style={styles.user_input}
                placeholder="Description"
                onChangeText={description => this.setState({ description })}
                value={this.state.description}
              />
              <TextInput
                style={styles.user_input}
                placeholder="Zip Code"
                onChangeText={zip => this.setState({ zip })}
                value={this.state.zip}
              />
              <TouchableOpacity
                onPress={this.onCreatePress.bind(this)}
                disabled={isEnabled}>
                <View style={styles.customButton}>
                  <Text
                    style={{
                      color: text_color,
                      fontSize: 18,
                      padding: 5,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    Create Squad
                  </Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          )}
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height,
    marginTop: Dimensions.get('window').height * 0.1,
  },
  user_input: {
    height: 40,
    width: 250,
    borderColor: 'darkgrey',
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    margin: 10,
    padding: 10,
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
});

//old onCreatePress
/*var squad_post = firebase
      .database()
      .ref('squads/')
      .push({
        name: this.state.name,
        description: this.state.description,
        organizer_id: firebase.auth().currentUser.uid,
        zip: this.state.zip,
      })
      .then(snapshot => {
        firebase
          .database()
          .ref('usersquad/')
          .push({
            user_id: firebase.auth().currentUser.uid,
            squad_id: snapshot.key,
          });
      })
      .then(function() {
        NavigationService.navigate('MenuScreen');
      })
      .then(function() {
        alert(
          'Squad successfully created. Send out some invites and get rolling!'
        );
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });*/
