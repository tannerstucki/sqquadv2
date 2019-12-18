import React from 'react';
import * as firebase from 'firebase';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import App from '../App';
import BottomMenu from '../components/BottomMenu';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
    headerLeft: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
    };
  }

  componentDidMount() {
    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });
  }

  render() {
    const cur = firebase.auth().currentUser.uid;
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
                <Image
                  style={styles.logo}
                  source={require('../assets/BigWhite.png')}
                />
                <Text style={styles.info} key="user_name">
                  Let's Get It, {this.state.curuser.first_name}
                </Text>
                <TouchableOpacity>
                  <View style={styles.circle}>
                    <Image
                      style={styles.icon}
                      source={require('assets/icons/plus.png')}
                    />
                  </View>
                </TouchableOpacity>
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
  icon: {
    height: 30,
    width: 30,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.15,
    marginLeft: Dimensions.get('window').width * 0.3,
    alignSelf: 'right',
    position: 'absolute',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 18,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    height: Dimensions.get('window').height * 0.2,
    width: Dimensions.get('window').height * 0.2,
    alignSelf: 'center',
    margin: 20,
  },
});
