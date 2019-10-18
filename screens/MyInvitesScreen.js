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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import NavigationService from '../navigation/NavigationService';

export default class MyInvitesScreen extends React.Component {
  static navigationOptions = {
    title: 'My Invites',
  };

  constructor(props) {
    super(props);
    this.state = {
      data: '',
      loading: true,
      noInvites: true,
    };
  }

  componentDidMount() {
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
      .on('child_added', snapshot => {
        var item = snapshot.val();
        item.key = snapshot.key;
        invite_array.push(item);
        this.setState({ noInvites: false, data: invite_array });
      })
      .bind(this);
    this.setState({ loading: false });
  }

  /*demoAsyncCall() {
    return new Promise(resolve => setTimeout(() => resolve(), 200));
  }*/

  openInvite(curinvite, curuser) {
    NavigationService.navigate('InviteScreen', {
      curinvite: curinvite,
      });
  }

  openCreateInvite(curuser) {
    NavigationService.navigate('CreateInviteScreen', {
      cursquad: null,
      });
  }

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
                      Message the squad organizer to get your invite or invite others to your squads!
                    </Text>
                  </React.Fragment>
                ) : null}
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      <TouchableOpacity
                        onPress={this.openInvite.bind(this, item)}>
                        <Text style={styles.info}>{item.squad_name} </Text>
                      </TouchableOpacity>
                      <View style={styles.line} />
                    </React.Fragment>
                  )}
                />
                <TouchableOpacity onPress={this.openCreateInvite.bind(this)}>
                  <View style={styles.customButton}>
                    <Text style={styles.buttonText}>Invite a Friend</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height,
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
    marginBottom: Dimensions.get('window').height * 0.1,
    marginTop: Dimensions.get('window').height * 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
