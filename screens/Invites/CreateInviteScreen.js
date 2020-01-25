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
  Picker,
  FlatList,
  Dimensions,
  Easing,
  Animated,
} from 'react-native';
import Constants from 'expo-constants';
import { createStackNavigator } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import BottomMenu from '../../components/BottomMenu';
import HomeScreen from '.././HomeScreen';
import NavigationService from '../../navigation/NavigationService';

export default class CreateInviteScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Invite a Friend',
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
      curuser: '',
      first_name: '',
      last_name: '',
      found_users: '',
      found_squads: '',
      search_show: true,
      final_message_show: false,
      found_card_show: false,
      squad_card_show: false,
      found_user_show: false,
      not_found_show: false,
      showDrawer: false,
      chosen_user: '',
      chosen_squad: '',
      acceptor_email: '',
      loading: true,
    };
  }

  componentWillMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    const cursquad = params.cursquad;
    this.setState({ chosen_squad: cursquad });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      var item = snapshot.val();
      item.key = snapshot.key;
      this.setState({ curuser: item });
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
            "We couldn't find any users with that name. Invite them by email instead!"
          );
          this.setState({
            search_show: false,
            final_message_show: true,
            found_user_show: false,
          });
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
                search_show: false,
                found_card_show: true,
              });
            }
          });
          if (first_name_found === false) {
            alert(
              "We couldn't find any users with that name. Invite them by email instead!"
            );
            this.setState({
              search_show: false,
              final_message_show: true,
              found_user_show: false,
            });
          }
        }
      });
  }

  getSquads(user_id) {
    this.setState({ squad_card_show: true });

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

  chooseUser(item) {
    this.setState({
      found_card_show: false,
      chosen_user: item,
      final_message_show: true,
      found_user_show: true,
    });
  }

  chooseSquad(item) {
    this.setState({
      squad_card_show: false,
      chosen_squad: item,
      final_message_show: true,
    });
  }

  searchInvites() {
    var acceptor_email = '';
    if (this.state.acceptor_email) {
      acceptor_email = this.state.acceptor_email.toLowerCase().trim();
    } else {
      acceptor_email = this.state.chosen_user.email.toLowerCase().trim();
    }

    firebase
      .database()
      .ref()
      .child('invites')
      .orderByChild('acceptor_email')
      .equalTo(acceptor_email)
      .once('value', snapshot => {
        var pending = false;
        var accepted = false;
        var declined = false;
        snapshot.forEach(snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          if (item.squad_id === this.state.chosen_squad.key) {
            if (item.status === 'new') {
              pending = true;
            } else if (item.status === 'accepted') {
              accepted = true;
            } else {
              declined = true;
            }
          }
        });
        if (accepted) {
          alert(
            'This person already belongs to this squad. No need to send them an invite!'
          );
        } else if (pending) {
          alert(
            'This person already has a pending invitation to this squad. Give them a little longer to decide.'
          );
        } else {
          if (declined) {
            alert(
              "This person has already declined an invite to this squad. After multiple invites, you won't be able to send more."
            );
          }
          var body = '';
          if (!this.state.acceptor_email) {
            body = {
              sender_id: this.state.curuser.key,
              acceptor_id: this.state.chosen_user.key,
              squad_id: this.state.chosen_squad.key,
              squad_name: this.state.chosen_squad.name,
              invite_type: 'internal',
              acceptor_email: this.state.chosen_user.email.trim().toLowerCase(),
              status: 'new',
              unseen: true,
            };
          } else {
            body = {
              sender_id: this.state.curuser.key,
              acceptor_id: null,
              squad_id: this.state.chosen_squad.key,
              squad_name: this.state.chosen_squad.name,
              invite_type: 'external',
              acceptor_email: this.state.acceptor_email.trim().toLowerCase(),
              status: 'new',
              unseen: true,
            };
          }

          var invite_post = firebase
            .database()
            .ref('invites/')
            .push(body)
            .then(function() {
              //Increase unseen invites for acceptor
              firebase
                .database()
                .ref('users/')
                .orderByChild('email')
                .equalTo(acceptor_email.trim().toLowerCase())
                .once('value', snapshot => {
                  var invites_unseen = 1;
                  if (
                    snapshot.val().invites_unseen !== undefined &&
                    snapshot.val().invites_unseen !== null
                  ) {
                    invites_unseen = snapshot.val().invites_unseen + 1;
                  }
                  firebase
                    .database()
                    .ref('users/')
                    .child(Object.keys(snapshot.val())[0])
                    .child('invites_unseen')
                    .set(invites_unseen);
                });
              NavigationService.navigate('MenuScreen');
            })
            .then(function() {
              alert('Your invite has been sent!');
            })
            .catch(function(error) {
              var errorCode = error.code;
              var errorMessage = error.message;
              alert(errorCode + ': ' + errorMessage);
            });
        }
      });
  }

  createInvite() {
    var already_member = false;
    if (
      this.state.acceptor_email.trim().toLowerCase() ===
      this.state.curuser.email
    ) {
      alert("Sorry, you can't invite yourself to a squad.");
    } else {
      //This is to check if that user already belongs to the squad
      if (!this.state.acceptor_email) {
        for (
          let i = 0;
          i < Object.values(this.state.chosen_squad.users).length;
          i++
        ) {
          if (
            Object.values(this.state.chosen_squad.users)[i].user_id ===
            this.state.chosen_user.key
          ) {
            already_member = true;
            break;
          }
        }
        if (already_member) {
          alert(
            'This person already belongs to this squad. No need to send them an invite!'
          );
        } else {
          this.searchInvites();
        }
      } else {
        const rootRef = firebase.database().ref();
        var usersRef = rootRef
          .child('users')
          .orderByChild('email')
          .equalTo(this.state.acceptor_email.trim().toLowerCase())
          .once('value', snapshot => {
            if (
              snapshot.val() !== null &&
              Object.values(snapshot.val())[0].squads !== undefined
            ) {
              for (
                let i = 0;
                i <
                Object.values(Object.values(snapshot.val())[0].squads).length;
                i++
              ) {
                if (
                  Object.values(Object.values(snapshot.val())[0].squads)[0]
                    .squad_id === this.state.chosen_squad.key
                ) {
                  already_member = true;
                  break;
                }
              }
            }
            if (already_member) {
              alert(
                'This person already belongs to this squad. No need to send them an invite!'
              );
            } else {
              this.searchInvites();
            }
          });
      }
    }
  }

  noAccountOption() {
    this.setState({
      search_show: false,
      final_message_show: true,
      found_user_show: false,
    });
  }

  setSquad(cursquad) {
    this.setState({
      chosen_squad: cursquad,
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
    var buttonColor = 'grey';
    if (
      (this.state.first_name.length > 0) &
      (this.state.last_name.length > 0)
    ) {
      isEnabled = '';
      buttonColor = 'white';
    }

    var emailIsEnabled = 'false';
    var emailButtonColor = 'grey';
    if (this.state.acceptor_email.length > 0) {
      emailIsEnabled = '';
      emailIsEnabled = 'white';
    }

    return (
      <React.Fragment>
        <LinearGradient
          height="100%"
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={{ height: Dimensions.get('window').height * .8 }}>
            {this.state.search_show ? (
              <React.Fragment style={{ position: 'absolute' }}>
                <View style={{ marginTop: 40 }}>
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
                  <TouchableOpacity onPress={this.noAccountOption.bind(this)}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: 'white',
                        marginTop: 10,
                        alignContent: 'center',
                        alignSelf: 'center',
                      }}>
                      I know this person does not have an account
                    </Text>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
            {this.state.found_card_show ? (
              <Card style={styles.resultsCard}>
                <FlatList
                  style={{ padding: 10 }}
                  data={this.state.found_users}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      {item.key !== firebase.auth().currentUser.uid ? (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.chooseUser.bind(this, item)}>
                            <Text style={styles.info}>
                              {item.first_name} {item.last_name}
                            </Text>
                            <Text style={styles.generic}>{item.email}</Text>
                            <Text style={styles.generic}>{item.zip}</Text>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      ) : null}
                    </React.Fragment>
                  )}
                />
              </Card>
            ) : null}
            {this.state.final_message_show ? (
              <View
                style={[
                  {
                    height: '100%',
                    alignContent: 'center',
                    alignSelf: 'center',
                    marginTop: Dimensions.get('window').height * 0.2,
                    position: 'absolute',
                  },
                ]}>
                <Text style={styles.finalMessage}>
                  You're sending an invite to
                </Text>
                {this.state.found_user_show ? (
                  <React.Fragment>
                    <Text style={styles.finalMessage}>
                      {this.state.chosen_user.first_name}{' '}
                      {this.state.chosen_user.last_name}
                    </Text>
                  </React.Fragment>
                ) : (
                  <TextInput
                    style={styles.user_input}
                    placeholder="Email"
                    onChangeText={acceptor_email =>
                      this.setState({ acceptor_email })
                    }
                    value={this.state.acceptor_email}
                  />
                )}
                {this.state.chosen_squad ? (
                  <React.Fragment>
                    <Text style={styles.finalMessage}>to join the</Text>
                    <Text style={styles.finalMessage}>
                      {this.state.chosen_squad.name} Squad
                    </Text>
                    <TouchableOpacity
                      onPress={this.createInvite.bind(this)}
                      disabled={
                        (this.state.acceptor_email.length > 0 &&
                          this.state.acceptor_email.includes('@')) ||
                        this.state.chosen_user
                          ? ''
                          : 'false'
                      }>
                      <View style={styles.customButton}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color:
                              (this.state.acceptor_email.length > 0 &&
                                this.state.acceptor_email.includes('@')) ||
                              this.state.chosen_user
                                ? 'white'
                                : 'grey',
                            fontSize: 20,
                            alignContent: 'center',
                            alignSelf: 'center',
                            textAlign: 'center',
                          }}>
                          Send Invite
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                ) : (
                  <TouchableOpacity onPress={this.getSquads.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Select Squad</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {this.state.squad_card_show ? (
              <Card style={styles.resultsCard}>
                <FlatList
                  style={{ padding: 10 }}
                  data={this.state.found_squads}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      <TouchableOpacity
                        onPress={this.chooseSquad.bind(this, item)}>
                        <Text style={styles.info}>{item.name}</Text>
                      </TouchableOpacity>
                      <View style={styles.squadLine} />
                    </React.Fragment>
                  )}
                />
              </Card>
            ) : null}
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
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
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
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: 0.15,
  },
  info: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B4FFF',
    marginTop: 15,
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 2,
    width: Dimensions.get('window').width * 0.6,
  },
  squadLine: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
  generic: {
    fontSize: 12,
    padding: 2,
    color: '#5B4FFF',
  },
  finalMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    alignContent: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    alignContent: 'center',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
