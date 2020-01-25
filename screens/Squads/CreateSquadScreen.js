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
  Easing,
  Animated,
} from 'react-native';
import Constants from 'expo-constants';
import { createStackNavigator } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenu from '../../components/BottomMenu';
import { Card } from 'react-native-paper';
import { default as UUID } from 'uuid';
import NavigationService from '../../navigation/NavigationService';
import HomeScreen from '.././HomeScreen';

export default class CreateSquadScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'New Squad',
      headerStyle: {
        backgroundColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.75,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: 'white',
      },
      headerRight: () => (
        <TouchableOpacity onPress={navigation.getParam('toggleDrawer')}>
          <Image
            style={{
              height: 30,
              width: 30,
              marginRight: Dimensions.get('window').width * 0.05,
            }}
            source={require('assets/icons/blue_menu.png')}
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.moveAnimation = new Animated.ValueXY({
      x: Dimensions.get('window').width,
      y: 0,
    });
    this.state = {
      id: '',
      name: '',
      description: '',
      zip: '',
      organizer_id: '',
      loading: true,
      curuser: '',
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    this.setState({
      organizer_id: firebase.auth().currentUser.uid,
      loading: false,
    });
  }

  onCreatePress() {
    var squad_post = firebase
      .database()
      .ref('squads/')
      .push({
        name: this.state.name.trim(),
        name_lower: this.state.name.toLowerCase().trim(),
        description: this.state.description,
        organizer_id: firebase.auth().currentUser.uid,
        zip: this.state.zip.trim(),
        status: 'active',
      })
      .then(snapshot => {
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid)
          .child('squads')
          .child(snapshot.key)
          .set({
            squad_id: snapshot.key,
          });

        firebase
          .database()
          .ref('squads/' + snapshot.key)
          .child('users')
          .child(firebase.auth().currentUser.uid)
          .set({
            user_id: firebase.auth().currentUser.uid,
            name:
              this.state.curuser.first_name +
              ' ' +
              this.state.curuser.last_name,
            status: 'active',
            points: 0,
          });

        firebase
          .database()
          .ref('threads/')
          .push({
            squad_id: snapshot.key,
            squad_name: this.state.name,
          })
          .then(snapshot => {
            firebase
              .database()
              .ref('users/' + firebase.auth().currentUser.uid)
              .child('threads')
              .child(snapshot.key)
              .set({
                thread_id: snapshot.key,
                unseen: 0,
              });

            firebase
              .database()
              .ref('messages/')
              .push({
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                text:
                  'Welcome to the SquadBoard of the ' +
                  this.state.name +
                  ' squad. This is a collaborative space for your squad.',
                thread: snapshot.key,
                user: {
                  _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                  name: 'Virtual Manager',
                },
              });
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

  toggleDrawer = () => {
    if (this.state.showDrawer === false) {
      this.setState({
        showDrawer: true,
      });
      Animated.spring(this.moveAnimation, {
        toValue: { x: 0, y: 0 },
      }).start();
    } else {
      this.setState({
        showDrawer: false,
      });
      Animated.spring(this.moveAnimation, {
        toValue: { x: Dimensions.get('window').width, y: 0 },
      }).start();
    }
  };

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
        <Animated.View
          style={[
            {
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height * 0.8,
              position: 'absolute',
            },
            this.moveAnimation.getLayout(),
          ]}>
          <BottomMenu curuser={this.state.curuser} action={this.toggleDrawer} />
        </Animated.View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height * .7,
    marginTop: Dimensions.get('window').height * 0.1,
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
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.34,
    //marginBottom: Dimensions.get('window').height * 0,
    alignSelf: 'center',
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
  },
});
