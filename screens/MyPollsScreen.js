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
  Picker,
  Platform,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import PickerModal from 'react-native-picker-modal-view';
import NavigationService from '../navigation/NavigationService';

export default class MyPollsScreen extends React.Component {
  static navigationOptions = {
    title: 'Polls',
    //headerLeft: navigate back to home screen
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      polls: [],
      noPolls: true,
      showClosed: false,
      squadOption: 'My Polls',
      noSquads: false,
      squads: [],
      switchCardShow: false,
      squadFilter: '',
      addedData: 0,
    };
  }

  componentDidMount() {
    var user_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    const rootRef = firebase.database().ref();
    const pollsRef = rootRef.child('polls');

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('polls');
    data_ref.on('value', snapshot => {
      snapshot.forEach(snapshot => {
        var responded = snapshot.val().responded;
        pollsRef
          .child(snapshot.val().poll_id)
          .orderByChild('createdAt')
          .on('value', snapshot => {
            var item = snapshot.val();
            item.key = snapshot.key;
            item.responded = responded;
            var switchArray = this.state.polls;
            var index = switchArray.findIndex(obj => obj.key === item.key);
            if (index !== -1) {
              switchArray.splice(index, 1);
              switchArray.unshift(item);
              this.setState({ polls: switchArray, noPolls: false });
            } else {
              switchArray.push(item);
              this.setState({ polls: switchArray, noPolls: false });
            }
          });
      });
    });

    const squadsRef = rootRef.child('squads');
    var squads = [];

    var user_squad_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('squads');
    user_squad_ref.once('value', snapshot => {
      if (snapshot.val() === null) {
        this.setState({ noSquads: true });
      } else {
        snapshot.forEach(snapshot => {
          squadsRef
            .child(snapshot.val().squad_id)
            .orderByChild('name')
            .once('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;
              squads.unshift(item);
              this.setState({ squads: squads });
            });
        });
      }
    });
    this.setState({ loading: false });
  }

  switchShowClosed() {
    if (this.state.showClosed === true) {
      this.setState({
        showClosed: false,
      });
    } else {
      this.setState({
        showClosed: true,
      });
    }
  }

  switchSquadOption() {
    if (this.state.noSquads === true) {
      alert('Sorry, you have no squads. Join or create one to get started!');
    } else {
      this.setState({ switchCardShow: true });
    }
  }

  chooseSquad(item) {
    if (item === 'My Polls') {
      this.setState({
        squadFilter: '',
        squadOption: 'My Polls',
        switchCardShow: false,
      });
    } else {
      this.setState({
        squadFilter: item.key,
        squadOption: item.name,
        switchCardShow: false,
      });
    }
  }

  openPoll(curpoll) {
    var pollName;
    for (let i = 0; i < this.state.squads.length; i++) {
      if (this.state.squads[i].key === curpoll.squad_id) {
        pollName = this.state.squads[i].name;
        break;
      }
    }

    NavigationService.navigate('PollScreen', {
      curpoll: curpoll,
      pollName: pollName,
    });
  }

  createPoll() {
    NavigationService.navigate('CreatePollScreen', {
      squads: this.state.squads,
    });
  }

  render() {
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
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {!this.state.switchCardShow ? (
                  <View style={styles.container}>
                    <Text>{this.state.noPolls}</Text>
                    {this.state.noPolls == true ? (
                      <React.Fragment>
                        <Text style={styles.noPolls}>
                          Sorry, you have no polls.
                        </Text>
                        <Text style={styles.noPolls}>
                          Create a poll for one of your squads!
                        </Text>
                      </React.Fragment>
                    ) : null}
                    {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                      <TouchableOpacity
                        onPress={this.switchSquadOption.bind(this)}>
                        <View style={styles.optionView}>
                          <Text style={styles.squadOption}>
                            {this.state.squadOption}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={this.switchSquadOption.bind(this)}>
                        <View>
                          <Text style={styles.squadOption}>
                            {this.state.squadOption}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    <FlatList
                      data={this.state.polls}
                      extraData={this.state}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          {(this.state.showClosed === true ||
                            (this.state.showClosed === false &&
                              item.status === 'open')) &&
                          (this.state.squadFilter === '' ||
                            this.state.squadFilter === item.squad_id) ? (
                            <TouchableOpacity
                              onPress={this.openPoll.bind(this, item)}>
                              <Card style={styles.listCard}>
                                <Text style={styles.info}>
                                  {item.question}{' '}
                                </Text>
                                {item.responded === true ? (
                                  <Text style={styles.responded}>
                                    You have completed this poll.
                                  </Text>
                                ) : (
                                  <Text style={styles.notResponded}>
                                    You have not completed this poll yet.
                                  </Text>
                                )}
                              </Card>
                            </TouchableOpacity>
                          ) : null}
                        </React.Fragment>
                      )}
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={this.createPoll.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>New Poll</Text>
                        </View>
                      </TouchableOpacity>
                      {this.state.showClosed === true ? (
                        <TouchableOpacity
                          onPress={this.switchShowClosed.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Hide Closed</Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={this.switchShowClosed.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Show Closed</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <Card style={styles.resultsCard}>
                    <TouchableOpacity
                      onPress={this.chooseSquad.bind(this, 'My Polls')}>
                      <Text
                        style={[
                          styles.info,
                          { fontSize: 20, textAlign: 'center' },
                        ]}>
                        My Polls
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.squads}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.chooseSquad.bind(this, item)}>
                            <Text
                              style={[
                                styles.info,
                                { fontSize: 20, textAlign: 'center' },
                              ]}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                  </Card>
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
    fontSize: 15,
    marginTop: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  squadOption: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
    textDecorationLine: 'underline',
  },
  optionView: {
    marginTop: Dimensions.get('window').height * -0.04,
    height: Dimensions.get('window').height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responded: {
    fontSize: 12,
    paddingTop: 5,
    paddingHorizontal: 15,
    color: 'grey',
    textAlignVertical: 'center',
  },
  notResponded: {
    fontSize: 12,
    paddingTop: 5,
    paddingHorizontal: 15,
    color: 'red',
    textAlignVertical: 'center',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 50,
  },
  noPolls: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.375,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
    marginBottom: Dimensions.get('window').height * -0.01,
    marginHorizontal: Dimensions.get('window').width * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
  },
  listCard: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.1,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: Dimensions.get('window').height * 0.025,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
});
