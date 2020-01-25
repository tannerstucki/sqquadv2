import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  Alert,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Easing,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import BottomMenu from '../../components/BottomMenu';
import NavigationService from '../../navigation/NavigationService';

export default class MyInvitesScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My Invites',
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
      data: [],
      loading: true,
      noInvites: true,
      maxlimit: 30,
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const rootRef = firebase.database().ref();
    const invitesRef = rootRef.child('invites');
    var invite_array = [];
    var curemail = '';

    var email_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    email_ref
      .on('value', snapshot => {
        curemail = snapshot.val().email;
      })
      .bind(this);
    var data_ref = firebase
      .database()
      .ref('invites/')
      .orderByChild('acceptor_email')
      .equalTo(curemail)
      .on('value', snapshot => {
        snapshot.forEach(snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          //invite_array.unshift(item);
          var switchArray = this.state.data;
          var index = switchArray.findIndex(obj => obj.key === item.key);
          if (index !== -1) {
            switchArray[index] = item;
            //switchArray.splice(index, 1);
            this.setState({ data: switchArray, noInvites: false });
          } else {
            switchArray.unshift(item);
            this.setState({ data: switchArray, noInvites: false });
          }
          //this.setState({ noInvites: false, data: invite_array });
        });
        this.setState({ loading: false });
      })
      .bind(this);
  }

  /*demoAsyncCall() {
    return new Promise(resolve => setTimeout(() => resolve(), 200));
  }*/

  openInvite(curinvite, curuser) {
    NavigationService.navigate('InviteScreen', {
      invite_id: curinvite.key,
    });
  }

  openCreateInvite(curuser) {
    NavigationService.navigate('CreateInviteScreen', {
      cursquad: null,
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
            {this.state.loading ? (
              <React.Fragment>
                <View style={styles.loading}>
                  <Text style={styles.info}>Loading</Text>
                  <ActivityIndicator size="large" color="white" />
                </View>
              </React.Fragment>
            ) : (
              <View style={styles.container}>
                <Text>{this.state.noInvites}</Text>
                {this.state.noInvites == true ? (
                  <React.Fragment>
                    <Text style={styles.noInvites}>
                      Sorry, you have no invites.
                    </Text>
                    <Text style={styles.noInvites}>
                      Message the squad organizer to get your invite or invite
                      others to your squads!
                    </Text>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <FlatList
                      data={this.state.data}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.openInvite.bind(this, item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text style={styles.info}>
                                {item.squad_name.length > this.state.maxlimit
                                  ? item.squad_name.substring(
                                      0,
                                      this.state.maxlimit - 3
                                    ) + '...'
                                  : item.squad_name}
                              </Text>
                              {item.unseen === true ? (
                                <View style={styles.circle}>
                                  <Text style={{ color: '#D616CF' }}>New</Text>
                                </View>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                  </React.Fragment>
                )}
                {/*for spacing*/}
                <FlatList />
                <TouchableOpacity onPress={this.openCreateInvite.bind(this)}>
                  <View style={styles.customButton}>
                    <Text style={styles.buttonText}>Invite a Friend</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    height: Dimensions.get('window').height * .8,
  },
  loading: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 50,
  },
  info: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  noInvites: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
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
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height * -0.01,
    marginTop: Dimensions.get('window').height * 0,
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  circle: {
    width: 50,
    height: 25,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: Dimensions.get('window').height * 0.035,
    marginRight: Dimensions.get('window').width * 0.3,
    alignSelf: 'right',
    alignContent: 'center',
    alignItems: 'center',
  },
});
