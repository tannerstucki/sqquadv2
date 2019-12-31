import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import NavigationService from '../../navigation/NavigationService';
import { createStackNavigator } from 'react-navigation';

export default class MyTasksScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('curStatus', 'Tasks'),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      tasks: [],
      statuses: ['To Do', 'In Progress', 'Need Help', 'Done'],
      noTasks: true,
      curStatus: 'All Tasks',
      squadOption: 'My Tasks',
      noSquads: false,
      squads: [],
      switchSquadCardShow: false,
      switchStatusCardShow: false,
    };
  }

  componentDidMount() {
    var user_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });

    const rootRef = firebase.database().ref();
    const tasksRef = rootRef.child('tasks');

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('tasks');
    data_ref.on('value', snapshot => {
      snapshot.forEach(snapshot => {
        tasksRef
          .child(snapshot.val().task_id)
          .orderByChild('createdAt')
          .on('value', snapshot => {
            var item = snapshot.val();
            item.key = snapshot.key;
            var switchArray = this.state.tasks;
            var index = switchArray.findIndex(obj => obj.key === item.key);
            if (index !== -1) {
              switchArray.splice(index, 1);
              switchArray.unshift(item);
              this.setState({ tasks: switchArray, noTasks: false });
            } else {
              switchArray.push(item);
              this.setState({ tasks: switchArray, noTasks: false });
            }
          });
      });
    });

    const squadsRef = rootRef.child('squads');
    var squads = [];

    var user_squad_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('squads');
    user_squad_ref.once('value', snapshot => {
      if (snapshot.val() === null) {
        this.setState({ noSquads: true });
      } else {
        snapshot.forEach(snapshot => {
          squadsRef
            .child(snapshot.val().squad_id)
            .orderByChild('name')
            .once('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;
              squads.unshift(item);
              this.setState({ squads: squads });
            });
        });
      }
    });
    this.setState({ loading: false });
  }

  switchSquadOption() {
    if (this.state.noSquads === true) {
      alert('Sorry, you have no squads. Join or create one to get started!');
    } else {
      this.setState({ switchSquadCardShow: true });
    }
  }

  openTask(curtask) {
    var taskName;
    if (curtask.squad_id !== 'null') {
      for (let i = 0; i < this.state.squads.length; i++) {
        if (this.state.squads[i].key === curtask.squad_id) {
          taskName = this.state.squads[i].name;
          break;
        }
      }
    } else {
      taskName = 'Task Details';
    }

    NavigationService.navigate('TaskScreen', {
      curtask: curtask,
      taskName: taskName,
    });
  }

  createTask() {
    NavigationService.navigate('CreateTaskScreen', {
      squads: this.state.squads,
    });
  }

  chooseStatus(item) {
    if (item !== this.state.curStatus) {
      this.setState({ curStatus: item });
      if (item == 'All Tasks') {
        this.props.navigation.setParams({ curStatus: 'Tasks' });
      } else {
        this.props.navigation.setParams({ curStatus: item });
      }
    }

    this.setState({
      switchStatusCardShow: false,
    });
  }

  chooseSquad(item) {
    if (
      item !== this.state.squadOption &&
      item.name !== this.state.squadOption
    ) {
      this.setState(
        { tasks: [], noTasks: true },
        this.updateTasks.bind(this, item)
      );
    }

    this.setState({
      switchSquadCardShow: false,
    });
  }

  switchStatusOption() {
    if (this.state.switchStatusCardShow === true) {
      this.setState({ switchStatusCardShow: false });
    } else {
      this.setState({ switchStatusCardShow: true });
    }
  }

  updateTasks(item) {
    const rootRef = firebase.database().ref();
    const tasksRef = rootRef.child('tasks');

    if (item.name) {
      this.setState({
        squadOption: item.name,
        squad_id: item.key,
      });
      var squad_data_ref = firebase
        .database()
        .ref('tasks')
        .orderByChild('squad_id')
        .equalTo(item.key);
      squad_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          var switchArray = this.state.tasks;
          var index = switchArray.findIndex(obj => obj.key === item.key);
          if (index == -1) {
            switchArray.push(item);
            this.setState({ tasks: switchArray, noTasks: false });
          }
        });
      });
    } else {
      this.setState({
        squadOption: 'My Tasks',
        squad_id: '',
      });
      var user_data_ref = firebase
        .database()
        .ref('users/' + firebase.auth().currentUser.uid)
        .child('tasks');
      user_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          tasksRef
            .child(snapshot.val().task_id)
            .orderByChild('createdAt')
            .on('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;
              var switchArray = this.state.tasks;
              var index = switchArray.findIndex(obj => obj.key === item.key);
              if (index === -1) {
                switchArray.push(item);
                this.setState({ tasks: switchArray, noTasks: false });
              }
            });
        });
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {!this.state.switchSquadCardShow ? (
                  <React.Fragment>
                    {!this.state.switchStatusCardShow ? (
                      <View style={styles.container}>
                        <React.Fragment>
                          {Platform.OS === 'ios' ||
                          Platform.OS === 'android' ? (
                            <TouchableOpacity
                              onPress={this.switchSquadOption.bind(this)}>
                              <View style={styles.optionView}>
                                <Text style={styles.squadOption}>
                                  {this.state.squadOption}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={this.switchSquadOption.bind(this)}>
                              <View>
                                <Text style={styles.squadOption}>
                                  {this.state.squadOption}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        </React.Fragment>
                        {this.state.noTasks === true ? (
                          <React.Fragment>
                            {this.state.noSquads === true ? (
                              <React.Fragment>
                                <Text style={styles.noTasks}>
                                  Sorry, you have no tasks.
                                </Text>
                                <Text style={styles.noTasks}>
                                  Create a task for yourself or get started by creating or joining a squad!
                                </Text>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <Text style={styles.noTasks}>
                                  Tasks from your new squads will show up here.
                                </Text>
                                <Text style={styles.noTasks}>
                                  To see previously created tasks for your squads, select a squad from the filter above!
                                </Text>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ) : null}
                        <FlatList
                          data={this.state.tasks}
                          extraData={this.state}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <React.Fragment>
                              {this.state.curStatus === 'All Tasks' ? (
                                <React.Fragment>
                                  <TouchableOpacity
                                    onPress={this.openTask.bind(this, item)}>
                                    <Card style={styles.listCard}>
                                      <Text style={styles.info}>
                                        {item.title}
                                      </Text>
                                      {item.users.length === 1 ? (
                                        <Text style={styles.assignedTo}>
                                          Assigned to {item.users[0].user_name}
                                        </Text>
                                      ) : (
                                        <Text style={styles.assignedTo}>
                                          Assigned to multiple users
                                        </Text>
                                      )}
                                    </Card>
                                  </TouchableOpacity>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  {item.users.map((value, index) => {
                                    if (
                                      (value.status === this.state.curStatus &&
                                        value.user_id ===
                                          firebase.auth().currentUser.uid) ||
                                      (value.status === this.state.curStatus &&
                                        this.state.squad_id === item.squad_id)
                                    ) {
                                      return (
                                        <React.Fragment>
                                          <TouchableOpacity
                                            onPress={this.openTask.bind(
                                              this,
                                              item
                                            )}>
                                            <Card style={styles.listCard}>
                                              <Text style={styles.info}>
                                                {item.title}
                                              </Text>
                                              <React.Fragment>
                                                {item.users.length > 1 ? (
                                                  <Text
                                                    style={styles.assignedTo}>
                                                    {value.user_name}'s current
                                                    status (assigned to multiple
                                                    people)
                                                  </Text>
                                                ) : (
                                                  <Text
                                                    style={styles.assignedTo}>
                                                    Assigned to{' '}
                                                    {value.user_name}
                                                  </Text>
                                                )}
                                              </React.Fragment>
                                            </Card>
                                          </TouchableOpacity>
                                        </React.Fragment>
                                      );
                                    }
                                  })}
                                </React.Fragment>
                              )}
                            </React.Fragment>
                          )}
                        />
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            onPress={this.createTask.bind(this)}>
                            <View style={styles.customButton}>
                              <Text style={styles.buttonText}>New Task</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={this.switchStatusOption.bind(this)}>
                            <View style={styles.customButton}>
                              <Text style={styles.buttonText}>
                                Status Filter
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Card style={styles.resultsCard}>
                        <TouchableOpacity
                          onPress={this.chooseStatus.bind(this, 'All Tasks')}>
                          <Text
                            style={[
                              styles.info,
                              { fontSize: 20, textAlign: 'center' },
                            ]}>
                            All Tasks
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.line} />
                        <FlatList
                          style={{ padding: 10 }}
                          data={this.state.statuses}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <React.Fragment>
                              <TouchableOpacity
                                onPress={this.chooseStatus.bind(this, item)}>
                                <Text
                                  style={[
                                    styles.info,
                                    { fontSize: 20, textAlign: 'center' },
                                  ]}>
                                  {item}
                                </Text>
                              </TouchableOpacity>
                              <View style={styles.line} />
                            </React.Fragment>
                          )}
                        />
                      </Card>
                    )}
                  </React.Fragment>
                ) : (
                  <Card style={styles.resultsCard}>
                    <TouchableOpacity
                      onPress={this.chooseSquad.bind(this, 'My Tasks')}>
                      <Text
                        style={[
                          styles.info,
                          { fontSize: 20, textAlign: 'center' },
                        ]}>
                        My Tasks
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.squads}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.chooseSquad.bind(this, item)}>
                            <Text
                              style={[
                                styles.info,
                                { fontSize: 20, textAlign: 'center' },
                              ]}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                  </Card>
                )}
              </React.Fragment>
            )}
          </View>
        </LinearGradient>
        <BottomMenu curuser={this.state.curuser} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  info: {
    fontSize: 15,
    marginTop: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  squadOption: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
    textDecorationLine: 'underline',
  },
  optionView: {
    marginTop: Dimensions.get('window').height * -0.015,
    height: Dimensions.get('window').height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 50,
  },
  noTasks: {
    fontSize: 20,
    padding: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.375,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
    marginBottom: Dimensions.get('window').height * -0.01,
    marginHorizontal: Dimensions.get('window').width * 0.05,
  },
  assignedTo: {
    fontSize: 12,
    paddingTop: 5,
    paddingHorizontal: 15,
    color: 'grey',
    textAlignVertical: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
  },
  listCard: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.1,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: Dimensions.get('window').height * 0.025,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
});
