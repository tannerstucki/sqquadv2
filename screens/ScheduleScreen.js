import React from 'react';
import * as firebase from 'firebase';
import { View, Text, Image, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationService from '../navigation/NavigationService';

export default class ScheduleScreen extends React.Component {
  static navigationOptions = {
    title: 'Schedule',
    //headerLeft: navigate back to home screen
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
    };
  }

  componentDidMount() {
    var userId = firebase.auth().currentUser.uid;
    return firebase
      .database()
      .ref('/users/' + userId)
      .once('value')
      .then(snapshot => {
        var curuser = snapshot.val() || 'Anonymous';
        this.setState({ curuser: curuser, loading: false });
      });
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
              height: Dimensions.get('window').height * .8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white"/>
              </React.Fragment>
            ) : (
            <Text
              style={{
                fontSize: 18,
                padding: 16,
                fontWeight: 'bold',
                color: 'white',
              }}>
              Schedule Screen
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
