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
  ScrollView,
  Easing,
  Animated,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import { CheckBox } from 'react-native-elements';
import Moment from 'moment';
import NavigationService from '../../navigation/NavigationService';

export default class TaskScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('taskName', 'Task'),
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
      curuser: '',
      loading: true,
      curtask: '',
      users: ['intitialize'],
      showDetailsCard: false,
      showResultsCard: false,
      checked: '',
      statuses: ['To Do', 'In Progress', 'Need Help', 'Done'],
      cursquad: '',
      showAssigneeCard: false,
      showStatusCard: false,
      showDrawer: false,
      selected_user: [
        '0',
        {
          user_id: 'initialize',
          user_name: 'initialize',
          status: 'initialize',
        },
      ],
      timeOffset: 0,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    const task_id = params.task_id;
    var curtask = '';

    firebase
      .database()
      .ref('tasks/' + task_id)
      .on('value', snapshot => {
        var item = snapshot.val();
        item.key = snapshot.key;
        //get the unseen status of the current user
        var users = Object.values(item.users);
        var userIndex = users.findIndex(
          obj => obj.user_id === firebase.auth().currentUser.uid
        );
        if (userIndex !== -1) {
          item.unseen = users[userIndex].unseen;
        } else {
          item.unseen = null;
        }
        curtask = item;
        if (curtask.comments === undefined) {
          curtask.comments = 0;
        }

        var taskUsers = Object.entries(curtask.users);
        var date = new Date();
        var timeOffset = date.getTimezoneOffset();

        if (curtask.unseen) {
          firebase
            .database()
            .ref('users/' + firebase.auth().currentUser.uid + '/tasks')
            .once('value', snapshot => {
              var total_unseen = snapshot.val().total_unseen - 1;
              if (total_unseen < 0) {
                total_unseen = 0;
              }
              firebase
                .database()
                .ref('users/' + firebase.auth().currentUser.uid + '/tasks')
                .child('total_unseen')
                .set(total_unseen);
            });
          var taskUsersArray = Object.values(curtask.users);
          var taskUserIndex = taskUsersArray.findIndex(
            obj => obj.user_id === firebase.auth().currentUser.uid
          );
          taskUsersArray[taskUserIndex].unseen = false;
          users = Object.entries(taskUsersArray);
          firebase
            .database()
            .ref('tasks/' + curtask.key)
            .child('users')
            .set(taskUsersArray);
        }

        var selected_user = '';
        if (users.length === 1) {
          selected_user = users[0];
        } else {
          selected_user = [
            '0',
            {
              user_id: 'initialize',
              user_name: 'initialize',
              status: 'initialize',
            },
          ];
        }

        this.setState({
          curtask: curtask,
          users: taskUsers,
          selected_user: selected_user,
          timeOffset: timeOffset,
        });

        var data_ref = firebase
          .database()
          .ref('users/' + firebase.auth().currentUser.uid);
        data_ref.on('value', snapshot => {
          this.setState({ curuser: snapshot.val() });
        });

        if (curtask.squad_id !== 'null') {
          var squad_ref = firebase.database().ref('squads/' + curtask.squad_id);
          squad_ref.on('value', snapshot => {
            this.setState({ cursquad: snapshot.val() });
          });
        }

        this.setState({ loading: false });
      });
  }

  switchAssigneeCard() {
    if (this.state.showAssigneeCard === true) {
      this.setState({
        showAssigneeCard: false,
        showStatusCard: false,
        selected_user: [
          '0',
          {
            user_id: 'initialize',
            user_name: 'initialize',
            status: 'initialize',
          },
        ],
      });
    } else {
      this.setState({ showAssigneeCard: true, showStatusCard: false });
    }
  }

  switchStatusCard() {
    if (
      this.state.curtask.users.length > 1 &&
      (this.state.cursquad.organizer_id === firebase.auth().currentUser.uid ||
        this.state.curtask.creator_id === firebase.auth().currentUser.uid) &&
      this.state.selected_user[1].user_id === 'initialize'
    ) {
      alert('You have to choose an assignee first!');
      this.setState({ showAssigneeCard: true, showStatusCard: false });
    } else if (
      this.state.curtask.users.length > 1 &&
      (this.state.cursquad.organizer_id === firebase.auth().currentUser.uid ||
        this.state.curtask.creator_id === firebase.auth().currentUser.uid) &&
      this.state.selected_user[1].user_id !== 'initialize'
    ) {
      this.setState({ showStatusCard: true, showAssigneeCard: false });
    } else if (
      this.state.curtask.users.length > 1 &&
      JSON.stringify(this.state.users).includes(firebase.auth().currentUser.uid)
    ) {
      var index = this.state.users.findIndex(
        element => element[1].user_id === firebase.auth().currentUser.uid
      );
      this.setState({
        showStatusCard: true,
        showAssigneeCard: false,
        selected_user: this.state.users[index],
      });
    } else if (
      this.state.curtask.users.length === 1 &&
      (this.state.cursquad.organizer_id === firebase.auth().currentUser.uid ||
        this.state.curtask.creator_id === firebase.auth().currentUser.uid ||
        this.state.users[0][1].user_id === firebase.auth().currentUser.uid)
    ) {
      this.setState({
        showStatusCard: true,
        showAssigneeCard: false,
        selected_user: this.state.users[0],
      });
    } else {
      alert('You cannot edit this task.');
    }
  }

  radioClick(item) {
    this.setState({ checked: item });
  }

  onSubmit() {
    if (this.state.checked !== '') {
      var users = this.state.users;
      var selected_user = this.state.selected_user;
      var index = users.findIndex(
        element => element[1].user_id === this.state.selected_user[1].user_id
      );
      selected_user[1].status = this.state.checked;
      users[index][1] = selected_user[1];

      var taskUpdateData = {
        users: Object.fromEntries(users),
      };
      const rootRef = firebase.database().ref();
      const taskRef = rootRef.child('tasks/' + this.state.curtask.key);

      taskRef.update(taskUpdateData);
      alert('The task has been updated.');
      this.setState({
        showStatusCard: false,
        showAssigneeCard: false,
        checked: '',
        selected_user: [
          '0',
          {
            user_id: 'initialize',
            user_name: 'initialize',
            status: 'initialize',
          },
        ],
      });
    } else {
      alert('You need to select a status before submitting.');
    }
  }

  userRadioClick(item) {
    this.setState({ selected_user: item });
  }

  cancelStatusCard() {
    this.setState({
      showStatusCard: false,
      showAssigneeCard: false,
      selected_user: [
        '0',
        {
          user_id: 'initialize',
          user_name: 'initialize',
          status: 'initialize',
        },
      ],
      checked: '',
    });
  }

  openComments() {
    NavigationService.navigate('CommentScreen', {
      parentName: 'Task Comments',
      parent: this.state.curtask.key,
      comment_type: 'tasks',
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
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.showAssigneeCard === false &&
            this.state.showStatusCard === false ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text
                      style={[
                        styles.info,
                        {
                          marginBottom: Dimensions.get('window').height * 0.01,
                        },
                      ]}
                      selectable={true}>
                      {this.state.curtask.title}
                    </Text>
                    <Text style={styles.detailsInfo} selectable={true}>
                      {this.state.curtask.description}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Description</Text>
                    {this.state.users.length === 1 ? (
                      <React.Fragment>
                        <Text style={styles.detailsInfo}>
                          {this.state.users[0][1].user_name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Assignee</Text>
                        <Text style={styles.detailsInfo}>
                          {this.state.users[0][1].status}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Status</Text>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <TouchableOpacity
                          onPress={this.switchAssigneeCard.bind(this)}>
                          <Text style={styles.detailsInfo}>
                            Click to see all assignees
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Assignee</Text>
                      </React.Fragment>
                    )}
                    <Text style={styles.detailsInfo}>
                      {this.state.curtask.creator_name}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Creator</Text>
                    <Text style={styles.detailsInfo}>
                      {Moment(
                        this.state.curtask.createdAt + this.state.timeOffset
                      ).format('MM/DD/YYYY, hh:mm A')}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Created At</Text>
                    {this.state.cursquad !== '' ? (
                      <React.Fragment>
                        <Text style={styles.detailsInfo}>
                          {this.state.cursquad.name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Squad</Text>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Text style={styles.detailsInfo}>Personal Task</Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>
                          Only you can see this task
                        </Text>
                      </React.Fragment>
                    )}
                    <TouchableOpacity onPress={this.openComments.bind(this)}>
                      {this.state.curtask.comments !== 0 ? (
                        <Text style={styles.detailsInfo}>
                          Click to comment ({this.state.curtask.comments})
                        </Text>
                      ) : (
                        <Text style={styles.detailsInfo}>
                          Click to leave the first comment
                        </Text>
                      )}
                    </TouchableOpacity>
                    <View style={styles.line} />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  {this.state.cursquad.organizer_id ===
                    firebase.auth().currentUser.uid ||
                  this.state.curtask.creator_id ===
                    firebase.auth().currentUser.uid ||
                  JSON.stringify(this.state.users).includes(
                    firebase.auth().currentUser.uid
                  ) ? (
                    <TouchableOpacity
                      onPress={this.switchStatusCard.bind(this)}>
                      <View style={styles.customButton}>
                        <Text style={styles.buttonText}>Change Status</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </React.Fragment>
            ) : null}
            {this.state.showAssigneeCard === true ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text
                      style={[
                        styles.info,
                        {
                          marginBottom: Dimensions.get('window').height * 0.01,
                        },
                      ]}>
                      {this.state.curtask.title}
                    </Text>
                    <View style={styles.line} />
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.users}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          {this.state.curtask.creator_id ===
                            firebase.auth().currentUser.uid ||
                          this.state.cursquad.organizer_id ===
                            firebase.auth().currentUser.uid ? (
                            <TouchableOpacity
                              onPress={this.userRadioClick.bind(this, item)}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                <View
                                  style={{
                                    paddingTop:
                                      Dimensions.get('window').height * 0.05,
                                  }}>
                                  <RadioButton
                                    onPress={this.userRadioClick.bind(
                                      this,
                                      item
                                    )}
                                    color="#5B4FFF"
                                    value={item}
                                    status={
                                      this.state.selected_user[1].user_id ===
                                      item[1].user_id
                                        ? 'checked'
                                        : 'unchecked'
                                    }
                                  />
                                </View>
                                <View
                                  style={{
                                    flexDirection: 'column',
                                  }}>
                                  <Text style={styles.assigneesInfo}>
                                    {item[1].status}
                                  </Text>
                                  <View style={styles.radioLine} />
                                  <Text style={styles.assigneesGeneric}>
                                    {item[1].user_name}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                }}>
                                <Text style={styles.assigneesInfo}>
                                  {item[1].status}
                                </Text>
                                <View style={styles.radioLine} />
                                <Text style={styles.assigneesGeneric}>
                                  {item[1].user_name}
                                </Text>
                              </View>
                            </View>
                          )}
                        </React.Fragment>
                      )}
                    />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  {this.state.cursquad.organizer_id ===
                    firebase.auth().currentUser.uid ||
                  this.state.curtask.creator_id ===
                    firebase.auth().currentUser.uid ||
                  JSON.stringify(this.state.users).includes(
                    firebase.auth().currentUser.uid
                  ) ? (
                    <TouchableOpacity
                      onPress={this.switchStatusCard.bind(this)}>
                      <View style={styles.customButton}>
                        <Text style={styles.buttonText}>Change Status</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    onPress={this.switchAssigneeCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Close List</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
            {this.state.showStatusCard === true ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text
                      style={[
                        styles.info,
                        {
                          marginBottom: Dimensions.get('window').height * 0.01,
                        },
                      ]}>
                      {this.state.curtask.title}
                    </Text>
                    <Text style={styles.taskTypeInfo}>
                      {this.state.selected_user[1].user_name}
                    </Text>
                    <View style={styles.line} />
                    <FlatList
                      style={{ padding: 10 }}
                      extraData={this.state.checked}
                      data={this.state.statuses}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.radioClick.bind(this, item)}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <RadioButton
                                onPress={this.radioClick.bind(this, item)}
                                color="#5B4FFF"
                                value={item}
                                status={
                                  this.state.checked === item
                                    ? 'checked'
                                    : 'unchecked'
                                }
                              />
                              <Text style={styles.responseInfo}>{item}</Text>
                            </View>
                          </TouchableOpacity>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={this.onSubmit.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Submit</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.cancelStatusCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
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
  info: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  taskTypeInfo: {
    color: '#5B4FFF',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  responseInfo: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.01,
    marginLeft: Dimensions.get('window').width * 0.025,
    color: '#5B4FFF',
    textAlignVertical: 'bottom',
  },
  detailsInfo: {
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.04,
    marginBottom: Dimensions.get('window').height * 0.005,
    marginLeft: Dimensions.get('window').width * 0.075,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  assigneesInfo: {
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.04,
    marginBottom: Dimensions.get('window').height * 0.005,
    marginLeft: Dimensions.get('window').width * 0.025,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  generic: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.075,
    color: '#8F8F8F',
  },
  assigneesGeneric: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.025,
    color: '#8F8F8F',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.55,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: 0.15,
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
  radioLine: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.5,
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
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
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
    marginBottom: Dimensions.get('window').height * -0.005,
  },
});
