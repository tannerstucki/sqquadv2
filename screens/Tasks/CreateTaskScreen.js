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
  TextInput,
  FlatList,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import { default as UUID } from 'uuid';
import NavigationService from '../../navigation/NavigationService';

export default class CreateTaskScreen extends React.Component {
  static navigationOptions = {
    title: 'New Task',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      title: '',
      description: '',
      assignees: [],
      squads: [],
      noSquads: true,
      selectedSquad: { name: 'Personal Task (No Squad Selected)' },
      switchCardShow: false,
      assigneeCardShow: false,
      curassignee: '',
      users: [],
      checked: [],
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const squads = params.squads;

    if (squads.length !== 0) {
      this.setState({
        noSquads: false,
        squads: squads,
      });
    }

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });
  }

  switchSelectedSquad() {
    if (this.state.noSquads === true) {
      alert(
        'Sorry, you have no squads so you will only be able to create personal tasks. Join or create a squad to create for others!'
      );
    } else {
      this.setState({ switchCardShow: true });
    }
  }

  chooseSquad(item) {
    if (item !== this.state.selectedSquad) {
      if (item !== 'Personal Task') {
        var data_ref = firebase
          .database()
          .ref('squads/' + item.key)
          .child('users');
        data_ref.on('value', snapshot => {
          this.setState({
            selectedSquad: item,
            switchCardShow: false,
            users: Object.entries(snapshot.val()),
            assignees: [],
            checked: [],
          });
        });
      } else {
        this.setState({
          selectedSquad: { name: 'Personal Task (No Squad Selected)' },
          switchCardShow: false,
          assignees: [],
          checked: [],
        });
      }
    } else {
      this.setState({
        switchCardShow: false,
      });
    }
  }

  toggleAssigneeCard() {
    if (this.state.assigneeCardShow === false) {
      this.setState({
        assigneeCardShow: true,
        assignees: [],
        checked: [],
      });
    } else {
      this.setState({
        assigneeCardShow: false,
        curassignee: '',
      });
    }
  }

  addAssignee() {
    var assignees = [];
    for (let i = 0; i < this.state.checked.length; i++) {
      var curassignee = this.state.users[
        this.state.users.findIndex(
          element => element[0] === this.state.checked[i]
        )
      ];
      assignees.push({
        user_id: curassignee[1].user_id,
        user_name: curassignee[1].name,
        status: 'To Do',
      });
    }
    this.setState({
      assignees: assignees,
      assigneeCardShow: false,
    });
  }

  radioClick(item) {
    if (this.state.checked.findIndex(element => element === item[0]) !== -1) {
      this.state.checked.splice(
        this.state.checked.findIndex(element => element === item[0]),
        1
      );
    } else {
      this.state.checked.unshift(item[0]);
    }
    this.setState({ switchCardShow: false });
  }

  assignToAll() {
    var assignees = [];
    for (let i = 0; i < this.state.users.length; i++) {
      var curassignee = this.state.users[i];
      assignees.push({
        user_id: curassignee[1].user_id,
        user_name: curassignee[1].name,
        status: 'To Do',
      });
    }
    this.setState({
      assignees: assignees,
      assigneeCardShow: false,
      checked: [],
    });
  }

  onCreatePress() {
    var squad_id = '';
    if (this.state.selectedSquad.name === 'Personal Task (No Squad Selected)') {
      squad_id = 'null';
    } else {
      squad_id = this.state.selectedSquad.key;
    }
    var assignees = [];
    if (this.state.assignees.length === 0) {
      assignees.push({
        user_id: firebase.auth().currentUser.uid,
        user_name:
          this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        status: 'To Do',
      });
    } else {
      assignees = this.state.assignees;
    }

    var task_post = firebase
      .database()
      .ref('tasks/')
      .push({
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        creator_id: firebase.auth().currentUser.uid,
        creator_name:
          this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        title: this.state.title.trim(),
        description: this.state.description.trim(),
        users: assignees,
        squad_id: squad_id,
      })
      .then(snapshot => {
        var task_id = snapshot.key;

        for (let i = 0; i < assignees.length; i++) {
          firebase
            .database()
            .ref('users/' + assignees[i].user_id)
            .child('tasks')
            .push({
              task_id: task_id,
            });
        }

        if (
          squad_id !== 'null' &&
          this.state.assignees.length === this.state.users.length
        ) {
          firebase
            .database()
            .ref('threads')
            .orderByChild('squad_id')
            .equalTo(squad_id)
            .once('value', snapshot => {
              firebase
                .database()
                .ref('messages/')
                .push({
                  createdAt: firebase.database.ServerValue.TIMESTAMP,
                  text:
                    this.state.curuser.first_name +
                    ' ' +
                    this.state.curuser.last_name +
                    ' has created a new task for all squad members: "' +
                    this.state.title.trim() +
                    '". Long hold this message to see this task.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'task',
                  extra_id: task_id,
                });
            });
        } /*
        Add Functionality to send messages from the virtual manager to an individual person
        else {
          for (let i = 0; i < assignees.length; i++) {
            if (assignees[i].user_id !== firebase.auth().currentUser.uid) {
              firebase
                .database()
                .ref('messages/')
                .push({
                  createdAt: firebase.database.ServerValue.TIMESTAMP,
                  text:
                    this.state.curuser.first_name +
                    ' ' +
                    this.state.curuser.last_name +
                    ' has created a new task for you: "' +
                    this.state.title.trim() +
                    '" Long hold this message to see this task.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'task',
                  extra_id: task_id,
                });
            }
          }
        }*/
      });

    NavigationService.navigate('MyTasksScreen');
    alert('Your task has been created!');
  }

  render() {
    var isEnabled = 'false';
    var text_color = 'grey';
    if (
      this.state.description.length > 0 &&
      this.state.title.length > 0 &&
      (this.state.assignees.length > 0 ||
        this.state.selectedSquad.name === 'Personal Task (No Squad Selected)')
    ) {
      isEnabled = '';
      text_color = 'white';
    }

    var isAssigneeEnabled = 'false';
    var assignee_text_color = 'grey';
    if (this.state.selectedSquad.name !== 'Personal Task (No Squad Selected)') {
      isAssigneeEnabled = '';
      assignee_text_color = 'white';
    }

    var isOkEnabled = 'false';
    var ok_text_color = 'grey';
    if (this.state.checked.length > 0) {
      isOkEnabled = '';
      ok_text_color = '#5B4FFF';
    }

    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
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
                {this.state.switchCardShow === false &&
                this.state.assigneeCardShow === false ? (
                  <React.Fragment>
                    <TextInput
                      style={styles.title_input}
                      placeholder="Task Title"
                      placeholderTextColor="#F4F4F4"
                      selectionColor="white"
                      multiline
                      blurOnSubmit
                      onChangeText={title => this.setState({ title })}
                      value={this.state.title}
                    />
                    <TextInput
                      style={styles.title_input}
                      placeholder="Description"
                      placeholderTextColor="#F4F4F4"
                      selectionColor="white"
                      multiline
                      blurOnSubmit
                      onChangeText={description =>
                        this.setState({ description })
                      }
                      value={this.state.description}
                    />
                    <TouchableOpacity
                      onPress={this.switchSelectedSquad.bind(this)}>
                      <Text style={styles.info}>
                        {this.state.selectedSquad.name}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <Text style={[styles.info, { fontWeight: 'bold' }]}>
                      Assignees:
                    </Text>
                    {this.state.assignees.length === 0 &&
                    this.state.selectedSquad.name !==
                      'Personal Task (No Squad Selected)' ? (
                      <Text style={styles.noSquads}>
                        Add assignees with the button below!
                      </Text>
                    ) : null}
                    {this.state.assignees.length === 0 &&
                    this.state.selectedSquad.name ===
                      'Personal Task (No Squad Selected)' ? (
                      <Text style={styles.noSquads}>
                        This will be saved as a personal task.
                      </Text>
                    ) : null}
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.assignees}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.info]}>{item.user_name}</Text>
                          </View>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={this.onCreatePress.bind(this)}
                        disabled={isEnabled}>
                        <View style={styles.customButton}>
                          <Text
                            style={[styles.buttonText, { color: text_color }]}>
                            Create Task
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={this.toggleAssigneeCard.bind(this)}
                        disabled={isAssigneeEnabled}>
                        <View style={styles.customButton}>
                          <Text
                            style={[
                              styles.buttonText,
                              { color: assignee_text_color },
                            ]}>
                            Add Assignees
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : null}
                {this.state.switchCardShow === true ? (
                  <Card
                    style={[
                      styles.resultsCard,
                      {
                        marginLeft: Dimensions.get('window').width * 0,
                        marginTop: Dimensions.get('window').height * 0.125,
                      },
                    ]}>
                    <TouchableOpacity
                      onPress={this.chooseSquad.bind(this, 'Personal Task')}>
                      <Text
                        style={[
                          styles.card_info,
                          {
                            fontSize: 20,
                            textAlign: 'center',
                            marginTop: Dimensions.get('window').height * 0.02,
                          },
                        ]}>
                        Personal Task
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.card_line} />
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.squads}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.chooseSquad.bind(this, item)}>
                            <Text style={styles.card_info}>{item.name}</Text>
                          </TouchableOpacity>
                          <View style={styles.card_line} />
                        </React.Fragment>
                      )}
                    />
                  </Card>
                ) : null}
                {this.state.assigneeCardShow === true ? (
                  <React.Fragment>
                    <Card
                      style={[
                        styles.resultsCard,
                        {
                          marginLeft: Dimensions.get('window').width * 0,
                          marginTop: Dimensions.get('window').height * 0.125,
                        },
                      ]}>
                      <TouchableOpacity onPress={this.assignToAll.bind(this)}>
                        <Text
                          style={[
                            styles.card_info,
                            {
                              fontSize: 20,
                              textAlign: 'center',
                              marginTop:
                                Dimensions.get('window').height * 0.025,
                            },
                          ]}>
                          Assign to all members
                        </Text>
                        <View style={styles.card_line} />
                      </TouchableOpacity>
                      <FlatList
                        style={{ padding: 10 }}
                        extraData={this.state}
                        data={this.state.users}
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
                                  value={item[0]}
                                  status={
                                    this.state.checked.findIndex(
                                      element => element === item[0]
                                    ) !== -1
                                      ? 'checked'
                                      : 'unchecked'
                                  }
                                />
                                <Text style={styles.card_info}>
                                  {item[1].name}
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <View style={styles.card_line} />
                          </React.Fragment>
                        )}
                      />
                      <View style={styles.buttonRow}>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.2,
                            textAlign: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={this.addAssignee.bind(this)}
                            disabled={isOkEnabled}>
                            <Text
                              style={[
                                styles.info,
                                {
                                  color: ok_text_color,
                                  paddingLeft: 0,
                                  fontWeight: 'bold',
                                },
                              ]}>
                              Ok
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.2,
                            textAlign: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={this.toggleAssigneeCard.bind(this)}>
                            <Text
                              style={[
                                styles.info,
                                {
                                  color: '#5B4FFF',
                                  paddingLeft: 0,
                                  fontWeight: 'bold',
                                },
                              ]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  </React.Fragment>
                ) : null}
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
    fontSize: 18,
    paddingTop: 16,
    paddingLeft: Dimensions.get('window').width * 0.125,
    color: 'white',
  },
  card_info: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#5B4FFF',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    paddingTop: Dimensions.get('window').height * 0.05,
    alignContent: 'center',
  },
  title_input: {
    height: Dimensions.get('window').height * 0.06,
    width: Dimensions.get('window').width * 0.8,
    borderWidth: 1,
    margin: 10,
    padding: 10,
    alignSelf: 'center',
    borderBottomColor: 'white',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    color: 'white',
    fontSize: 18,
  },
  line: {
    backgroundColor: 'white',
    height: 1,
    alignSelf: 'center',
    margin: 10,
    width: Dimensions.get('window').width * 0.8,
  },
  card_line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    margin: Dimensions.get('window').height * 0.15,
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: .15,
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
    marginHorizontal: Dimensions.get('window').width * 0.05,
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: .5,
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});
