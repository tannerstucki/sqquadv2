import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  FlatList,
  Easing,
  Animated,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import NavigationService from '../navigation/NavigationService';
import App from '../App';

export default class UserScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Account Info',
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
      //headerLeft: navigate back to home screen
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
      otherUser: false,
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    if (params) {
      const otherUser = params.otherUser;
      this.setState({ otherUser: true, curuser: otherUser });
    } else {
      var data_ref = firebase
        .database()
        .ref('users/' + firebase.auth().currentUser.uid);
      data_ref.on('value', snapshot => {
        this.setState({ curuser: snapshot.val(), loading: false });
      });
    }
  }

  onLogoutPress() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        NavigationService.navigate('LoadingScreen');
        alert('Sign out successful.');
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode + ': ' + errorMessage);
      });
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
          <View style={styles.fill}>
            <ScrollView>
              {this.state.loading ? (
                <React.Fragment>
                  <Text style={styles.info}>Loading</Text>
                  <ActivityIndicator size="large" color="white" />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Text style={styles.info} selectable={true}>
                    {this.state.curuser.first_name}{' '}
                    {this.state.curuser.last_name}
                  </Text>
                  <View style={styles.line} />
                  <Text style={styles.generic}>Name</Text>
                  <Text style={styles.info} selectable={true}>
                    {this.state.curuser.email}
                  </Text>
                  <View style={styles.line} />
                  <Text style={styles.generic}>Email</Text>
                  {/*<Text style={styles.info}>
                  {this.state.curuser.phone_number}
                </Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Phone Number</Text>*/}
                  <Text style={styles.info} selectable={true}>
                    {this.state.curuser.zip}
                  </Text>
                  <View style={styles.line} />
                  <Text
                    style={[
                      styles.generic,
                      {
                        marginBottom: Dimensions.get('window').height * 0.0325,
                      },
                    ]}>
                    Location
                  </Text>
                  {!this.state.otherUser ? (
                    <TouchableOpacity
                      style={{height: Dimensions.get('window').height * 0.075}}
                      onPress={this.onLogoutPress.bind(this)}>
                      <View style={styles.customButton}>
                        <Text style={styles.buttonText}>Log Out</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </React.Fragment>
              )}
            </ScrollView>
          </View>
          {/*Add change password and edit button here*/}
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
    height: Dimensions.get('window').height * 0.8,
  },
  info: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  generic: {
    fontSize: 12,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    color: '#E8E8E8',
  },
  line: {
    backgroundColor: '#E8E8E8',
    height: 1,
    width: '90%',
    alignSelf: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: Dimensions.get('window').height * 0.28,
    alignSelf: 'center',
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
