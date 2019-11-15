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
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../navigation/NavigationService';

export default class MyThreadsScreen extends React.Component {
  static navigationOptions = {
    title: 'My Messages',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      threads: [],
      maxlimit: 40,
      threadNames: [],
      noThreads: true,
    };
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
        this.setState({ threads: switchArray, noThreads: false });
      } else {
        val.threadName = threadName;
        switchArray.push(val);
        this.setState({ threads: switchArray, noThreads: false });
      }
    });
  }

  componentDidMount() {
    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');

    var user_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('threads');
    data_ref.on('child_added', snapshot => {
      messagesRef
        .orderByChild('thread')
        .equalTo(snapshot.val().thread_id)
        .limitToLast(1)
        .on('child_added', snapshot => {
          this.pushThread(snapshot.val());
        });
    });
    this.setState({ loading: false });
  }

  openThread(curthread) {
    NavigationService.navigate('ThreadScreen', {
      curthread: curthread,
      threadName: curthread.threadName,
      thread_id: curthread.thread,
    });
  }

  newMessage() {
    NavigationService.navigate('CreateThreadScreen', {});
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
                      {item.user._id !== 'rIjWNJh2YuU0glyJbY9HgkeYwjf1' ? (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.openThread.bind(this, item)}>
                            <Text style={styles.title}>{item.threadName}</Text>
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
                            <Text style={styles.date}>
                              {new Date(
                                parseInt(item.createdAt)
                              ).toLocaleString('en-US', {
                                timeZone: 'America/Los_Angeles',
                              })}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      ) : null}
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
        <BottomMenu curuser={this.state.curuser} />
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
    fontSize: 13,
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
    fontSize: 15,
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
    marginTop: Dimensions.get('window').height * 0.05,
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
});
