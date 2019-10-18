import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import NavigationService from '../navigation/NavigationService';

export default class InviteScreen extends React.Component {
  static navigationOptions = {
    title: 'Invite Info',
  };

  constructor(props) {
    super(props);
    this.state = {
      sender: '',
      squad: '',
    };
  }

  componentWillMount() {
    const { params } = this.props.navigation.state;
    const curinvite = params.curinvite;

    var squad_ref = firebase
      .database()
      .ref()
      .child('squads')
      .child(curinvite.squad_id);
    squad_ref.on('value', snapshot => {
      this.setState({ squad: snapshot.val() });
    });

    var sender_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(curinvite.sender_id);
    sender_ref.on('value', snapshot => {
      this.setState({ sender: snapshot.val() });
    });
  }

  openUser(user) {
    NavigationService.navigate('UserScreen', {
      otherUser: user,
    });
  }

  accept(curinvite) {
    var updateData = {
      squad_name: curinvite.squad_name,
      acceptor_id: firebase.auth().currentUser.uid,
      squad_id: curinvite.squad_id,
      invite_type: curinvite.invite_type,
      acceptor_email: curinvite.acceptor_email,
      status: 'accepted',
      sender_id: curinvite.sender_id,
    };

    var postUserSquad = {
      user_id: firebase.auth().currentUser.uid,
      squad_id: curinvite.squad_id,
    };

    var newPostKey = firebase
      .database()
      .ref()
      .child('usersquad')
      .push().key;
    var updates = {};
    updates['/invites/' + curinvite.key] = updateData;
    updates['/usersquad/' + newPostKey] = postUserSquad;

    firebase
      .database()
      .ref()
      .update(updates);

    alert('You joined a new squad!');
    NavigationService.navigate('MenuScreen');
  }

  decline(curinvite) {
    var updateData = {
      squad_name: curinvite.squad_name,
      acceptor_id: firebase.auth().currentUser.uid,
      squad_id: curinvite.squad_id,
      invite_type: curinvite.invite_type,
      acceptor_email: curinvite.acceptor_email,
      status: 'declined',
      sender_id: curinvite.sender_id,
    };

    var updates = {};
    updates['/invites/' + curinvite.key] = updateData;

    firebase
      .database()
      .ref()
      .update(updates);

    alert('Invite declined.');
    NavigationService.navigate('MenuScreen');
  }

  render() {
    const { params } = this.props.navigation.state;
    const curinvite = params.curinvite;
    const curuser = params.curuser;
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <ScrollView style={styles.fill}>
            <Text style={styles.info}>{curinvite.squad_name}</Text>
            <View style={styles.line} />
            <Text style={styles.generic}>Name</Text>
            <Text style={styles.info}>{this.state.squad.description}</Text>
            <View style={styles.line} />
            <Text style={styles.generic}>Description</Text>
            <Text style={styles.info}>{this.state.squad.zip}</Text>
            <View style={styles.line} />
            <Text style={styles.generic}>Location</Text>
            <TouchableOpacity
              onPress={this.openUser.bind(this, this.state.sender)}>
              <Text style={styles.info}>
                {this.state.sender.first_name} {this.state.sender.last_name}
              </Text>
            </TouchableOpacity>
            <View style={styles.line} />
            <Text style={styles.generic}>Inviter</Text>
            <Text style={styles.info}>{curinvite.status}</Text>
            <View style={styles.line} />
            <Text style={styles.generic}>Status</Text>
          </ScrollView>
          {curinvite.status == 'new' ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={this.accept.bind(this, curinvite, curuser)}>
                <View style={styles.customButton}>
                  <Text style={styles.buttonText}>Accept</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.decline.bind(this, curinvite, curuser)}>
                <View style={styles.customButton}>
                  <Text style={styles.buttonText}>Decline</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.empty} />
          )}
        </LinearGradient>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    height: Dimensions.get('window').height * 0.77,
    alignItems: 'left',
    justifyContent: 'left',
  },
  empty: {
    height: Dimensions.get('window').height * 0.175,
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
    width: Dimensions.get('window').width * 0.9,
    marginLeft: Dimensions.get('window').width * 0.05,
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.375,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height * 0.1,
    marginHorizontal: Dimensions.get('window').width * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
  },
});
