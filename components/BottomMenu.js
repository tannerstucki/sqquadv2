import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import NavigationService from '../navigation/NavigationService';

class BottomMenu extends React.Component {
  static navigationOptions = {
    title: 'BottomMenu',
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  menuClick(curuser) {
    NavigationService.navigate('MenuScreen');
  }

  chatClick(curuser) {
    NavigationService.navigate('MyThreadsScreen');
  }

  tasksClick(curuser) {
    NavigationService.navigate('MyTasksScreen');
  }

  pollsClick(curuser) {
    NavigationService.navigate('MyPollsScreen');
  }

  timersClick(curuser) {
    NavigationService.navigate('MyEventsScreen');
  }

  render() {
    const curuser = this.props.curuser;
    return (
      <View style={styles.fill}>
        <TouchableOpacity onPress={this.menuClick.bind(this, curuser)}>
          <Image
            style={styles.icon}
            source={require('assets/icons/menu.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.chatClick.bind(this, curuser)}>
          <Image
            style={styles.icon}
            source={require('assets/icons/chat.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.tasksClick.bind(this, curuser)}>
          <Image
            style={styles.icon}
            source={require('assets/icons/list.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.pollsClick.bind(this, curuser)}>
          <Image
            style={styles.icon}
            source={require('assets/icons/question.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.timersClick.bind(this, curuser)}>
          <Image
            style={styles.icon}
            source={require('assets/icons/time.png')}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export default withNavigation(BottomMenu);

const styles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
    margin: 20,
  },
  fill: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '10%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { height: -3 },
    shadowColor: 'black',
    shadowOpacity: .25,
  },
});
