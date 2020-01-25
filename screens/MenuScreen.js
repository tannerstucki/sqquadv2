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
  Easing,
  Animated,
} from 'react-native';
import NavigationService from '../navigation/NavigationService';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenu from '../components/BottomMenu';

export default class MenuScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Menu',
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
      curuser: '',
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

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
                    {this.state.curuser.invites_unseen > 0 ? (
                      <View style={styles.circle}>
                        {this.state.curuser.invites_unseen < 99 ? (
                          <Text style={{ color: '#D616CF' }}>
                            {this.state.curuser.invites_unseen} New
                          </Text>
                        ) : (
                          <Text style={{ color: '#D616CF' }}>99 New</Text>
                        )}
                      </View>
                    ) : null}
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
    backgroundColor: '#9ED4FF',
    flexDirection: 'row',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.75,
  },
  circle: {
    width: 60,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: Dimensions.get('window').height * 0.02,
    marginLeft: Dimensions.get('window').width * 0.03,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
  },
});
