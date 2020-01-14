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
  ScrollView,
  Platform,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import Moment from 'moment';
import { default as UUID } from 'uuid';
import NavigationService from '../../navigation/NavigationService';

export default class CreateSchedulerScreen extends React.Component {
  static navigationOptions = {
    title: 'New Time Request',
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
      selectedSquad: { name: 'Choose Squad' },
      hour_duration: '',
      minute_duration: '',
      switchCardShow: false,
      assigneeCardShow: false,
      calendarCardShow: false,
      timeCardShow: false,
      curassignee: '',
      datesSelected: {},
      datesArray: [],
      curdate: '',
      users: [],
      checked: [],
      added_time_objects: [],
      added_time_display: [],
      ampm: 'PM',
      hourSelected: '12',
      minuteSelected: '00',
      hours: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      minutes: [
        '00',
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
        '39',
        '40',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '49',
        '50',
        '51',
        '52',
        '53',
        '54',
        '55',
        '56',
        '57',
        '58',
        '59',
      ],
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const squads = params.squads;

    if (squads.length !== 0) {
      if (squads.length === 1) {
        this.setState({
          squads: squads,
          selectedSquad: squads[0],
          noSquads: false,
          users: Object.entries(squads[0].users),
        });
      } else {
        this.setState({ squads: squads, noSquads: false });
      }
    } else {
      this.setState({ noSquads: true });
    }

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });

    var today = new Date();
    var month = (today.getMonth() + 1).toString();
    var day = today.getDate().toString();
    if (month.length === 1) {
      month = '0' + month;
    }
    if (day.length === 1) {
      day = '0' + day;
    }
    var fullDate = today.getFullYear().toString() + '-' + month + '-' + day;

    this.setState({
      loading: false,
    });
  }

  switchSelectedSquad() {
    if (this.state.noSquads === true) {
      alert('Sorry, you have no squads. Join or create one to get started!');
    } else {
      if (this.state.squads.length === 1) {
        alert('This is your only squad.');
      } else {
        this.setState({ switchCardShow: true });
      }
    }
  }

  chooseSquad(item) {
    if (item !== this.state.selectedSquad) {
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
        responded: false,
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
      if (curassignee[1].user_id !== firebase.auth().currentUser.uid) {
        assignees.push({
          user_id: curassignee[1].user_id,
          user_name: curassignee[1].name,
          responded: false,
        });
      }
    }
    this.setState({
      assignees: assignees,
      assigneeCardShow: false,
      checked: [],
    });
  }

  onCreatePress() {
    var squad_id = this.state.selectedSquad.key;
    var duration =
      this.state.hour_duration * 60 + this.state.minute_duration * 1;

    var assignees = [];
    assignees = this.state.assignees;
    assignees.push({
      user_id: firebase.auth().currentUser.uid,
      user_name:
        this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
      responded: false,
    });

    var suggested_dates = [];
    for (let i = 0; i < this.state.datesArray.length; i++) {
      suggested_dates.push({
        date: this.state.datesArray[i],
      });
    }

    var suggested_times = [];
    for (let i = 0; i < this.state.added_time_objects.length; i++) {
      suggested_times.push({
        time: this.state.added_time_objects[i],
        votes: 0,
      });
    }

    var scheduler_post = firebase
      .database()
      .ref('schedulers/')
      .push({
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        creator_id: firebase.auth().currentUser.uid,
        creator_name:
          this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        description: this.state.description.trim(),
        duration: duration,
        event_created: false,
        squad_id: squad_id,
        status: 'open',
        suggested_dates: suggested_dates,
        suggested_times: suggested_times,
        title: this.state.title.trim(),
        total_votes: 0,
        users: assignees,
      })
      .then(snapshot => {
        var scheduler_id = snapshot.key;

        for (let i = 0; i < assignees.length; i++) {
          firebase
            .database()
            .ref('users/' + assignees[i].user_id)
            .child('schedulers')
            .push({
              scheduler_id: scheduler_id,
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
                    ' has created a new time request for all squad members: "' +
                    this.state.title.trim() +
                    '". Long hold this message to show your availability.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'scheduler',
                  extra_id: scheduler_id,
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
                    ' has created a new time request for you: "' +
                    this.state.title.trim() +
                    '" Long hold this message to show your availability.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'scheduler',
                  extra_id: scheduler_id,
                });
            }
          }
        }*/
      });

    NavigationService.navigate('MySchedulersScreen');
    alert('Your time request has been created!');
  }

  toggleCalendar(extra_info) {
    if (this.state.calendarCardShow === false) {
      if (extra_info === 'calendar time toggle') {
        this.setState({
          calendarCardShow: true,
          timeCardShow: false,
        });
      } else {
        this.setState({
          calendarCardShow: true,
        });
      }
    } else {
      if (extra_info === 'cancel dates') {
        this.setState({
          calendarCardShow: false,
          datesSelected: {},
          datesArray: [],
          added_time_display: [],
          added_time_objects: [],
        });
      } else {
        if (extra_info === 'calendar time toggle') {
          this.setState({
            calendarCardShow: false,
            timeCardShow: true,
          });
        } else {
          this.setState({
            calendarCardShow: false,
          });
        }
      }
    }
  }

  toggleTime(extra_info) {
    if (this.state.timeCardShow === false) {
      this.setState({
        timeCardShow: true,
      });
    } else {
      if (extra_info === 'cancel times') {
        this.setState({
          timeCardShow: false,
          datesSelected: {},
          datesArray: [],
          added_time_display: [],
          added_time_objects: [],
        });
      } else {
        this.setState({
          timeCardShow: false,
        });
      }
    }
  }

  onTimePress(item) {
    if (this.state.timeselection === 'hours') {
      this.setState({
        hourSelected: item,
        timeCardShow: false,
      });
    } else {
      this.setState({
        minuteSelected: item,
        timeCardShow: false,
      });
    }
  }

  onNextClick() {
    var datesArray = this.state.datesArray;
    for (var date in this.state.datesSelected) {
      datesArray.push(date);
    }

    datesArray.sort(function(date1, date2) {
      return date1 > date2;
    });

    if (Object.keys(this.state.datesSelected).length > 0) {
      this.setState({
        curdate: datesArray[0] + 'T12:00:00.000Z',
        datesArray: datesArray,
        calendarCardShow: false,
      });
      this.toggleCalendar();
      this.toggleTime();
    } else {
      alert(
        'Sorry, you have to select at least one date before suggesting times.'
      );
    }
  }

  onSaveClick() {
    this.setState({
      calendarCardShow: false,
      timeCardShow: false,
    });
  }

  onLeftPress() {
    var index = this.state.datesArray.findIndex(
      obj => obj === this.state.curdate.substring(0, 10)
    );
    this.setState({
      curdate: this.state.datesArray[index - 1] + 'T12:00:00.000Z',
    });
  }

  onRightPress() {
    var index = this.state.datesArray.findIndex(
      obj => obj === this.state.curdate.substring(0, 10)
    );
    this.setState({
      curdate: this.state.datesArray[index + 1] + 'T12:00:00.000Z',
    });
  }

  toggleAmPm() {
    if (this.state.ampm === 'AM') {
      this.setState({
        ampm: 'PM',
      });
    } else {
      this.setState({
        ampm: 'AM',
      });
    }
  }

  addTime() {
    if (
      this.state.hourSelected > 0 &&
      this.state.hourSelected < 13 &&
      (this.state.minuteSelected > -1 && this.state.minuteSelected < 60) &&
      this.state.minuteSelected.length === 2
    ) {
      var minuteSelected = this.state.minuteSelected;
      if (minuteSelected === '') {
        minuteSelected = '00';
      }

      var hourSelected = this.state.hourSelected;
      if (hourSelected.length === 1) {
        hourSelected = '0' + this.state.hourSelected;
      }
      var hourInt = 0;
      if (this.state.ampm === 'PM' && hourSelected !== '12') {
        hourInt = Number(hourSelected) + 12;
        hourSelected = '' + hourInt;
      } else if (this.state.ampm === 'AM' && hourSelected === '12') {
        hourSelected = '00';
      }
      var dateString =
        this.state.curdate.substring(0, 10) +
        'T' +
        hourSelected +
        ':' +
        minuteSelected +
        ':00Z';
      var selectedDate = new Date(dateString);

      var d = new Date();
      var localTime = selectedDate.getTime();
      var localOffset = d.getTimezoneOffset() * 60000;
      var utc = localTime + localOffset;

      var added_time_objects = this.state.added_time_objects;
      var added_time_display = this.state.added_time_display;
      if (
        this.state.added_time_objects.findIndex(element => element === utc) ===
        -1
      ) {
        added_time_objects.push(utc);
        added_time_display.push([
          dateString,
          this.state.hourSelected +
            ' : ' +
            minuteSelected +
            ' ' +
            this.state.ampm,
        ]);
      }

      this.setState({
        added_time_objects: added_time_objects,
        added_time_display: added_time_display,
      });
    } else {
      alert('Sorry, please enter a valid time.');
    }
  }

  render() {
    var isEnabled = 'false';
    var text_color = 'grey';
    if (
      this.state.description.length > 0 &&
      this.state.title.length > 0 &&
      this.state.endObject !== '' &&
      this.state.startObject !== '' &&
      this.state.assignees.length > 0 &&
      this.state.added_time_objects.length > 0 &&
      (this.state.hour_duration.length > 0 || this.state.minute_duration > 0)
    ) {
      isEnabled = '';
      text_color = 'white';
    }

    var isAssigneeEnabled = 'false';
    var assignee_text_color = 'grey';
    if (this.state.selectedSquad.name !== 'Choose Squad') {
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
          <ScrollView>
            <View style={styles.fill}>
              {this.state.loading ? (
                <React.Fragment>
                  <Text style={styles.info}>Loading</Text>
                  <ActivityIndicator size="large" color="white" />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.state.switchCardShow === false &&
                  this.state.assigneeCardShow === false &&
                  this.state.calendarCardShow === false &&
                  this.state.timeCardShow === false ? (
                    <React.Fragment>
                      <ScrollView>
                        <TextInput
                          style={styles.title_input}
                          placeholder="Event Title"
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
                        {this.state.added_time_objects.length === 0 ? (
                          <TouchableOpacity
                            onPress={this.toggleCalendar.bind(this)}>
                            <Text style={styles.info}>
                              Click to Select Time Suggestions
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={this.toggleTime.bind(this)}>
                            <Text style={styles.info}>
                              Click to Review Time Suggestions
                            </Text>
                          </TouchableOpacity>
                        )}
                        <View style={styles.line} />
                        <Text style={[styles.info, { fontWeight: 'bold' }]}>
                          Duration:
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                          }}>
                          <TextInput
                            style={[
                              styles.title_input,
                              {
                                width: 50,
                                borderBottomWidth: 0,
                                margin: 0,
                                fontSize: 20,
                              },
                            ]}
                            placeholder="00"
                            selectionColor="white"
                            placeholderTextColor="#F4F4F4"
                            blurOnSubmit
                            maxLength={2}
                            onChangeText={hour_duration =>
                              this.setState({ hour_duration })
                            }
                            value={this.state.hour_duration}
                          />
                          <Text
                            style={[
                              styles.info,
                              {
                                paddingTop: 0,
                                paddingLeft: 0,
                                marginRight: 10,
                              },
                            ]}>
                            Hours
                          </Text>
                          <TextInput
                            style={[
                              styles.title_input,
                              {
                                width: 50,
                                borderBottomWidth: 0,
                                margin: 0,
                                fontSize: 20,
                              },
                            ]}
                            placeholder="00"
                            selectionColor="white"
                            placeholderTextColor="#F4F4F4"
                            blurOnSubmit
                            maxLength={2}
                            onChangeText={minute_duration =>
                              this.setState({ minute_duration })
                            }
                            value={this.state.minute_duration}
                          />
                          <Text
                            style={[
                              styles.info,
                              { paddingTop: 0, paddingLeft: 0 },
                            ]}>
                            Minutes
                          </Text>
                        </View>
                        <Text style={[styles.info, { fontWeight: 'bold' }]}>
                          Invitees:
                        </Text>
                        {this.state.assignees.length === 0 ? (
                          <Text style={styles.noSquads}>
                            Add invitees with the button below!
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
                                <Text style={[styles.info]}>
                                  {item.user_name}
                                </Text>
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
                                style={[
                                  styles.buttonText,
                                  { color: text_color },
                                ]}>
                                Create Request
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
                                Add Invitees
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
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
                            Invite all members
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
                              {item[1].user_id !==
                              firebase.auth().currentUser.uid ? (
                                <React.Fragment>
                                  <TouchableOpacity
                                    onPress={this.radioClick.bind(this, item)}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                      }}>
                                      <RadioButton
                                        onPress={this.radioClick.bind(
                                          this,
                                          item
                                        )}
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
                              ) : null}
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
                  {this.state.calendarCardShow === true &&
                  this.state.timeCardShow === false ? (
                    <React.Fragment>
                      <Text style={styles.selectInfo}>Select Dates</Text>
                      <ScrollView>
                        <Calendar
                          extraData={this.state}
                          markedDates={this.state.datesSelected}
                          dateNameStyle={{ fontWeight: 'bold' }}
                          current={this.state.curdate}
                          onDayPress={day => {
                            if (this.state.datesArray.length === 0) {
                              var datesSelected = this.state.datesSelected;
                              this.setState(
                                {
                                  datesSelected: {},
                                },
                                () => {
                                  if (
                                    datesSelected[day.dateString] !== undefined
                                  ) {
                                    delete datesSelected[day.dateString];
                                  } else {
                                    datesSelected[day.dateString] = {
                                      selected: true,
                                      selectedColor: '#D616CF',
                                    };
                                  }
                                  this.setState({
                                    datesSelected: datesSelected,
                                    calendarShow: false,
                                    firstSelect: false,
                                    curdate: day.dateString + 'T12:00:00.000Z',
                                  });
                                }
                              );
                            } else {
                              if (
                                JSON.stringify(this.state.datesArray).includes(
                                  day.dateString
                                )
                              ) {
                                this.setState({
                                  calendarCardShow: false,
                                  timeCardShow: true,
                                  curdate: day.dateString + 'T12:00:00.000Z',
                                });
                              } else {
                                alert(
                                  'Sorry, please choose a date that has been suggested.'
                                );
                              }
                            }
                          }}
                          hideArrows={false}
                          disableMonthChange={false}
                          markingType={'multi-dot'}
                          theme={{
                            arrowColor: 'black',
                          }}
                          style={{
                            width: Dimensions.get('window').width * 0.9,
                            borderRadius: 15,
                            marginTop: Dimensions.get('window').height * 0.025,
                            marginBottom:
                              Dimensions.get('window').height * 0.025,
                            paddingBottom:
                              Dimensions.get('window').height * 0.02,
                            alignSelf: 'center',
                            shadowOffset: { width: 12, height: 12 },
                            shadowColor: 'black',
                            shadowOpacity: 0.15,
                          }}
                          //markedDates={this.state.events}
                        />
                        {/*this flatlist is just to align the two different calendars*/}
                        <FlatList style={{ padding: 10 }} />
                        <View style={styles.buttonRow}>
                          {this.state.datesArray.length === 0 ? (
                            <TouchableOpacity
                              onPress={this.onNextClick.bind(this)}>
                              <View style={styles.customButton}>
                                <Text style={styles.buttonText}>Next</Text>
                              </View>
                            </TouchableOpacity>
                          ) : null}
                          <TouchableOpacity
                            onPress={this.toggleCalendar.bind(
                              this,
                              'cancel dates'
                            )}>
                            <View style={styles.customButton}>
                              {this.state.added_time_objects.length === 0 ? (
                                <Text style={styles.buttonText}>Cancel</Text>
                              ) : (
                                <Text style={styles.buttonText}>
                                  Remove Times
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    </React.Fragment>
                  ) : null}
                  {this.state.timeCardShow === true ? (
                    <React.Fragment>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginTop: Dimensions.get('window').height * -0.03,
                          marginBottom: Dimensions.get('window').height * 0.027,
                        }}>
                        {this.state.datesArray[0] + 'T12:00:00.000Z' !==
                        this.state.curdate ? (
                          <TouchableOpacity
                            onPress={this.onLeftPress.bind(this)}>
                            <Image
                              style={styles.icon}
                              source={require('../../assets/icons/left-arrow.png')}
                            />
                          </TouchableOpacity>
                        ) : null}
                        {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                          <TouchableOpacity
                            onPress={this.toggleCalendar.bind(
                              this,
                              'calendar time toggle'
                            )}>
                            <View style={styles.optionView}>
                              <Text style={styles.dateOption}>
                                {Moment(new Date(this.state.curdate)).format(
                                  'dddd, MM/DD/YYYY'
                                )}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={this.toggleCalendar.bind(
                              this,
                              'calendar time toggle'
                            )}>
                            <View>
                              <Text style={styles.dateOption}>
                                {Moment(new Date(this.state.curdate)).format(
                                  'dddd, MM/DD/YYYY'
                                )}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        {this.state.datesArray[
                          this.state.datesArray.length - 1
                        ] +
                          'T12:00:00.000Z' !==
                        this.state.curdate ? (
                          <TouchableOpacity
                            onPress={this.onRightPress.bind(this)}>
                            <Image
                              style={styles.icon}
                              source={require('../../assets/icons/right-arrow.png')}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'center',
                          marginBottom: Dimensions.get('window').height * 0.05,
                          justifyContent: 'center',
                        }}>
                        <TextInput
                          style={[
                            styles.title_input,
                            {
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 40,
                              textAlign: 'center',
                              alignItems: 'center',
                              borderBottomWidth: 0,
                              height: 55,
                              width: 75,
                              padding: 0,
                              margin: 0,
                            },
                          ]}
                          placeholder="00"
                          selectionColor="white"
                          placeholderTextColor="#F4F4F4"
                          blurOnSubmit
                          maxLength={2}
                          onChangeText={hourSelected =>
                            this.setState({ hourSelected })
                          }
                          value={this.state.hourSelected}
                        />
                        <Text
                          style={[
                            styles.time_input,
                            {
                              textAlignVertical: 'bottom',
                              padding: 0,
                              margin: 0,
                            },
                          ]}>
                          {':'}
                        </Text>
                        <TextInput
                          style={[
                            styles.title_input,
                            {
                              alignSelf: 'center',
                              color: 'white',
                              fontSize: 40,
                              textAlign: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottomWidth: 0,
                              height: 55,
                              width: 75,
                              padding: 0,
                              margin: 0,
                            },
                          ]}
                          placeholder="00"
                          selectionColor="white"
                          placeholderTextColor="#F4F4F4"
                          blurOnSubmit
                          maxLength={2}
                          onChangeText={minuteSelected =>
                            this.setState({ minuteSelected })
                          }
                          value={this.state.minuteSelected}
                        />
                        <TouchableOpacity
                          onPress={this.toggleAmPm.bind(this)}
                          style={{ height: 55 }}>
                          <Text
                            style={[
                              styles.time_input,
                              {
                                textAlignVertical: 'bottom',
                                padding: 0,
                                margin: 0,
                                marginTop: 2,
                              },
                            ]}>
                            {this.state.ampm}
                            {'    '}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.addTime.bind(this)}>
                          <View style={styles.circle}>
                            <Image
                              style={[
                                styles.icon,
                                {
                                  margin: 0,
                                  alignContent: 'center',
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                },
                              ]}
                              source={require('assets/icons/plus.png')}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <Card style={[styles.timeSelectCard]}>
                        <Text
                          style={[
                            styles.info,
                            {
                              color: '#5B4FFF',
                              paddingLeft: 0,
                              textAlign: 'center',
                            },
                          ]}>
                          Suggested Start Times
                        </Text>
                        <View style={[styles.card_line]} />
                        <FlatList
                          style={{ padding: 10 }}
                          extraData={this.state.added_time_display}
                          data={this.state.added_time_display}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <React.Fragment>
                              {item[0].substring(0, 10) ===
                              this.state.curdate.substring(0, 10) ? (
                                <React.Fragment>
                                  <Text
                                    style={[
                                      styles.responseInfo,
                                      { textAlign: 'center' },
                                    ]}>
                                    {item[1]}
                                  </Text>
                                  <View style={styles.card_line} />
                                </React.Fragment>
                              ) : null}
                            </React.Fragment>
                          )}
                        />
                      </Card>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={this.onSaveClick.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Save</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.toggleTime.bind(this, 'cancel times')}>
                          <View style={styles.customButton}>
                            {this.state.added_time_objects.length === 0 ? (
                              <Text style={styles.buttonText}>Cancel</Text>
                            ) : (
                              <Text style={styles.buttonText}>
                                Remove Times
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    </React.Fragment>
                  ) : null}
                </React.Fragment>
              )}
            </View>
          </ScrollView>
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
  responseInfo: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.01,
    marginLeft: Dimensions.get('window').width * 0.025,
    color: '#5B4FFF',
    textAlignVertical: 'bottom',
  },
  icon: {
    height: 20,
    width: 20,
    marginTop: Dimensions.get('window').height * 0.005,
  },
  dateOption: {
    marginHorizontal: Dimensions.get('window').width * 0.05,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
    textDecorationLine: 'underline',
  },
  time_input: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    alignItems: 'center',
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
    shadowOpacity: 0.15,
  },
  timeSelectCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.45,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: Dimensions.get('window').height * -0.035,
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: 0.15,
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
    shadowOpacity: 0.5,
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
  selectInfo: {
    marginTop: Dimensions.get('window').height * -0.03,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    marginTop: 5,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'right',
    shadowOffset: { width: 6, height: 6 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
  },
});
