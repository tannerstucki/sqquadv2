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
import BottomMenu from '../../components/BottomMenu';
import { createStackNavigator } from 'react-navigation';
import NavigationService from '../../navigation/NavigationService';

export default class MySquadsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My Squads',
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
      noSquads: true,
      maxlimit: 30,
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });
    
    const rootRef = firebase.database().ref();
    const squadsRef = rootRef.child('squads');
    var squads = [];

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('squads');
    data_ref.on('child_added', snapshot => {
      squadsRef
        .child(snapshot.val().squad_id)
        .orderByChild('name')
        .on('value', snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          squads.unshift(item);
          this.setState({ data: squads, noSquads: false });
        });
    });
    this.setState({ loading: false });
  }

  openSquad(cursquad) {
    NavigationService.navigate('SquadScreen', {
      cursquad: cursquad,
    });
  }

  openCreateSquad() {
    NavigationService.navigate('CreateSquadScreen');
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
                <Text>{this.state.noSquads}</Text>
                {this.state.noSquads == true ? (
                  <React.Fragment>
                    <Text style={styles.noSquads}>
                      Sorry, you have no squads.
                    </Text>
                    <Text style={styles.noSquads}>
                      Create or join one to get started!
                    </Text>
                  </React.Fragment>
                ) : null}
                <FlatList
                  data={this.state.data}
                  renderItem={({ item }) => (
                    <React.Fragment>
                      <TouchableOpacity
                        onPress={this.openSquad.bind(this, item)}>
                        <Text style={styles.info}>
                          {item.name.length > this.state.maxlimit
                            ? item.name.substring(0, this.state.maxlimit - 3) +
                              '...'
                            : item.name}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.line} />
                    </React.Fragment>
                  )}
                />
                <TouchableOpacity onPress={this.openCreateSquad.bind(this)}>
                  <View style={styles.customButton}>
                    <Text style={styles.buttonText}>Create New Squad</Text>
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
  noSquads: {
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
    marginBottom: Dimensions.get('window').height * 0,
    marginTop: Dimensions.get('window').height * 0.01,
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
