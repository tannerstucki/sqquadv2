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
  Easing,
  Animated,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import Moment from 'moment';
import NavigationService from '../../navigation/NavigationService';

export default class MyThreadsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Messages',
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
      loading: true,
      threads: [],
      maxlimit: 70,
      titleMaxlimit: 25,
      threadNames: [],
      noThreads: true,
      timeOffset: 0,
      showDrawer: false,
    };
  }

  insert(val, switchArray) {
    switchArray.splice(this.locationOf(val, switchArray) + 1, 0, val);
    return switchArray;
  }

  locationOf(val, switchArray, start, end) {
    start = start || 0;
    end = end || switchArray.length;
    var pivot = parseInt(start + (end - start) / 2, 10);
    if (end - start <= 1 || switchArray[pivot].createdAt === val.createdAt)
      return pivot;
    if (switchArray[pivot].createdAt < val.createdAt) {
      return this.locationOf(val, switchArray, pivot, end);
    } else {
      return this.locationOf(val, switchArray, start, pivot);
    }
  }

  pushThread(val) {
    const rootRef = firebase.database().ref();
    const threadsRef = rootRef.child('threads');
    const usersRef = rootRef.child('users');
    const squadsRef = rootRef.child('squads');
    var threadName = '';

    threadsRef.child(val.thread).on('value', snapshot => {
      if (snapshot.val().squad_id === 'null') {
        for (let i = 0; i < Object.keys(snapshot.val().users).length; i++) {
          if (
            Object.values(snapshot.val().users)[i].user_id !==
            firebase.auth().currentUser.uid
          ) {
            threadName =
              threadName + Object.values(snapshot.val().users)[i].name;
          } else {
            //add title for multiple user chats
          }
        }
      } else {
        threadName = snapshot.val().squad_name;
      }
      var switchArray = this.state.threads;
      var index = switchArray.findIndex(obj => obj.thread === val.thread);
      if (index !== -1) {
        val.threadName = threadName;
        switchArray.splice(index, 1);
        switchArray.unshift(val);
      } else {
        val.threadName = threadName;
        switchArray.unshift(val);
      }
      //this insert function is a quicksort that I couldn't get to work but should be used as data gets larger. I think it doesn't work because of the asynchronistic nature of firebase
      switchArray.sort(function(message1, message2) {
        return message2.createdAt - message1.createdAt;
      });
      this.setState({ threads: switchArray, noThreads: false });
    });
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');

    var user_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    var date = new Date();
    var timeOffset = date.getTimezoneOffset();

    firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('threads')
      .on('value', snapshot => {
        snapshot.forEach(snapshot => {
          var unseen = snapshot.val().unseen;
          if (snapshot.key !== 'total_unseen') {
            messagesRef
              .orderByChild('thread')
              .equalTo(snapshot.val().thread_id)
              .limitToLast(1)
              .on('child_added', snapshot => {
                var val = snapshot.val();
                val.unseen = unseen;
                this.pushThread(val);
              });
          }
        });
      });
    this.setState({ loading: false, timeOffset: timeOffset });
  }

  openThread(curthread) {
    NavigationService.navigate('ThreadScreen', {
      threadName: curthread.threadName,
      thread_id: curthread.thread,
    });
  }

  newMessage() {
    NavigationService.navigate('CreateThreadScreen', {});
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
                {this.state.noThreads == true ? (
                  <React.Fragment>
                    <Text style={styles.noThreads}>
                      Sorry, you have no messages.
                    </Text>
                    <Text style={styles.noThreads}>
                      Join a squad or create a message to get started!
                    </Text>
                  </React.Fragment>
                ) : null}
                <FlatList
                  data={this.state.threads}
                  extraData={this.state}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      {item.user._id === 'rIjWNJh2YuU0glyJbY9HgkeYwjf1' &&
                      item.text.includes('This is the beginning') ? null : (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.openThread.bind(this, item)}
                            style={{
                              marginLeft: Dimensions.get('window').width * 0.05,
                            }}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text style={styles.title}>
                                {item.threadName.length >
                                this.state.titleMaxlimit
                                  ? item.threadName.substring(
                                      0,
                                      this.state.titleMaxlimit - 3
                                    ) + '...'
                                  : item.threadName}
                              </Text>
                              {item.unseen > 0 ? (
                                <View style={styles.circle}>
                                  {item.unseen < 99 ? (
                                    <Text style={{ color: 'white' }}>
                                      {item.unseen} New
                                    </Text>
                                  ) : (
                                    <Text style={{ color: 'white' }}>
                                      99 New
                                    </Text>
                                  )}
                                </View>
                              ) : null}
                            </View>
                            <View
                              style={{
                                width: Dimensions.get('window').width * 0.95,
                              }}>
                              {item.user._id ===
                              firebase.auth().currentUser.uid ? (
                                <Text style={styles.info}>
                                  You:{' '}
                                  {item.text.length > this.state.maxlimit
                                    ? item.text.substring(
                                        0,
                                        this.state.maxlimit - 3
                                      ) + '...'
                                    : item.text}
                                </Text>
                              ) : (
                                <Text style={styles.info}>
                                  {item.user.name}:{' '}
                                  {item.text.length > this.state.maxlimit
                                    ? item.text.substring(
                                        0,
                                        this.state.maxlimit - 3
                                      ) + '...'
                                    : item.text}
                                </Text>
                              )}
                            </View>
                            <Text style={styles.date}>
                              {Moment(
                                item.createdAt + this.state.timeOffset
                              ).format('MM/DD/YYYY, hh:mm A')}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </React.Fragment>
            )}
            <TouchableOpacity onPress={this.newMessage.bind(this)}>
              <View style={styles.customButton}>
                <Text style={styles.buttonText}>New Message</Text>
              </View>
            </TouchableOpacity>
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
    height: Dimensions.get('window').height * 0.78,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.02,
  },
  info: {
    fontSize: 15,
    padding: 5,
    color: 'white',
    paddingLeft: 16,
    paddingBottom: 5,
    paddingTop: 0,
  },
  date: {
    fontSize: 13,
    padding: 5,
    color: 'lightgrey',
    paddingLeft: 16,
    paddingBottom: 5,
    paddingTop: 0,
  },
  title: {
    fontSize: 22,
    paddingLeft: 16,
    paddingBottom: 5,
    paddingTop: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  line: {
    backgroundColor: '#E8E8E8',
    height: 1,
    width: Dimensions.get('window').width * 0.9,
    alignSelf: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height * 0.05,
    marginTop: Dimensions.get('window').height * 0.01,
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noThreads: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  circle: {
    width: 60,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: '#D616CF',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: Dimensions.get('window').height * 0.022,
    marginLeft: Dimensions.get('window').width * 0.03,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
  },
});
