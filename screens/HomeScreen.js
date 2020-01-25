import React from 'react';
import * as firebase from 'firebase';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../navigation/NavigationService';
import Moment from 'moment';
import App from '../App';
import BottomMenu from '../components/BottomMenu';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
    headerLeft: null,
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
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
    };
  }

  componentDidMount() {
    var date = new Date();
    var timeOffset = date.getTimezoneOffset();
    var today = date.getTime();

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    /*.child('poll').limitToLast(100) for each item and push it to curuser. This is for when the numbers get too large*/
    data_ref.on('value', snapshot => {
      var curuser = snapshot.val();
      if (curuser.polls !== undefined) {
        curuser.pollCount = curuser.polls.total_unseen;
      }
      if (curuser.tasks !== undefined) {
        curuser.taskCount = curuser.tasks.total_unseen;
      }
      if (curuser.schedulers !== undefined) {
        curuser.schedulerCount = curuser.schedulers.total_unseen;
      }
      if (curuser.threads !== undefined) {
        curuser.threadCount = curuser.threads.total_unseen;
      }
      if (curuser.invites_unseen !== undefined) {
        curuser.inviteCount = curuser.invites_unseen;
      }
      if (curuser.events !== undefined) {
        curuser.eventCount = curuser.events.total_unseen;

        var eventsToday = Object.values(curuser.events).filter(function(obj) {
          if (!isFinite(obj)) {
            if (
              Moment(obj.startAt + timeOffset).format('MM/DD/YYYY') ===
              Moment(today).format('MM/DD/YYYY')
            ) {
              return true;
            }
            return false;
          }
        });
        curuser.eventsToday = eventsToday.length;
      }
      this.setState({ curuser: curuser, loading: false });
    });
  }

  menuClick(curuser) {
    NavigationService.navigate('MenuScreen');
  }

  chatClick(curuser) {
    NavigationService.navigate('MyThreadsScreen');
  }

  tasksClick(curuser) {
    NavigationService.navigate('MyTasksScreen');
  }

  pollsClick(curuser) {
    NavigationService.navigate('MyPollsScreen');
  }

  eventsClick(curuser) {
    NavigationService.navigate('MyEventsScreen');
  }

  schedulersClick(curuser) {
    NavigationService.navigate('MySchedulersScreen');
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
            <ScrollView style={styles.fill}>
              {this.state.loading ? (
                <React.Fragment>
                  <Text style={styles.info}>Loading</Text>
                  <ActivityIndicator size="large" color="white" />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Image
                    style={styles.logo}
                    source={require('../assets/SimpleSquad.png')}
                  />
                  <Text style={styles.info} key="user_name">
                    Let's Get It, {this.state.curuser.first_name}
                  </Text>
                  <View style={styles.tileRow}>
                    <TouchableOpacity onPress={this.chatClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/chat.png')}
                        />
                        {this.state.curuser.threadCount !== undefined &&
                        this.state.curuser.threadCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.threadCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.threadCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text style={styles.tileText}>Messages</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.tasksClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/list.png')}
                        />
                        {this.state.curuser.taskCount !== undefined &&
                        this.state.curuser.taskCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.taskCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.taskCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text style={styles.tileText}>Tasks</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.tileRow}>
                    <TouchableOpacity onPress={this.pollsClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/question.png')}
                        />
                        {this.state.curuser.pollCount !== undefined &&
                        this.state.curuser.pollCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.pollCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.pollCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text style={styles.tileText}>Polls</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.eventsClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/calendar.png')}
                        />
                        {this.state.curuser.eventsToday !== undefined &&
                        this.state.curuser.eventsToday > 0 ? (
                          <View
                            style={[
                              styles.badge,
                              {
                                marginLeft: 20,
                                marginTop: 50,
                                backgroundColor: '#5B4FFF',
                              },
                            ]}>
                            {this.state.curuser.eventsToday <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.eventsToday}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        {this.state.curuser.eventCount !== undefined &&
                        this.state.curuser.eventCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.eventCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.eventCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text style={styles.tileText}>Schedule</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.tileRow}>
                    <TouchableOpacity onPress={this.schedulersClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/time.png')}
                        />
                        {this.state.curuser.schedulerCount !== undefined &&
                        this.state.curuser.schedulerCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.schedulerCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.schedulerCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text
                          style={[
                            styles.tileText,
                            {
                              marginTop: 70,
                              fontSize: 12,
                              textAlign: 'center',
                            },
                          ]}>
                          Schedule Assitant
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.menuClick.bind(this)}>
                      <View style={styles.tile}>
                        <Image
                          style={styles.icon}
                          source={require('assets/icons/menu.png')}
                        />
                        {this.state.curuser.inviteCount !== undefined &&
                        this.state.curuser.inviteCount > 0 ? (
                          <View style={styles.badge}>
                            {this.state.curuser.inviteCount <= 99 ? (
                              <Text style={{ color: 'white' }}>
                                {this.state.curuser.inviteCount}
                              </Text>
                            ) : (
                              <Text style={{ color: 'white' }}>99</Text>
                            )}
                          </View>
                        ) : null}
                        <Text style={styles.tileText}>Menu</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {/*<TouchableOpacity>
                    <View style={styles.circle}>
                      <Image
                        style={styles.icon}
                        source={require('assets/icons/plus.png')}
                      />
                    </View>
                  </TouchableOpacity>*/}
                </React.Fragment>
              )}
            </ScrollView>
          </View>
        </LinearGradient>
        {/*<BottomMenu curuser={this.state.curuser} />*/}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    height: 50,
    width: 50,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  tileRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * 0.025,
  },
  badge: {
    width: 25,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: '#D616CF',
    justifyContent: 'center',
    textAlign: 'center',
    marginLeft: 55,
    marginTop: 15,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.75,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.15,
    marginLeft: Dimensions.get('window').width * 0.3,
    alignSelf: 'right',
    position: 'absolute',
    shadowOffset: { width: 6, height: 6 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
  },
  tile: {
    width: 100,
    height: 100,
    borderRadius: 15,
    backgroundColor: 'white',
    marginHorizontal: Dimensions.get('window').width * 0.1,
    shadowOffset: { width: 6, height: 6 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
  },
  tileText: { position: 'absolute', alignSelf: 'center', marginTop: 80 },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 22,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: Dimensions.get('window').height * 0.01,
  },
  logo: {
    height: Dimensions.get('window').height * 0.4,
    width: Dimensions.get('window').height * 0.4,
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * -0.085,
    marginTop: Dimensions.get('window').height * -0.055,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
  },
});
