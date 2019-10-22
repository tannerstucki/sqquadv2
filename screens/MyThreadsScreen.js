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

  componentDidMount() {
    const rootRef = firebase.database().ref();
    const messagesRef = rootRef.child('messages');
    const usersRef = rootRef.child('users');

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
          console.log(snapshot.val());
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
          <View
            style={{
              height: Dimensions.get('window').height * 0.8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  padding: 16,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Messages Screen
              </Text>
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
    fontSize: 18,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
