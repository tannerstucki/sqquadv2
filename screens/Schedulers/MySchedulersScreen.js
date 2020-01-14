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
  Platform,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import NavigationService from '../../navigation/NavigationService';

export default class MySchedulersScreen extends React.Component {
  static navigationOptions = {
    title: 'Schedule Assistant',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      schedulers: [],
      noSchedulers: true,
      showClosed: false,
      squadOption: 'My Time Requests',
      noSquads: false,
      squads: [],
      switchSquadCardShow: false,
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
    const schedulersRef = rootRef.child('schedulers');

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('schedulers');
    data_ref.on('value', snapshot => {
      snapshot.forEach(snapshot => {
        schedulersRef
          .child(snapshot.val().scheduler_id)
          .orderByChild('createdAt')
          .on('value', snapshot => {
            var item = snapshot.val();
            item.key = snapshot.key;

            //get the responded status of the current user
            var users = item.users;
            var userIndex = users.findIndex(
              obj => obj.user_id === firebase.auth().currentUser.uid
            );
            if (userIndex !== -1) {
              item.responded = users[userIndex].responded;
            } else {
              item.responded = null;
            }

            var switchArray = this.state.schedulers;
            var index = switchArray.findIndex(obj => obj.key === item.key);
            if (index !== -1) {
              switchArray.splice(index, 1);
              switchArray.unshift(item);
              this.setState({ schedulers: switchArray, noSchedulers: false });
            } else {
              switchArray.push(item);
              this.setState({ schedulers: switchArray, noSchedulers: false });
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
      this.setState({ switchSquadCardShow: true });
    }
  }

  chooseSquad(item) {
    if (
      item !== this.state.squadOption &&
      item.name !== this.state.squadOption
    ) {
      this.setState(
        { schedulers: [], noSchedulers: true },
        this.updateSchedulers.bind(this, item)
      );
    }

    this.setState({
      switchSquadCardShow: false,
    });
  }

  updateSchedulers(item) {
    const rootRef = firebase.database().ref();
    const schedulersRef = rootRef.child('schedulers');

    if (item.name) {
      this.setState({
        squadOption: item.name,
        squad_id: item.key,
      });
      var squad_data_ref = firebase
        .database()
        .ref('schedulers')
        .orderByChild('squad_id')
        .equalTo(item.key);
      squad_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;

          //get the responded status of the current user
          var users = item.users;
          var userIndex = users.findIndex(
            obj => obj.user_id === firebase.auth().currentUser.uid
          );
          if (userIndex !== -1) {
            item.responded = users[userIndex].responded;
          } else {
            item.responded = null;
          }

          var switchArray = this.state.schedulers;
          var index = switchArray.findIndex(obj => obj.key === item.key);
          if (index == -1) {
            switchArray.push(item);
            this.setState({ schedulers: switchArray, noSchedulers: false });
          }
        });
      });
    } else {
      this.setState({
        squadOption: 'My Time Requests',
        squad_id: '',
      });
      var user_data_ref = firebase
        .database()
        .ref('users/' + firebase.auth().currentUser.uid)
        .child('schedulers');
      user_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          schedulersRef
            .child(snapshot.val().scheduler_id)
            .orderByChild('createdAt')
            .on('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;

              //get the responded status of the current user
              var users = item.users;
              var userIndex = users.findIndex(
                obj => obj.user_id === firebase.auth().currentUser.uid
              );
              if (userIndex !== -1) {
                item.responded = users[userIndex].responded;
              } else {
                item.responded = null;
              }

              var switchArray = this.state.schedulers;
              var index = switchArray.findIndex(obj => obj.key === item.key);
              if (index === -1) {
                switchArray.push(item);
                this.setState({ schedulers: switchArray, noSchedulers: false });
              }
            });
        });
      });
    }
  }

  openScheduler(curscheduler) {
    var schedulerName;
    for (let i = 0; i < this.state.squads.length; i++) {
      if (this.state.squads[i].key === curscheduler.squad_id) {
        schedulerName = this.state.squads[i].name;
        break;
      }
    }

    NavigationService.navigate('SchedulerScreen', {
      curscheduler: curscheduler,
      schedulerName: schedulerName,
    });
  }

  createScheduler() {
    NavigationService.navigate('CreateSchedulerScreen', {
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
                {!this.state.switchSquadCardShow ? (
                  <View style={styles.container}>
                    <React.Fragment>
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
                    </React.Fragment>
                    {this.state.noSchedulers === true ? (
                      <React.Fragment>
                        {this.state.noSquads === true ? (
                          <React.Fragment>
                            <Text style={styles.noSchedulers}>
                              Sorry, you have no time requests.
                            </Text>
                            <Text style={styles.noSchedulers}>
                              To use the schedule assistant, it must be
                              associated with a squad. Get started by creating
                              or joining a squad!
                            </Text>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Text style={styles.noSchedulers}>
                              Time requests from your new squads will show up
                              here.
                            </Text>
                            <Text style={styles.noSchedulers}>
                              To see previously created time requests for your
                              squads, select a squad from the filter above!
                            </Text>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    ) : null}
                    <FlatList
                      data={this.state.schedulers}
                      extraData={this.state}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          {this.state.showClosed === true ||
                          (this.state.showClosed === false &&
                            item.status === 'open') ? (
                            <TouchableOpacity
                              onPress={this.openScheduler.bind(this, item)}>
                              <Card style={styles.listCard}>
                                <Text style={styles.info}>
                                  {item.title}{' '}
                                </Text>
                                {item.responded !== null ? (
                                  <React.Fragment>
                                    {item.responded === true ? (
                                      <Text style={styles.responded}>
                                        You have completed this time request.
                                      </Text>
                                    ) : (
                                      <Text style={styles.notResponded}>
                                        You have not completed this time request
                                        yet.
                                      </Text>
                                    )}
                                  </React.Fragment>
                                ) : (
                                  <Text style={styles.responded}>
                                    You were not asked to reply to this time
                                    request.
                                  </Text>
                                )}
                              </Card>
                            </TouchableOpacity>
                          ) : null}
                        </React.Fragment>
                      )}
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={this.createScheduler.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>
                            New Request
                          </Text>
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
                      onPress={this.chooseSquad.bind(this, 'My Time Requests')}>
                      <Text
                        style={[
                          styles.info,
                          { fontSize: 20, textAlign: 'center' },
                        ]}>
                        My Time Requests
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
    marginTop: Dimensions.get('window').height * -0.015,
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
  noSchedulers: {
    fontSize: 20,
    padding: 10,
    alignSelf: 'center',
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
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: .5,
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
    shadowOffset: { width: 7, height: 7 },
    shadowColor: 'black',
    shadowOpacity: .2,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: .15,
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
