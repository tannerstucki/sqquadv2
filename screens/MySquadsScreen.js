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

export default class MySquadsScreen extends React.Component {
  static navigationOptions = {
    title: 'My Squads',
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      noSquads: true,
    };
  }

  componentDidMount() {
    const rootRef = firebase.database().ref();
    const usersquadRef = rootRef.child('usersquad');
    const squadsRef = rootRef.child('squads');
    var squad_array = [];

    usersquadRef
      .orderByChild('user_id')
      .equalTo(firebase.auth().currentUser.uid)
      .on('child_added', snapshot => {
        let squadRef = squadsRef.child(snapshot.child('squad_id').val());
        squadRef.once('value', snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          squad_array.push(item);
          this.setState({ noSquads: false, data: squad_array });
        });
      })
      .bind(this);
    //this.setState({ data: squad_array, loading: false });
    this.setState({ loading: false });

    //this.demoAsyncCall().then(() => this.setState({ data: squad_array, loading: false }));
  }

  /*demoAsyncCall() {
    return new Promise(resolve => setTimeout(() => resolve(), 200));
  }*/

  openSquad(cursquad, curuser) {
    NavigationService.navigate('SquadScreen', {
      cursquad: cursquad,
      curuser: curuser,
    });
  }

  openCreateSquad(curuser) {
    NavigationService.navigate('CreateSquadScreen', {
      curuser: curuser,
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
                        <Text style={styles.info}>{item.name} </Text>
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
    marginBottom: Dimensions.get('window').height * 0.1,
    marginTop: Dimensions.get('window').height * 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
