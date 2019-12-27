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
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import Moment from 'moment';
import { default as UUID } from 'uuid';
import NavigationService from '../navigation/NavigationService';

export default class CreateEventScreen extends React.Component {
  static navigationOptions = {
    title: 'New Event',
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
      selectedSquad: { name: 'Personal Event (No Squad Selected)' },
      startAt: 'Start At',
      endAt: 'End At',
      startObject: '',
      endObject: '',
      switchCardShow: false,
      assigneeCardShow: false,
      calendarCardShow: false,
      timeCardShow: false,
      curassignee: '',
      originalDateSelected: '',
      dateSelected: '',
      hourSelected: '12',
      minuteSelected: '00',
      ampm: 'PM',
      users: [],
      checked: [],
      timeselection: '',
      startOrEnd: '',
      startDateString: '',
      endDateString: '',
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

    var today = new Date();
    var month = today.getMonth() + 1;
    var fullDate =
      today.getFullYear().toString() +
      '-' +
      month.toString() +
      '-' +
      today.getDate().toString();
    this.setState({
      loading: false,
      dateSelected: {
        [fullDate]: {
          selected: true,
          selectedColor: '#D616CF',
        },
      },
      originalDateSelected: {
        [fullDate]: {
          selected: true,
          selectedColor: '#D616CF',
        },
      },
    });
  }

  switchSelectedSquad() {
    if (this.state.noSquads === true) {
      alert(
        'Sorry, you have no squads so you will only be able to create personal events. Join or create a squad to create for others!'
      );
    } else {
      this.setState({ switchCardShow: true });
    }
  }

  chooseSquad(item) {
    if (item !== this.state.selectedSquad) {
      if (item !== 'Personal Event') {
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
          selectedSquad: { name: 'Personal Event (No Squad Selected)' },
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
        rsvp: 'Undecided',
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
          rsvp: 'Undecided',
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
    var squad_id = '';
    if (
      this.state.selectedSquad.name === 'Personal Event (No Squad Selected)'
    ) {
      squad_id = 'null';
    } else {
      squad_id = this.state.selectedSquad.key;
    }

    var assignees = [];
    assignees = this.state.assignees;
    assignees.push({
      user_id: firebase.auth().currentUser.uid,
      user_name:
        this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
      rsvp: 'Undecided',
    });

    var event_post = firebase
      .database()
      .ref('events/')
      .push({
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        creator_id: firebase.auth().currentUser.uid,
        creator_name:
          this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        title: this.state.title.trim(),
        description: this.state.description.trim(),
        users: assignees,
        squad_id: squad_id,
        startAt: new Date(this.state.startDateString).getTime(),
        endAt: new Date(this.state.endDateString).getTime(),
      })
      .then(snapshot => {
        var event_id = snapshot.key;

        for (let i = 0; i < assignees.length; i++) {
          firebase
            .database()
            .ref('users/' + assignees[i].user_id)
            .child('events')
            .push({
              event_id: event_id,
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
                    ' has created a new event for all squad members: "' +
                    this.state.title.trim() +
                    '". Long hold this message to RSVP.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'event',
                  extra_id: event_id,
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
                    ' has created a new event for you: "' +
                    this.state.title.trim() +
                    '" Long hold this message to see this event.',
                  thread: Object.keys(snapshot.val())[0],
                  user: {
                    _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                    name: 'Virtual Manager',
                  },
                  extra_info: 'event',
                  extra_id: event_id,
                });
            }
          }
        }*/
      });

    NavigationService.navigate('MyEventsScreen');
    alert('Your event has been created!');
  }

  toggleCalendar(startOrEnd) {
    if (this.state.calendarCardShow === false) {
      this.setState({
        calendarCardShow: true,
        startOrEnd: startOrEnd,
      });
    } else {
      this.setState({
        calendarCardShow: false,
        dateSelected: this.state.originalDateSelected,
        hourSelected: '12',
        minuteSelected: '00',
        ampm: 'PM',
      });
    }
  }

  toggleTime(timeselection) {
    if (this.state.timeCardShow === false) {
      this.setState({
        timeCardShow: true,
        timeselection: timeselection,
      });
    } else {
      this.setState({
        timeCardShow: false,
      });
    }
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

  onSaveClick() {
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
      Object.keys(this.state.dateSelected)[0] +
      'T' +
      hourSelected +
      ':' +
      this.state.minuteSelected +
      ':00Z';
    var selectedDate = new Date(dateString);

    var d = new Date();
    var localTime = selectedDate.getTime();
    var localOffset = d.getTimezoneOffset() * 60000;
    var utc = localTime + localOffset;

    if (this.state.startOrEnd === 'startAt') {
      if (Date.now() > utc) {
        alert('Sorry, select a date and time in the future.');
      } else if (
        this.state.endObject - selectedDate < 0 &&
        this.state.endObject !== ''
      ) {
        alert(
          'Sorry, select a date and time before your end date: ' +
            this.state.endAt
        );
      } else {
        this.setState({
          startAt:
            this.state.hourSelected +
            ':' +
            this.state.minuteSelected +
            ' ' +
            this.state.ampm +
            ' on ' +
            Moment(
              selectedDate.toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            ).format('MM/DD/YYYY'),
          startObject: new Date(dateString),
          calendarCardShow: false,
          startDateString: new Date(utc),
        });
      }
    } else {
      if (selectedDate - this.state.startObject < 0) {
        alert(
          'Sorry, select a date and time after your start date: ' +
            this.state.startAt
        );
      } else {
        this.setState({
          endAt:
            this.state.hourSelected +
            ':' +
            this.state.minuteSelected +
            ' ' +
            this.state.ampm +
            ' on ' +
            Moment(
              selectedDate.toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            ).format('MM/DD/YYYY'),
          endObject: new Date(dateString),
          calendarCardShow: false,
          endDateString: new Date(utc),
        });
      }
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
      (this.state.assignees.length > 0 ||
        this.state.selectedSquad.name === 'Personal Event (No Squad Selected)')
    ) {
      isEnabled = '';
      text_color = 'white';
    }

    var isAssigneeEnabled = 'false';
    var assignee_text_color = 'grey';
    if (
      this.state.selectedSquad.name !== 'Personal Event (No Squad Selected)'
    ) {
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
                this.state.assigneeCardShow === false &&
                this.state.calendarCardShow === false &&
                this.state.timeCardShow === false ? (
                  <React.Fragment>
                    <ScrollView>
                      <TextInput
                        style={styles.title_input}
                        placeholder="Event Title"
                        placeholderTextColor="#F4F4F4"
                        multiline
                        blurOnSubmit
                        onChangeText={title => this.setState({ title })}
                        value={this.state.title}
                      />
                      <TextInput
                        style={styles.title_input}
                        placeholder="Description"
                        placeholderTextColor="#F4F4F4"
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
                      <TouchableOpacity
                        onPress={this.toggleCalendar.bind(this, 'startAt')}>
                        <Text style={styles.info}>{this.state.startAt}</Text>
                      </TouchableOpacity>
                      <View style={styles.line} />
                      <TouchableOpacity
                        onPress={this.toggleCalendar.bind(this, 'endAt')}>
                        <Text style={styles.info}>{this.state.endAt}</Text>
                      </TouchableOpacity>
                      <View style={styles.line} />
                      <Text style={[styles.info, { fontWeight: 'bold' }]}>
                        Assignees:
                      </Text>
                      {this.state.assignees.length === 0 &&
                      this.state.selectedSquad.name !==
                        'Personal Event (No Squad Selected)' ? (
                        <Text style={styles.noSquads}>
                          Add assignees with the button below!
                        </Text>
                      ) : null}
                      {this.state.assignees.length === 0 &&
                      this.state.selectedSquad.name ===
                        'Personal Event (No Squad Selected)' ? (
                        <Text style={styles.noSquads}>
                          This will be saved as a personal event.
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
                              Create Event
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
                    <TouchableOpacity
                      onPress={this.chooseSquad.bind(this, 'Personal Event')}>
                      <Text
                        style={[
                          styles.card_info,
                          {
                            fontSize: 20,
                            textAlign: 'center',
                            marginTop: Dimensions.get('window').height * 0.02,
                          },
                        ]}>
                        Personal Event
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
                    {this.state.startOrEnd === 'startAt' ? (
                      <Text style={styles.startOrEnd}>Start At</Text>
                    ) : (
                      <Text style={styles.startOrEnd}>End At</Text>
                    )}
                    <ScrollView>
                      <Calendar
                        extraData={this.state}
                        markedDates={this.state.dateSelected}
                        dateNameStyle={{ fontWeight: 'bold' }}
                        current={Object.keys(this.state.dateSelected)[0]}
                        onDayPress={day => {
                          this.setState({
                            dateSelected: {
                              [day.dateString]: {
                                selected: true,
                                selectedColor: '#D616CF',
                              },
                            },
                            calendarShow: false,
                            firstSelect: false,
                          });
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
                          marginBottom: Dimensions.get('window').height * 0.025,
                          paddingBottom: Dimensions.get('window').height * 0.02,
                          alignSelf: 'center',
                        }}
                        //markedDates={this.state.events}
                      />
                      <View
                        style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <TouchableOpacity
                          onPress={this.toggleTime.bind(this, 'hours')}>
                          <Text style={styles.time_input}>
                            {this.state.hourSelected}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.time_input}>{'  :  '}</Text>
                        <TouchableOpacity
                          onPress={this.toggleTime.bind(this, 'minutes')}>
                          <Text style={styles.time_input}>
                            {this.state.minuteSelected}
                            {'     '}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toggleAmPm.bind(this)}>
                          <Text style={styles.time_input}>
                            {this.state.ampm}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {/*this flatlist is just to align the two different calendars*/}
                      <FlatList style={{ padding: 10 }} />
                      <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={this.onSaveClick.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Save</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.toggleCalendar.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Cancel</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </React.Fragment>
                ) : null}
                {this.state.timeCardShow === true ? (
                  <Card
                    style={[
                      styles.resultsCard,
                      {
                        marginLeft: Dimensions.get('window').width * 0,
                        marginTop: Dimensions.get('window').height * 0.125,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.card_info,
                        {
                          fontSize: 20,
                          textAlign: 'center',
                          marginTop: Dimensions.get('window').height * 0.02,
                        },
                      ]}>
                      Time
                    </Text>
                    <View style={styles.card_line} />
                    <ScrollView
                      style={{
                        height: Dimensions.get('window').height * 0.45,
                        width: Dimensions.get('window').width * 0.7,
                        marginBottom: Dimensions.get('window').height * 0.025,
                      }}>
                      <FlatList
                        style={{ padding: 10, marginBottom: 20 }}
                        data={
                          this.state.timeselection === 'hours'
                            ? this.state.hours
                            : this.state.minutes
                        }
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <React.Fragment>
                            <TouchableOpacity
                              onPress={this.onTimePress.bind(this, item)}>
                              <Text style={styles.card_info}>{item}</Text>
                            </TouchableOpacity>
                            <View style={styles.card_line} />
                          </React.Fragment>
                        )}
                      />
                    </ScrollView>
                  </Card>
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
  startOrEnd: {
    marginTop: Dimensions.get('window').height * -0.03,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
  },
});
