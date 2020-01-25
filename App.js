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
import MyPollsScreen from './screens/Polls/MyPollsScreen';
import PollScreen from './screens/Polls/PollScreen';
import MyThreadsScreen from './screens/Threads/MyThreadsScreen';
import MyTasksScreen from './screens/Tasks/MyTasksScreen';
import MyEventsScreen from './screens/Events/MyEventsScreen';
import UserScreen from './screens/UserScreen';
import MySquadsScreen from './screens/Squads/MySquadsScreen';
import SquadScreen from './screens/Squads/SquadScreen';
import CreateSquadScreen from './screens/Squads/CreateSquadScreen';
import MyInvitesScreen from './screens/Invites/MyInvitesScreen';
import InviteScreen from './screens/Invites/InviteScreen';
import CreateInviteScreen from './screens/Invites/CreateInviteScreen';
import ThreadScreen from './screens/Threads/ThreadScreen';
import CreateThreadScreen from './screens/Threads/CreateThreadScreen';
import CreatePollScreen from './screens/Polls/CreatePollScreen';
import TaskScreen from './screens/Tasks/TaskScreen';
import CreateTaskScreen from './screens/Tasks/CreateTaskScreen';
import EventScreen from './screens/Events/EventScreen';
import CreateEventScreen from './screens/Events/CreateEventScreen';
import MySchedulersScreen from './screens/Schedulers/MySchedulersScreen';
import SchedulerScreen from './screens/Schedulers/SchedulerScreen';
import CreateSchedulerScreen from './screens/Schedulers/CreateSchedulerScreen';
import CommentScreen from './screens/Threads/CommentScreen';
import MediaChatScreen from './screens/Threads/MediaChatScreen';

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
  MySchedulersScreen,
  SchedulerScreen,
  CreateSchedulerScreen,
  CommentScreen,
  MediaChatScreen,
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
