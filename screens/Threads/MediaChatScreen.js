import * as React from 'react';
import * as firebase from 'firebase';
import {
  GiftedChat,
  Day,
  InputToolbar,
  ChatFooter,
  Message,
  Bubble,
  Actions,
} from 'react-native-gifted-chat';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
  Dimensions,
  Header,
  Platform,
  Easing,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../../navigation/NavigationService';
import BottomMenu from '../../components/BottomMenu';

export default class ThreadScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('threadName', 'Chat'),
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
      messages: [],
      curuser: '',
      thread_id: '',
      threadName: '',
      curthread: '',
      users: [],
      showDrawer: false,
    };
  }

  /*state = {
    messages: [],
    curuser: '',
    thread_id: '',
    threadName: '',
    curthread: '',
    users: [],
    showDrawer: false,
  };*/

  parse = snapshot => {
    const { timestamp: numberStamp, text, user } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const message = {
      _id,
      timestamp,
      text,
      user,
    };
    return message;
  };

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    const thread_id = params.thread_id;
    const threadName = params.threadName;
    this.setState({ thread_id: thread_id, threadName: threadName });

    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');
    const usersRef = rootRef.child('users');
    var curname = '';
    var curthread = '';

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.once('value', snapshot => {
      var curuser = snapshot.val();
      //get the unseen status of this thread
      var threads = Object.values(snapshot.val().threads);
      var threadIndex = threads.findIndex(obj => obj.thread_id === thread_id);
      if (
        threads[threadIndex].unseen !== undefined &&
        threads[threadIndex].unseen > 0
      ) {
        var total_unseen =
          curuser.threads.total_unseen - threads[threadIndex].unseen;
        if (total_unseen < 0) {
          total_unseen = 0;
        }
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid + '/threads')
          .child(thread_id)
          .child('unseen')
          .set(0);
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid + '/threads')
          .child('total_unseen')
          .set(total_unseen);
      }
      this.setState({ curuser: curuser });
    });

    firebase
      .database()
      .ref()
      .child('threads')
      .child(thread_id)
      .once('value', snapshot => {
        curthread = snapshot.val();
        this.setState({ curthread: snapshot.val() });
        if (curthread.squad_id === 'null') {
          this.setState({ users: Object.values(curthread.users) });
        } else {
          firebase
            .database()
            .ref()
            .child('squads')
            .child(curthread.squad_id)
            .once('value', snapshot => {
              this.setState({ users: Object.values(snapshot.val().users) });
            });
        }
      });

    messagesRef
      .orderByChild('thread')
      .equalTo(thread_id)
      .on('child_added', snapshot => {
        const { createdAt, user, extra_info, extra_id } = snapshot.val();
        var { text } = snapshot.val();
        var comments = 0;
        const { key: _id } = snapshot;
        if (snapshot.val().comments > 0) {
          if (snapshot.val().comments === 1) {
            text = text + '\n\n' + snapshot.val().comments + ' Comment';
          } else {
            text = text + '\n\n' + snapshot.val().comments + ' Comments';
          }
        }
        const message = {
          _id,
          createdAt,
          text,
          user,
          extra_info,
          extra_id,
        };
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, message),
        }));
      });

    messagesRef
      .orderByChild('thread')
      .equalTo(thread_id)
      .on('child_changed', snapshot => {
        const { createdAt, user, extra_info, extra_id } = snapshot.val();
        var { text } = snapshot.val();
        var comments = 0;
        const { key: _id } = snapshot;
        if (snapshot.val().comments > 0) {
          text = text + '\n\n' + snapshot.val().comments + ' Comments';
        }
        const message = {
          _id,
          createdAt,
          text,
          user,
          extra_info,
          extra_id,
        };
        var switchArray = this.state.messages;
        var index = switchArray.findIndex(obj => obj._id === message._id);
        switchArray[index] = message;
        this.setState({
          messages: switchArray,
        });
      });
  }

  componentWillUnmount() {
    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.once('value', snapshot => {
      var curuser = snapshot.val();
      //get the unseen status of this thread
      var threads = Object.values(snapshot.val().threads);
      var threadIndex = threads.findIndex(
        obj => obj.thread_id === this.state.thread_id
      );
      if (
        threads[threadIndex].unseen !== undefined &&
        threads[threadIndex].unseen > 0
      ) {
        var total_unseen =
          curuser.threads.total_unseen - threads[threadIndex].unseen;
        if (total_unseen < 0) {
          total_unseen = 0;
        }
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid + '/threads')
          .child(this.state.thread_id)
          .child('unseen')
          .set(0);
        firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid + '/threads')
          .child('total_unseen')
          .set(total_unseen);
      }
      this.setState({ curuser: curuser });
    });
  }

  onSend(messages) {
    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];
      const thread = this.state.thread_id;
      user.name =
        this.state.curuser.first_name + ' ' + this.state.curuser.last_name;
      const message = {
        text,
        user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        thread,
      };
      firebase
        .database()
        .ref('messages')
        .push(message);
    }

    for (let i = 0; i < this.state.users.length; i++) {
      if (
        Object.values(this.state.users)[i].user_id !==
        firebase.auth().currentUser.uid
      ) {
        firebase
          .database()
          .ref()
          .child('users')
          .child(Object.values(this.state.users)[i].user_id)
          .child('threads')
          .child(this.state.thread_id)
          .once('value', snapshot => {
            var unseen = 1;
            if (
              snapshot.val().unseen !== undefined &&
              snapshot.val().unseen !== null
            ) {
              unseen = snapshot.val().unseen + 1;
            }
            firebase
              .database()
              .ref()
              .child('users')
              .child(Object.values(this.state.users)[i].user_id)
              .child('threads')
              .child(this.state.thread_id)
              .child('unseen')
              .set(unseen);
            firebase
              .database()
              .ref()
              .child('users')
              .child(Object.values(this.state.users)[i].user_id)
              .child('threads')
              .child(this.state.thread_id)
              .child('last_updated')
              .set(firebase.database.ServerValue.TIMESTAMP);
          });
        firebase
          .database()
          .ref()
          .child('users')
          .child(Object.values(this.state.users)[i].user_id)
          .child('threads')
          .once('value', snapshot => {
            var total_unseen = 1;
            if (
              snapshot.val().total_unseen !== undefined &&
              snapshot.val().total_unseen !== null
            ) {
              total_unseen = snapshot.val().total_unseen + 1;
            }
            firebase
              .database()
              .ref()
              .child('users')
              .child(Object.values(this.state.users)[i].user_id)
              .child('threads')
              .child('total_unseen')
              .set(total_unseen);
          });
      }
    }
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

  renderDay(props) {
    return <Day {...props} textStyle={{ color: 'black' }} />;
  }

  renderActions(props) {
    return <Actions {...props} />;
  }

  /*renderInputToolbar(props) {
    return <InputToolbar {...props} width={{ color: Dimensions.get('window').width }} />;
  }*/

  messagePress = (context, message) => {
    if (message.extra_info === 'poll') {
      NavigationService.navigate('PollScreen', {
        poll_id: message.extra_id,
        pollName: this.state.threadName,
      });
    } else if (message.extra_info === 'task') {
      NavigationService.navigate('TaskScreen', {
        task_id: message.extra_id,
        taskName: this.state.threadName,
      });
    } else if (message.extra_info === 'event') {
      NavigationService.navigate('EventScreen', {
        event_id: message.extra_id,
        eventName: this.state.threadName,
      });
    } else if (message.extra_info === 'scheduler') {
      NavigationService.navigate('SchedulerScreen', {
        scheduler_id: message.extra_id,
        schedulerName: this.state.threadName,
      });
    } else {
      NavigationService.navigate('CommentScreen', {
        parentName: 'Message Comments',
        parent: message._id,
        comment_type: 'messages',
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#51FFE8', '#6BB4FF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            <GiftedChat
              onLongPress={this.messagePress.bind(this)}
              extraData={this.state}
              messages={this.state.messages}
              renderUsernameOnMessage={true}
              onSend={messages => this.onSend(messages)}
              user={{
                _id: firebase.auth().currentUser.uid,
              }}
              renderDay={this.renderDay}
              renderActions={this.renderActions}
              //renderInputToolbar={this.renderInputToolbar}
            />
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
    height:
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? Dimensions.get('window').height * 0.85
        : Dimensions.get('window').height * 0.9,
    width: Dimensions.get('window').width,
    paddingRight:
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? null
        : Dimensions.get('window').width * 0.01,
  },
});
