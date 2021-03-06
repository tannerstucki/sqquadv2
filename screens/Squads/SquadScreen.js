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
  HeaderBackButton,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Easing,
  Animated,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from 'react-navigation';
import NavigationService from '../../navigation/NavigationService';

export default class SquadScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Squad Info',
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
      cursquad: '',
      squadOrganizer: '',
      loading: true,
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    const cursquad = params.cursquad;
    this.setState({ cursquad: cursquad });

    var data_ref = firebase
      .database()
      .ref()
      .child('users')
      .child(cursquad.organizer_id);
    data_ref.on('value', snapshot => {
      this.setState({ squadOrganizer: snapshot.val(), loading: false });
    });
  }

  openUser(user) {
    NavigationService.navigate('UserScreen', {
      otherUser: user,
    });
  }

  openCreateInvite() {
    NavigationService.navigate('CreateInviteScreen', {
      cursquad: this.state.cursquad,
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

  openSquadBoard() {
    firebase
      .database()
      .ref()
      .child('threads')
      .orderByChild('squad_id')
      .equalTo(this.state.cursquad.key)
      .once('value', snapshot => {
        NavigationService.navigate('ThreadScreen', {
          curthread: snapshot.val(),
          threadName: Object.values(snapshot.val())[0].squad_name,
          thread_id: Object.keys(snapshot.val())[0],
        });
      });
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <ScrollView style={styles.fill}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Text style={styles.info}>{this.state.cursquad.name}</Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Name</Text>
                <Text style={styles.info}>
                  {this.state.cursquad.description}
                </Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Description</Text>
                <Text style={styles.info}>{this.state.cursquad.zip}</Text>
                <View style={styles.line} />
                <Text style={styles.generic}>Location</Text>
                <TouchableOpacity
                  onPress={this.openUser.bind(this, this.state.squadOrganizer)}>
                  <Text style={styles.info}>
                    {this.state.squadOrganizer.first_name}{' '}
                    {this.state.squadOrganizer.last_name}
                  </Text>
                </TouchableOpacity>
                <View style={styles.line} />
                <Text style={styles.generic}>Squad Organizer</Text>
              </React.Fragment>
            )}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={this.openCreateInvite.bind(this)}>
              <View style={styles.customButton}>
                <Text style={styles.buttonText}>
                  Invite a Friend to this Squad
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.openSquadBoard.bind(this)}>
              <View style={styles.customButton}>
                <Text style={styles.buttonText}>Squad Board</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/*Add squad options like invite friend, leave group, etc.*/}
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
    height: Dimensions.get('window').height * 0.66,
    alignItems: 'left',
    justifyContent: 'left',
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
    marginBottom: Dimensions.get('window').height * 0.05,
    marginTop: Dimensions.get('window').height * 0.01,
    marginHorizontal: Dimensions.get('window').width * 0.05,
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: .5,
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
