import * as React from 'react';
import * as firebase from 'firebase';
import {
  GiftedChat,
  Day,
  InputToolbar,
  ChatFooter,
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../../navigation/NavigationService';
import BottomMenu from '../../components/BottomMenu';

export default class ThreadScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('threadName', 'Chat'),
    };
  };

  state = {
    messages: [],
    curuser: '',
    curthread: '',
    threadName: '',
  };

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
    const { params } = this.props.navigation.state;
    const thread_id = params.thread_id;
    const threadName = params.threadName;
    this.setState({ curthread: thread_id, threadName: threadName });

    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');
    const usersRef = rootRef.child('users');
    var curname = '';

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    messagesRef
      .orderByChild('thread')
      //.equalTo(curthread.thread)
      .equalTo(thread_id)
      .on('child_added', snapshot => {
        const { createdAt, text, user, extra_info, extra_id } = snapshot.val();
        const { key: _id } = snapshot;
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
  }

  onSend(messages) {
    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];
      //const thread = this.state.curthread.thread;
      const thread = this.state.curthread;
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
  }

  renderDay(props) {
    return <Day {...props} textStyle={{ color: 'white' }} />;
  }

  /*renderInputToolbar(props) {
    return <InputToolbar {...props} width={{ color: Dimensions.get('window').width }} />;
  }*/

  messagePress = (context, message) => {
    if (message.extra_info === 'poll') {
      firebase
        .database()
        .ref('polls/' + message.extra_id)
        .once('value', snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          //get the responded status of the current user
          var users = item.users;
          var userIndex = users.findIndex(
            obj => obj.user_id === firebase.auth().currentUser.uid
          );
          if (userIndex !== -1) {
            item.responded = users[userIndex].responded;
            item.answers = users[userIndex].answers;
          } else {
            item.responded = null;
          }
          NavigationService.navigate('PollScreen', {
            curpoll: item,
            pollName: this.state.threadName,
          });
        });
    } else if (message.extra_info === 'task') {
      firebase
        .database()
        .ref('tasks/' + message.extra_id)
        .once('value', snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          NavigationService.navigate('TaskScreen', {
            curtask: item,
            taskName: this.state.threadName,
          });
        });
    } else if (message.extra_info === 'event') {
      firebase
        .database()
        .ref('events/' + message.extra_id)
        .once('value', snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          NavigationService.navigate('EventScreen', {
            curevent: item,
            eventName: this.state.threadName,
          });
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
              messages={this.state.messages}
              onSend={messages => this.onSend(messages)}
              user={{
                _id: firebase.auth().currentUser.uid,
              }}
              renderDay={this.renderDay}
              //renderInputToolbar={this.renderInputToolbar}
            />
          </View>
        </LinearGradient>
        {/*<BottomMenu curuser={this.state.curuser} />*/}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height * 0.9,
    width: Dimensions.get('window').width,
    paddingRight: Dimensions.get('window').width * 0.01,
  },
});
