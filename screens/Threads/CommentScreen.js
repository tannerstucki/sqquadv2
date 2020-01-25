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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../../navigation/NavigationService';
import BottomMenu from '../../components/BottomMenu';

export default class CommentScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('parentName', 'Comments'),
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
  };

  state = {
    comments: [],
    curuser: '',
    parent_id: '',
    parentName: '',
    users: [],
    comment_type: '',
  };

  parse = snapshot => {
    const { timestamp: numberStamp, text, user } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const comment = {
      _id,
      timestamp,
      text,
      user,
    };
    return comment;
  };

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const parent_id = params.parent;
    const parentName = params.parentName;
    const comment_type = params.comment_type;
    this.setState({
      parent_id: parent_id,
      parentName: parentName,
      comment_type: comment_type,
    });

    const rootRef = firebase.database().ref();
    const commentsRef = rootRef.child('comments');
    const usersRef = rootRef.child('users');
    var curname = '';
    var curparent = '';

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.once('value', snapshot => {
      var curuser = snapshot.val();
      this.setState({ curuser: curuser });
    });

    commentsRef
      .orderByChild('parent')
      .equalTo(parent_id)
      .on('child_added', snapshot => {
        const {
          createdAt,
          text,
          user,
          parent_id,
          comment_type,
        } = snapshot.val();

        const { key: _id } = snapshot;
        const comment = {
          _id,
          createdAt,
          text,
          user,
          parent_id,
          comment_type,
        };
        this.setState(previousState => ({
          comments: GiftedChat.append(previousState.comments, comment),
        }));
      });
  }

  componentWillUnmount() {}

  onSend(comments) {
    for (let i = 0; i < comments.length; i++) {
      const { text, user, createdAt, parent_id, parent_type } = comments[i];
      const parent = this.state.parent_id;
      user.name =
        this.state.curuser.first_name + ' ' + this.state.curuser.last_name;
      var comment_type = this.state.comment_type;
      const comment = {
        text,
        user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        parent,
        comment_type,
      };
      firebase
        .database()
        .ref('comments')
        .push(comment);

      //Increment parent comments
      firebase
        .database()
        .ref()
        .child(this.state.comment_type)
        .child(parent)
        .child('comments')
        .once('value', snapshot => {
          var comments = 1;
          if (snapshot.val() !== null) {
            comments = snapshot.val() + 1;
          }
          firebase
            .database()
            .ref()
            .child(this.state.comment_type)
            .child(parent)
            .child('comments')
            .set(comments);
        });
    }
  }

  renderDay(props) {
    return <Day {...props} textStyle={{ color: 'black' }} />;
  }

  /*renderInputToolbar(props) {
    return <InputToolbar {...props} width={{ color: Dimensions.get('window').width }} />;
  }*/

  commentPress = (context, comment) => {};

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#FF97FB', '#6BB4FF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            <GiftedChat
              onLongPress={this.commentPress.bind(this)}
              messages={this.state.comments}
              renderUsernameOnMessage={true}
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
