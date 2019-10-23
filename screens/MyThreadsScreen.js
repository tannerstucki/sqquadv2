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
    //headerLeft: navigate back to home screen
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      threads: [],
    };
  }

  pushThread(val) {
    var switchArray = this.state.threads;
    var index = switchArray.findIndex(obj => obj.thread === val.thread);
    if (index !== -1) {
      switchArray.splice(index, 1);
      switchArray.unshift(val);
      this.setState({ threads: switchArray });
    } else {
      switchArray.push(val);
      this.setState({ threads: switchArray });
    }
  }

  componentDidMount() {
    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');
    const usersRef = rootRef.child('users');

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
        .equalTo(snapshot.val())
        .limitToLast(1)
        .on('child_added', snapshot => {
          this.pushThread(snapshot.val());
        });
    });
    this.setState({ loading: false });
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
                <FlatList
                  data={this.state.threads}
                  extraData={this.state}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      <TouchableOpacity /*onPress={this.openSquad.bind(this, item)}*/
                      >
                        {item.user._id === firebase.auth().currentUser.uid ? (
                          <Text style={styles.info}>You: {item.text}</Text>
                        ) : (
                          <Text style={styles.info}>
                            {item.user.name}: {item.text}
                          </Text>
                        )}
                        <Text style={styles.info}>
                          {new Date(parseInt(item.createdAt)).toLocaleString(
                            'en-US',
                            { timeZone: 'America/Los_Angeles' }
                          )}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.line} />
                    </React.Fragment>
                  )}
                />
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
  fill: {
    height: Dimensions.get('window').height * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
  },
  info: {
    fontSize: 15,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  line: {
    backgroundColor: '#E8E8E8',
    height: 1,
    width: Dimensions.get('window').width * 0.9,
    alignSelf: 'center',
  },
});
