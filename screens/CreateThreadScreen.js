import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { default as UUID } from 'uuid';
import NavigationService from '../navigation/NavigationService';

export default class CreateThreadScreen extends React.Component {
  static navigationOptions = {
    title: 'New Message',
    //headerLeft: navigate back to home screen
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      showSquadMessage: true,
      showUserMessage: false,
      found_squads: '',
      first_name: '',
      last_name: '',
      found_users: '',
    };
  }

  componentDidMount() {
    var user_data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });

    const rootRef = firebase.database().ref();
    const squadsRef = rootRef.child('squads');
    var squads = [];

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('squads');
    data_ref.once('value', snapshot => {
      if (snapshot.val() === null) {
        alert(
          "You don't belong to any squads. Create or join to start inviting friends!"
        );
      } else {
        snapshot.forEach(snapshot => {
          squadsRef
            .child(snapshot.val().squad_id)
            .orderByChild('name')
            .once('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;
              squads.unshift(item);
              this.setState({ found_squads: squads });
            });
        });
      }
    });
  }

  showSquadMessage() {
    this.setState({
      showSquadMessage: true,
      showUserMessage: false,
    });
  }

  showUserMessage() {
    this.setState({
      showSquadMessage: false,
      showUserMessage: true,
    });
  }

  chooseSquad(item) {
    const rootRef = firebase.database().ref();
    const threadsRef = rootRef.child('threads');
    threadsRef
      .orderByChild('squad_id')
      .equalTo(item.key)
      .once('value', snapshot => {
        NavigationService.navigate('ThreadScreen', {
          thread_id: Object.keys(snapshot.val())[0],
          threadName: Object.values(snapshot.val())[0].squad_name,
        });
      });
  }

  searchUser() {
    const rootRef = firebase.database().ref();
    const usersRef = rootRef.child('users');
    var found_users = [];
    var first_name = this.state.first_name;

    var data_ref = firebase
      .database()
      .ref('users/')
      .orderByChild('last_name_lower')
      .equalTo(this.state.last_name.toLowerCase().trim())
      .once('value', snapshot => {
        if (snapshot.val() === null) {
          alert(
            "We couldn't find any users with that name. Try a different name!"
          );
        } else {
          var first_name_found = false;
          snapshot.forEach(snapshot => {
            var item = snapshot.val();
            if (
              item.first_name_lower ==
              this.state.first_name.toLowerCase().trim()
            ) {
              first_name_found = true;
              item.key = snapshot.key;
              found_users.push(item);
              this.setState({
                found_users: found_users,
                showUserMessage: false,
                found_card_show: true,
              });
            }
          });
          if (first_name_found === false) {
            alert(
              "We couldn't find any users with that name. Try a different name!"
            );
          }
        }
      });
  }

  createThread(item) {
    const rootRef = firebase.database().ref();
    const threadsRef = rootRef.child('threads');

    var body = {
      squad_id: 'null',
      squad_name: 'null',
      users: {
        [UUID.v4()]: {
          user_id: firebase.auth().currentUser.uid,
          name:
            this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        },
        [UUID.v4()]: {
          user_id: item.key,
          name: item.first_name + ' ' + item.last_name,
        },
      },
    };

    threadsRef
      .push(body)
      .then(snapshot => {
        rootRef
          .child('users')
          .child(firebase.auth().currentUser.uid)
          .child('threads')
          .push({ thread_id: snapshot.key });

        rootRef
          .child('users')
          .child(item.key)
          .child('threads')
          .push({ thread_id: snapshot.key });

        firebase
          .database()
          .ref('messages/')
          .push({
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            text:
              'This is the beginning of the thread between ' +
              this.state.curuser.first_name +
              ' ' +
              this.state.curuser.last_name +
              ' and ' +
              item.first_name +
              ' ' +
              item.last_name +
              '.',
            thread: snapshot.key,
            user: {
              _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
              name: 'Virtual Manager',
            },
          });

        NavigationService.navigate('ThreadScreen', {
          curthread: null,
          threadName: item.first_name + ' ' + item.last_name,
          thread_id: snapshot.key,
        });
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });
  }

  createThreadDecision(item) {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert(
        'Alert',
        "You don't have a conversation with that person yet. Would you like to start a new one?",
        [
          { text: 'OK', onPress: () => this.createThread(item) },
          {
            text: 'Cancel',
            onPress: () => NavigationService.navigate('MyThreadsScreen'),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    } else {
      if (
        window.confirm(
          "You don't have a conversation with that person yet. Would you like to start a new one?"
        )
      ) {
        this.createThread(item);
      } else {
        NavigationService.navigate('MyThreadsScreen');
      }
    }
  }

  chooseUser(item) {
    const rootRef = firebase.database().ref();
    const threadsRef = rootRef.child('threads');
    const usersRef = rootRef.child('users');

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('threads');
    data_ref.once('value', snapshot => {
      if (snapshot.val() === null) {
        this.createThreadDecision(item);
      } else {
        var foundThread = false;
        snapshot.forEach(snapshot => {
          threadsRef.child(snapshot.val().thread_id).on('value', snapshot => {
            if (snapshot.val().squad_id === 'null') {
              for (
                let i = 0;
                i < Object.keys(snapshot.val().users).length;
                i++
              ) {
                if (
                  Object.values(snapshot.val().users)[i].user_id === item.key
                ) {
                  foundThread = true;
                  NavigationService.navigate('ThreadScreen', {
                    curthread: snapshot.val(),
                    threadName: item.first_name + ' ' + item.last_name,
                    thread_id: snapshot.key,
                  });
                }
              }
            }
          });
        });
        if (foundThread === false) {
          this.createThreadDecision(item);
        }
      }
    });
  }

  render() {
    var isEnabled = 'false';
    var buttonColor = 'grey';
    if (
      (this.state.first_name.length > 0) &
      (this.state.last_name.length > 0)
    ) {
      isEnabled = '';
      buttonColor = 'white';
    }
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View
            style={{
              height: Dimensions.get('window').height * 0.8,
              alignItems: 'center',
            }}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.state.showSquadMessage ? (
                  <React.Fragment>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={this.showSquadMessage.bind(this)}>
                        <View style={styles.switchButton}>
                          <Text style={styles.info}> Squad Message </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={this.showUserMessage.bind(this)}>
                        <View style={[styles.switchButton, { opacity: 0.5 }]}>
                          <Text style={styles.info}> User Message </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Card style={styles.resultsCard}>
                      <FlatList
                        style={{ padding: 10 }}
                        data={this.state.found_squads}
                        renderItem={({ item }) => (
                          <React.Fragment>
                            <TouchableOpacity
                              onPress={this.chooseSquad.bind(this, item)}>
                              <Text style={styles.squadInfo}>{item.name}</Text>
                            </TouchableOpacity>
                            <View style={styles.line} />
                          </React.Fragment>
                        )}
                      />
                    </Card>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {!this.state.found_card_show ? (
                      <React.Fragment>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            onPress={this.showSquadMessage.bind(this)}>
                            <View
                              style={[styles.switchButton, { opacity: 0.5 }]}>
                              <Text style={styles.info}> Squad Message </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={this.showUserMessage.bind(this)}>
                            <View style={styles.switchButton}>
                              <Text style={styles.info}> User Message </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.search_fill}>
                          <TextInput
                            style={styles.user_input}
                            placeholder="First Name"
                            onChangeText={first_name =>
                              this.setState({ first_name })
                            }
                            value={this.state.first_name}
                          />
                          <TextInput
                            style={styles.user_input}
                            placeholder="Last Name"
                            onChangeText={last_name =>
                              this.setState({ last_name })
                            }
                            value={this.state.last_name}
                          />
                          <TouchableOpacity
                            onPress={this.searchUser.bind(this)}
                            disabled={isEnabled}>
                            <View style={styles.customButton}>
                              <Text
                                style={{
                                  color: buttonColor,
                                  fontSize: 18,
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                }}>
                                Search For User
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            onPress={this.showSquadMessage.bind(this)}>
                            <View
                              style={[styles.switchButton, { opacity: 0.5 }]}>
                              <Text style={styles.info}> Squad Message </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={this.showUserMessage.bind(this)}>
                            <View style={styles.switchButton}>
                              <Text style={styles.info}> User Message </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <Card style={styles.resultsCard}>
                          <FlatList
                            style={{ padding: 10 }}
                            data={this.state.found_users}
                            renderItem={({ item }) => (
                              <React.Fragment>
                                <TouchableOpacity
                                  onPress={this.chooseUser.bind(this, item)}>
                                  <Text style={styles.info}>
                                    {item.first_name} {item.last_name}
                                  </Text>
                                  <Text style={styles.generic}>
                                    {item.email}
                                  </Text>
                                  <Text style={styles.generic}>{item.zip}</Text>
                                </TouchableOpacity>
                                <View style={styles.line} />
                              </React.Fragment>
                            )}
                          />
                        </Card>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
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
  info: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    width: Dimensions.get('window').width,
  },
  switchButton: {
    backgroundColor: 'white',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.075,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadInfo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B4FFF',
    marginTop: 15,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    marginTop: Dimensions.get('window').height * 0.2,
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
    marginTop: Dimensions.get('window').height * 0.05,
    marginBottom: Dimensions.get('window').height * 0.05,
    alignSelf: 'center',
  },
  search_fill: {
    marginTop: Dimensions.get('window').height * 0.1,
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 2,
    width: Dimensions.get('window').width * 0.6,
  },
});
