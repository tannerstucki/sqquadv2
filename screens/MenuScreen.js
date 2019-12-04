import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import NavigationService from '../navigation/NavigationService';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenu from '../components/BottomMenu';

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
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

  accountClick(curuser) {
    NavigationService.navigate('UserScreen');
  }

  mySquadsClick(curuser) {
    NavigationService.navigate('MySquadsScreen');
  }

  myInvitesClick(curuser) {
    NavigationService.navigate('MyInvitesScreen');
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={{ height: Dimensions.get('window').height * 0.78 }}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <View style={styles.banner}>
                  <Image
                    style={styles.logo}
                    source={require('assets/LittleBlack.png')}
                  />
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.user_name}>
                      {' '}
                      {this.state.curuser.first_name}{' '}
                      {this.state.curuser.last_name}
                    </Text>
                    <Text style={styles.user_location}>
                      {' '}
                      {this.state.curuser.zip}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={this.accountClick.bind(this)}>
                  <View style={styles.row}>
                    <Image
                      style={styles.icon}
                      source={require('assets/icons/user.png')}
                    />
                    <Text style={styles.options}>ACCOUNT</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.mySquadsClick.bind(this)}>
                  <View style={styles.row}>
                    <Image
                      style={styles.icon}
                      source={require('assets/icons/squads.png')}
                    />
                    <Text style={styles.options}>MY SQUADS</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.myInvitesClick.bind(this)}>
                  <View style={styles.row}>
                    <Image
                      style={styles.icon}
                      source={require('assets/icons/invitation.png')}
                    />
                    <Text style={styles.options}>MY INVITES</Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            )}
          </View>
          <Text
            style={{ color: 'white', marginLeft: 15, fontSize: 10 }}
            onPress={() =>
              Linking.openURL('https://www.flaticon.com/authors/smashicons')
            }>
            Icons made by Smashicons from Flaticon
          </Text>
        </LinearGradient>
        <BottomMenu curuser={this.state.curuser} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  options: {
    fontSize: 20,
    padding: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  user_name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop: 20,
  },
  user_location: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    height: Dimensions.get('window').height * 0.1,
    width: Dimensions.get('window').height * 0.1,
    margin: 5,
    marginLeft: 15,
  },
  icon: {
    height: 35,
    width: 35,
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    margin: 15,
  },
  banner: {
    height: '15%',
    backgroundColor: '#91BEEC',
    flexDirection: 'row',
  },
});
