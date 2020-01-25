/*import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import Moment from 'moment';
import NavigationService from '../navigation/NavigationService';

class BottomMenu extends React.Component {
  static navigationOptions = {
    title: 'BottomMenu',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
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
    /*.child('poll').limitToLast(100) for each item and push it to curuser. This is for when the numbers get too large
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

  timersClick(curuser) {
    NavigationService.navigate('MyEventsScreen');
  }

  render() {
    const curuser = this.props.curuser;
    return (
      <View style={styles.fill}>
        <TouchableOpacity onPress={this.menuClick.bind(this, curuser)}>
          <View>
            <Image
              style={styles.icon}
              source={require('assets/icons/menu.png')}
            />
            {this.state.curuser.inviteCount !== undefined &&
            this.state.curuser.inviteCount > 0 ? (
              <View style={styles.circle}>
                {this.state.curuser.inviteCount <= 99 ? (
                  <Text style={{ color: 'white' }}>
                    {this.state.curuser.inviteCount}
                  </Text>
                ) : (
                  <Text style={{ color: 'white' }}>99</Text>
                )}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.chatClick.bind(this, curuser)}>
          <View>
            <Image
              style={styles.icon}
              source={require('assets/icons/chat.png')}
            />
            {this.state.curuser.threadCount !== undefined &&
            this.state.curuser.threadCount > 0 ? (
              <View style={styles.circle}>
                {this.state.curuser.threadCount <= 99 ? (
                  <Text style={{ color: 'white' }}>
                    {this.state.curuser.threadCount}
                  </Text>
                ) : (
                  <Text style={{ color: 'white' }}>99</Text>
                )}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.tasksClick.bind(this, curuser)}>
          <View>
            <Image
              style={styles.icon}
              source={require('assets/icons/list.png')}
            />
            {this.state.curuser.taskCount !== undefined &&
            this.state.curuser.taskCount > 0 ? (
              <View style={styles.circle}>
                {this.state.curuser.taskCount <= 99 ? (
                  <Text style={{ color: 'white' }}>
                    {this.state.curuser.taskCount}
                  </Text>
                ) : (
                  <Text style={{ color: 'white' }}>99</Text>
                )}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.pollsClick.bind(this, curuser)}>
          <View>
            <Image
              style={styles.icon}
              source={require('assets/icons/question.png')}
            />
            {this.state.curuser.pollCount !== undefined &&
            this.state.curuser.pollCount > 0 ? (
              <View style={styles.circle}>
                {this.state.curuser.pollCount <= 99 ? (
                  <Text style={{ color: 'white' }}>
                    {this.state.curuser.pollCount}
                  </Text>
                ) : (
                  <Text style={{ color: 'white' }}>99</Text>
                )}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.timersClick.bind(this, curuser)}>
          <View>
            <Image
              style={styles.icon}
              source={require('assets/icons/time.png')}
            />
            {this.state.curuser.eventsToday !== undefined &&
            this.state.curuser.eventsToday > 0 ? (
              <View
                style={[
                  styles.circle,
                  { marginLeft: 10, marginTop: 35, backgroundColor: '#5B4FFF' },
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
              <View style={styles.circle}>
                {this.state.curuser.eventCount <= 99 ? (
                  <Text style={{ color: 'white' }}>
                    {this.state.curuser.eventCount}
                  </Text>
                ) : (
                  <Text style={{ color: 'white' }}>99</Text>
                )}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default withNavigation(BottomMenu);

const styles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
    margin: 20,
  },
  fill: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '10%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { height: -3 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: '#D616CF',
    justifyContent: 'center',
    textAlign: 'center',
    marginLeft: 35,
    marginTop: 5,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.75,
  },
});*/

import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import Moment from 'moment';
import NavigationService from '../navigation/NavigationService';

class BottomMenu extends React.Component {
  static navigationOptions = {
    title: 'BottomMenu',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
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
    this.props.action();
    NavigationService.navigate('MenuScreen');
  }

  chatClick(curuser) {
    this.props.action();
    NavigationService.navigate('MyThreadsScreen');
  }

  tasksClick(curuser) {
    this.props.action();
    NavigationService.navigate('MyTasksScreen');
  }

  pollsClick(curuser) {
    this.props.action();
    NavigationService.navigate('MyPollsScreen');
  }

  eventsClick(curuser) {
    this.props.action();
    NavigationService.navigate('MyEventsScreen');
  }

  schedulersClick(curuser) {
    this.props.action();
    NavigationService.navigate('MySchedulersScreen');
  }

  closeMenu() {
    this.props.action();
  }

  render() {
    const curuser = this.props.curuser;
    return (
      <React.Fragment>
        <TouchableOpacity onPress={this.closeMenu.bind(this)}>
          <View style={styles.fill} />
        </TouchableOpacity>
        <LinearGradient
          colors={['#5B4FFF', '#9ED4FF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.menu_fill}>
          <TouchableOpacity onPress={this.chatClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/chat.png')}
              />
              {this.state.curuser.threadCount !== undefined &&
              this.state.curuser.threadCount > 0 ? (
                <View style={styles.circle}>
                  {this.state.curuser.threadCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.threadCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={[styles.options]}>Messages</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity onPress={this.tasksClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/list.png')}
              />
              {this.state.curuser.taskCount !== undefined &&
              this.state.curuser.taskCount > 0 ? (
                <View style={styles.circle}>
                  {this.state.curuser.taskCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.taskCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={[styles.options]}>Tasks</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity onPress={this.pollsClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/question.png')}
              />
              {this.state.curuser.pollCount !== undefined &&
              this.state.curuser.pollCount > 0 ? (
                <View style={styles.circle}>
                  {this.state.curuser.pollCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.pollCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={[styles.options]}>Polls</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity onPress={this.eventsClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/calendar.png')}
              />
              {this.state.curuser.eventsToday !== undefined &&
              this.state.curuser.eventsToday > 0 ? (
                <View
                  style={[
                    styles.circle,
                    {
                      marginLeft: 10,
                      marginTop: 35,
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
                <View style={styles.circle}>
                  {this.state.curuser.eventCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.eventCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={[styles.options]}>Schedule</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity onPress={this.schedulersClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/time.png')}
              />
              {this.state.curuser.schedulerCount !== undefined &&
              this.state.curuser.schedulerCount > 0 ? (
                <View style={styles.circle}>
                  {this.state.curuser.schedulerCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.schedulerCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={[styles.options]}>Schedule Assistant</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity onPress={this.menuClick.bind(this, curuser)}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('assets/icons/menu.png')}
              />
              {this.state.curuser.inviteCount !== undefined &&
              this.state.curuser.inviteCount > 0 ? (
                <View style={styles.circle}>
                  {this.state.curuser.inviteCount <= 99 ? (
                    <Text style={{ color: 'white' }}>
                      {this.state.curuser.inviteCount}
                    </Text>
                  ) : (
                    <Text style={{ color: 'white' }}>99</Text>
                  )}
                </View>
              ) : null}
              <Text style={styles.options}>Menu</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
        </LinearGradient>
      </React.Fragment>
    );
  }
}

export default withNavigation(BottomMenu);

const styles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
    margin: 20,
  },
  line: {
    backgroundColor: '#E8E8E8',
    height: 1,
    width:
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? Dimensions.get('window').width * 0.7
        : Dimensions.get('window').width * 0.45,
    alignSelf: 'center',
  },
  fill: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { height: -3 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  menu_fill: {
    flex: 1,
    width:
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? Dimensions.get('window').width * 0.75
        : Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.8,
    backgroundColor: '#9ED4FF',
    opacity: 1,
    shadowOffset: { height: -3 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
    position: 'absolute',
    alignSelf: 'flex-end',
    paddingVertical: 10,
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: '#D616CF',
    justifyContent: 'center',
    textAlign: 'center',
    marginLeft: 35,
    marginTop: 5,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.75,
  },
  options: {
    fontSize: 20,
    margin: 20,
    marginLeft: 0,
    fontWeight: 'bold',
    color: 'white',
  },
});
