import React from 'react';
import * as firebase from 'firebase';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator, HeaderBackButton } from 'react-navigation-stack';
import { Text, StyleSheet, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { GiftedChat } from 'react-native-gifted-chat';

import ApiKeys from './constants/ApiKeys';
import NavigationService from './navigation/NavigationService';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingScreen from './screens/LoadingScreen';
import MenuScreen from './screens/MenuScreen';
import MyPollsScreen from './screens/MyPollsScreen';
import PollScreen from './screens/PollScreen';
import MyThreadsScreen from './screens/MyThreadsScreen';
import MyTasksScreen from './screens/MyTasksScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import UserScreen from './screens/UserScreen';
import MySquadsScreen from './screens/MySquadsScreen';
import SquadScreen from './screens/SquadScreen';
import CreateSquadScreen from './screens/CreateSquadScreen';
import MyInvitesScreen from './screens/MyInvitesScreen';
import InviteScreen from './screens/InviteScreen';
import CreateInviteScreen from './screens/CreateInviteScreen';
import ThreadScreen from './screens/ThreadScreen';
import CreateThreadScreen from './screens/CreateThreadScreen';
import CreatePollScreen from './screens/CreatePollScreen';
import TaskScreen from './screens/TaskScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import EventScreen from './screens/EventScreen';
import CreateEventScreen from './screens/CreateEventScreen';

const RootStackNavigator = createStackNavigator({
  LoadingScreen,
  LoginScreen,
  HomeScreen,
  RegisterScreen,
  UserScreen,
  MySquadsScreen,
  SquadScreen,
  CreateSquadScreen,
  MyInvitesScreen,
  InviteScreen,
  CreateInviteScreen,
  PollScreen,
  CreatePollScreen,
  CreateThreadScreen,
  TaskScreen,
  CreateTaskScreen,
  EventScreen,
  CreateEventScreen,
  ThreadScreen: {
    screen: ThreadScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="My Messages"
            onPress={() => navigation.navigate('MyThreadsScreen')}
          />
        ),
      };
    },
  },
  MenuScreen: {
    screen: MenuScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="Home"
            onPress={() => navigation.navigate('HomeScreen')}
          />
        ),
      };
    },
  },
  MyPollsScreen: {
    screen: MyPollsScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="Home"
            onPress={() => navigation.navigate('HomeScreen')}
          />
        ),
      };
    },
  },
  MyThreadsScreen: {
    screen: MyThreadsScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="Home"
            onPress={() => navigation.navigate('HomeScreen')}
          />
        ),
      };
    },
  },
  MyTasksScreen: {
    screen: MyTasksScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="Home"
            onPress={() => navigation.navigate('HomeScreen')}
          />
        ),
      };
    },
  },
  MyEventsScreen: {
    screen: MyEventsScreen,
    navigationOptions({ navigation }) {
      return {
        headerLeft: (
          <HeaderBackButton
            title="Home"
            onPress={() => navigation.navigate('HomeScreen')}
          />
        ),
      };
    },
  },
});

const AppContainer = createAppContainer(RootStackNavigator);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(ApiKeys.FirebaseConfig);
    }
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  onAuthStateChanged = user => {
    if (!user) {
      console.log('You are currently logged out.');
      this.setState({ isAuthenticated: false });
      NavigationService.navigate('LoginScreen');
    } else {
      this.setState({ isAuthenticated: true });
    }
  };

  render() {
    return (
      <AppContainer
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}
