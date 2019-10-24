import * as React from 'react';
import * as firebase from 'firebase';
import { GiftedChat } from 'react-native-gifted-chat';
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

export default class ThreadScreen extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  state = {
    messages: [],
    curuser: '',
    curthread: '',
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
    const curthread = params.curthread;
    this.setState({ curthread: curthread });

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
      this.setState({ curuser: snapshot.val()});
    });

    messagesRef
      .orderByChild('thread')
      .equalTo(curthread.thread)
      .on('child_added', snapshot => {
        const { createdAt, text, user } = snapshot.val();
        const { key: _id } = snapshot;
        const message = {
          _id,
          createdAt,
          text,
          user,
        };
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, message),
        }));
      });
  }

  onSend(messages) {
    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];
      const thread = this.state.curthread.thread;
      user.name = this.state.curuser.first_name + " " + this.state.curuser.last_name;
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

  render() {
    return (
      <LinearGradient
        colors={['#51FFE8', '#FFFFFF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.fill}>
          <GiftedChat
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: firebase.auth().currentUser.uid,
            }}
          />
        </View>
      </LinearGradient>
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
