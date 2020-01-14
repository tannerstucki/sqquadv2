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
  Platform,
  SectionList,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import { CheckBox } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import Moment from 'moment';
import NavigationService from '../../navigation/NavigationService';

export default class SchedulerScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('schedulerName', 'Schedule Assistant'),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      users: ['intitialize'],
      loading: true,
      curscheduler: '',
      suggested_times: ['intitialize'],
      showDetailsCard: false,
      showResultsCard: false,
      checked: [],
      createChecked: [],
      organizer_id: '',
      suggested_dates: ['intitialize'],
      curdate: '',
      calendarDots: {},
      calendarShow: false,
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curscheduler = params.curscheduler;
    const suggested_times = Object.entries(curscheduler.suggested_times);
    const suggested_dates = Object.entries(curscheduler.suggested_dates);
    const users = Object.entries(curscheduler.users);

    for (let i = 0; i < suggested_dates.length; i++) {
      var calendarDots = this.state.calendarDots;
      calendarDots[suggested_dates[i][1].date] = {
        selected: true,
        selectedColor: '#D616CF',
        //marked: true,
        //dotColor: '#5B4FFF',
      };
    }

    for (let i = 0; i < suggested_times.length; i++) {
      var displayDate = '';
      if (
        Moment(
          new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
            'en-US',
            {
              timeZone: 'America/Los_Angeles',
            }
          )
        )
          .format('hh:mm A')
          .substring(0, 1) === '0' &&
        Moment(
          new Date(
            parseInt(suggested_times[i][1].time + curscheduler.duration * 60000)
          ).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
          })
        )
          .format('hh:mm A')
          .substring(0, 1) === '0'
      ) {
        displayDate =
          Moment(
            new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
              'en-US',
              {
                timeZone: 'America/Los_Angeles',
              }
            )
          ).format('h:mm A') +
          ' - ' +
          Moment(
            new Date(
              parseInt(
                suggested_times[i][1].time + curscheduler.duration * 60000
              )
            ).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
            })
          ).format('h:mm A');
      } else if (
        Moment(
          new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
            'en-US',
            {
              timeZone: 'America/Los_Angeles',
            }
          )
        )
          .format('hh:mm A')
          .substring(0, 1) !== '0' &&
        Moment(
          new Date(
            parseInt(suggested_times[i][1].time + curscheduler.duration * 60000)
          ).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
          })
        )
          .format('hh:mm A')
          .substring(0, 1) === '0'
      ) {
        displayDate =
          Moment(
            new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
              'en-US',
              {
                timeZone: 'America/Los_Angeles',
              }
            )
          ).format('hh:mm A') +
          ' - ' +
          Moment(
            new Date(
              parseInt(
                suggested_times[i][1].time + curscheduler.duration * 60000
              )
            ).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
            })
          ).format('h:mm A');
      } else if (
        Moment(
          new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
            'en-US',
            {
              timeZone: 'America/Los_Angeles',
            }
          )
        )
          .format('hh:mm A')
          .substring(0, 1) === '0' &&
        Moment(
          new Date(
            parseInt(suggested_times[i][1].time + curscheduler.duration * 60000)
          ).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
          })
        )
          .format('hh:mm A')
          .substring(0, 1) !== '0'
      ) {
        displayDate =
          Moment(
            new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
              'en-US',
              {
                timeZone: 'America/Los_Angeles',
              }
            )
          ).format('h:mm A') +
          ' - ' +
          Moment(
            new Date(
              parseInt(
                suggested_times[i][1].time + curscheduler.duration * 60000
              )
            ).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
            })
          ).format('hh:mm A');
      } else {
        displayDate =
          Moment(
            new Date(parseInt(suggested_times[i][1].time)).toLocaleString(
              'en-US',
              {
                timeZone: 'America/Los_Angeles',
              }
            )
          ).format('hh:mm A') +
          ' - ' +
          Moment(
            new Date(
              parseInt(
                suggested_times[i][1].time + curscheduler.duration * 60000
              )
            ).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
            })
          ).format('hh:mm A');
      }
      suggested_times[i][1].displayDate = displayDate;
    }

    if (curscheduler.responded) {
      suggested_times.sort(function(suggested_times1, suggested_times2) {
        return suggested_times1[1].votes < suggested_times2[1].votes;
      });
    }

    this.setState({
      curscheduler: curscheduler,
      suggested_times: suggested_times,
      users: users,
      suggested_dates: suggested_dates,
      curdate: suggested_dates[0][1].date + 'T12:00:00.000Z',
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    var squad_ref = firebase.database().ref('squads/' + curscheduler.squad_id);
    squad_ref.on('value', snapshot => {
      this.setState({ organizer_id: snapshot.val().organizer_id });
    });

    this.setState({ loading: false });
  }

  switchDetailsCard() {
    if (this.state.showDetailsCard === true) {
      this.setState({ showDetailsCard: false });
    } else {
      this.setState({ showDetailsCard: true });
    }
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
    this.setState({ showDetailsCard: false });
  }

  createRadioClick(item) {
    this.state.createChecked.splice(
      this.state.createChecked.findIndex(element => element === item[0]),
      1,
      item[0]
    );
    this.setState({ showDetailsCard: false });
  }

  onSubmit() {
    if (this.state.checked.length > 0) {
      const rootRef = firebase.database().ref();
      const schedulerRef = rootRef.child(
        'schedulers/' + this.state.curscheduler.key
      );

      var updatedScheduler = '';
      schedulerRef.once('value', snapshot => {
        updatedScheduler = snapshot.val();

        var suggested_times = updatedScheduler.suggested_times;
        for (let i = 0; i < this.state.checked.length; i++) {
          suggested_times[this.state.checked[i]].votes =
            suggested_times[this.state.checked[i]].votes + 1;
        }

        //get the responded status of the current user
        var users = this.state.curscheduler.users;
        var userIndex = users.findIndex(
          obj => obj.user_id === firebase.auth().currentUser.uid
        );
        if (userIndex !== -1) {
          users[userIndex].responded = true;
        }

        var schedulerUpdateData = {
          suggested_times: suggested_times,
          users: users,
          total_votes: updatedScheduler.total_votes + 1,
        };

        schedulerRef.update(schedulerUpdateData);

        for (let i = 0; i < Object.entries(suggested_times).length; i++) {
          var displayDate = '';
          if (
            Moment(
              new Date(
                parseInt(Object.entries(suggested_times)[i][1].time)
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) === '0' &&
            Moment(
              new Date(
                parseInt(
                  Object.entries(suggested_times)[i][1].time +
                    this.state.curscheduler.duration * 60000
                )
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) === '0'
          ) {
            displayDate =
              Moment(
                new Date(
                  parseInt(Object.entries(suggested_times)[i][1].time)
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('h:mm A') +
              ' - ' +
              Moment(
                new Date(
                  parseInt(
                    Object.entries(suggested_times)[i][1].time +
                      this.state.curscheduler.duration * 60000
                  )
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('h:mm A');
          } else if (
            Moment(
              new Date(
                parseInt(Object.entries(suggested_times)[i][1].time)
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) !== '0' &&
            Moment(
              new Date(
                parseInt(
                  Object.entries(suggested_times)[i][1].time +
                    this.state.curscheduler.duration * 60000
                )
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) === '0'
          ) {
            displayDate =
              Moment(
                new Date(
                  parseInt(Object.entries(suggested_times)[i][1].time)
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('hh:mm A') +
              ' - ' +
              Moment(
                new Date(
                  parseInt(
                    Object.entries(suggested_times)[i][1].time +
                      this.state.curscheduler.duration * 60000
                  )
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('h:mm A');
          } else if (
            Moment(
              new Date(
                parseInt(Object.entries(suggested_times)[i][1].time)
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) === '0' &&
            Moment(
              new Date(
                parseInt(
                  Object.entries(suggested_times)[i][1].time +
                    this.state.curscheduler.duration * 60000
                )
              ).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            )
              .format('hh:mm A')
              .substring(0, 1) !== '0'
          ) {
            displayDate =
              Moment(
                new Date(
                  parseInt(Object.entries(suggested_times)[i][1].time)
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('h:mm A') +
              ' - ' +
              Moment(
                new Date(
                  parseInt(
                    Object.entries(suggested_times)[i][1].time +
                      this.state.curscheduler.duration * 60000
                  )
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('hh:mm A');
          } else {
            displayDate =
              Moment(
                new Date(
                  parseInt(Object.entries(suggested_times)[i][1].time)
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('hh:mm A') +
              ' - ' +
              Moment(
                new Date(
                  parseInt(
                    Object.entries(suggested_times)[i][1].time +
                      this.state.curscheduler.duration * 60000
                  )
                ).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('hh:mm A');
          }
          Object.entries(suggested_times)[i][1].displayDate = displayDate;
        }

        this.setState({
          curscheduler: {
            createdAt: this.state.curscheduler.createdAt,
            creator_id: this.state.curscheduler.creator_id,
            creator_name: this.state.curscheduler.creator_name,
            title: this.state.curscheduler.title,
            suggested_times: Object.entries(suggested_times),
            suggested_dates: this.state.curscheduler.suggested_dates,
            squad_id: this.state.curscheduler.squad_id,
            status: this.state.curscheduler.status,
            total_votes: this.state.curscheduler.total_votes + 1,
            responded: true,
            users: users,
            key: this.state.curscheduler.key,
            duration: this.state.curscheduler.duration,
          },
          users: Object.entries(users),
          suggested_times: Object.entries(schedulerUpdateData.suggested_times),
        });
      });
      alert('Thanks for voting!');
      this.setState({ showDetailsCard: false });
    } else {
      alert('You need to vote for an option before submitting.');
    }
  }

  closeOpenScheduler() {
    if (!this.state.curscheduler.event_created) {
      const rootRef = firebase.database().ref();
      const schedulerRef = rootRef.child(
        'schedulers/' + this.state.curscheduler.key
      );
      var schedulerUpdateData = '';

      if (this.state.curscheduler.status === 'open') {
        schedulerUpdateData = {
          createdAt: this.state.curscheduler.createdAt,
          creator_id: this.state.curscheduler.creator_id,
          creator_name: this.state.curscheduler.creator_name,
          title: this.state.curscheduler.title,
          suggested_times: this.state.curscheduler.suggested_times,
          suggested_dates: this.state.curscheduler.suggested_dates,
          squad_id: this.state.curscheduler.squad_id,
          status: 'closed',
          total_votes: this.state.curscheduler.total_votes,
          event_created: this.state.curscheduler.event_created,
          users: this.state.curscheduler.users,
          duration: this.state.curscheduler.duration,
        };
        alert('You have closed this time request');
      } else {
        schedulerUpdateData = {
          createdAt: this.state.curscheduler.createdAt,
          creator_id: this.state.curscheduler.creator_id,
          creator_name: this.state.curscheduler.creator_name,
          title: this.state.curscheduler.title,
          suggested_times: this.state.curscheduler.suggested_times,
          suggested_dates: this.state.curscheduler.suggested_dates,
          squad_id: this.state.curscheduler.squad_id,
          status: 'open',
          total_votes: this.state.curscheduler.total_votes,
          event_created: this.state.curscheduler.event_created,
          users: this.state.curscheduler.users,
          duration: this.state.curscheduler.duration,
        };
        alert('You have reopened this time request');
      }

      schedulerRef.update(schedulerUpdateData);
      schedulerUpdateData.key = this.state.curscheduler.key;
      this.setState({ curscheduler: schedulerUpdateData });
    } else {
      alert(
        'Sorry, you have already created an event from this time request. You cannot reopen it.'
      );
    }
  }

  toggleCalendar() {
    if (this.state.calendarShow === true) {
      this.setState({
        calendarShow: false,
      });
    } else {
      this.setState({
        calendarShow: true,
      });
    }
  }

  onLeftPress() {
    var index = this.state.suggested_dates.findIndex(
      obj => obj[1].date === this.state.curdate.substring(0, 10)
    );
    this.setState({
      curdate: this.state.suggested_dates[index - 1][1].date + 'T12:00:00.000Z',
    });
  }

  onRightPress() {
    var index = this.state.suggested_dates.findIndex(
      obj => obj[1].date === this.state.curdate.substring(0, 10)
    );
    this.setState({
      curdate: this.state.suggested_dates[index + 1][1].date + 'T12:00:00.000Z',
    });
  }

  onCreateEventPress() {
    if (this.state.curscheduler.event_created) {
      alert('Sorry, you have already created an event for this time request.');
    } else {
      if (this.state.createChecked.length < 1) {
        alert('Sorry, you have to select a date first.');
      } else {
        var assignees = [];
        for (let i = 0; i < this.state.users.length; i++) {
          assignees.push({
            user_id: this.state.users[i][1].user_id,
            user_name: this.state.users[i][1].user_name,
            rsvp: 'Undecided',
          });
        }

        var event_post = firebase
          .database()
          .ref('events/')
          .push({
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            creator_id: firebase.auth().currentUser.uid,
            creator_name:
              this.state.curuser.first_name +
              ' ' +
              this.state.curuser.last_name,
            title: this.state.curscheduler.title.trim(),
            description: this.state.curscheduler.description.trim(),
            users: assignees,
            squad_id: this.state.curscheduler.squad_id,
            startAt: this.state.suggested_times[this.state.createChecked[0]][1]
              .time,
            endAt:
              this.state.suggested_times[this.state.createChecked[0]][1].time +
              this.state.curscheduler.duration * 60000,
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

            firebase
              .database()
              .ref('squads/' + this.state.curscheduler.squad_id)
              .once('value', snapshot => {
                var squad_users = snapshot.val().users;

                if (
                  this.state.curscheduler.squad_id !== 'null' &&
                  Object.values(squad_users).length === this.state.users.length
                ) {
                  firebase
                    .database()
                    .ref('threads')
                    .orderByChild('squad_id')
                    .equalTo(this.state.curscheduler.squad_id)
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
                            this.state.curscheduler.title.trim() +
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
                }
                /*Add Functionality to send messages from the virtual manager to an individual person
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
          });

        const rootRef = firebase.database().ref();
        const schedulerRef = rootRef.child(
          'schedulers/' + this.state.curscheduler.key
        );

        var schedulerUpdateData = {
          createdAt: this.state.curscheduler.createdAt,
          creator_id: this.state.curscheduler.creator_id,
          creator_name: this.state.curscheduler.creator_name,
          title: this.state.curscheduler.title,
          suggested_times: this.state.curscheduler.suggested_times,
          suggested_dates: this.state.curscheduler.suggested_dates,
          squad_id: this.state.curscheduler.squad_id,
          status: 'closed',
          total_votes: this.state.curscheduler.total_votes,
          event_created: true,
          users: this.state.curscheduler.users,
          duration: this.state.curscheduler.duration,
        };

        schedulerRef.update(schedulerUpdateData);
        schedulerUpdateData.key = this.state.curscheduler.key;
        this.setState({ curscheduler: schedulerUpdateData });

        NavigationService.navigate('MySchedulersScreen', {});

        alert('Your event has been created!');
      }
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
            {this.state.curscheduler.status === 'open' &&
            this.state.curscheduler.responded === false &&
            this.state.showDetailsCard === false &&
            this.state.calendarShow === false ? (
              <React.Fragment>
                <React.Fragment>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginTop: Dimensions.get('window').height * -0.05,
                      marginBottom: Dimensions.get('window').height * 0.02,
                    }}>
                    {this.state.suggested_dates.findIndex(
                      obj => obj[1].date === this.state.curdate.substring(0, 10)
                    ) !== 0 ? (
                      <TouchableOpacity onPress={this.onLeftPress.bind(this)}>
                        <Image
                          style={styles.icon}
                          source={require('../../assets/icons/left-arrow.png')}
                        />
                      </TouchableOpacity>
                    ) : null}
                    {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                      <TouchableOpacity
                        onPress={this.toggleCalendar.bind(this)}>
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
                        onPress={this.toggleCalendar.bind(this)}>
                        <View>
                          <Text style={styles.dateOption}>
                            {Moment(new Date(this.state.curdate)).format(
                              'dddd, MM/DD/YYYY'
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {this.state.suggested_dates.findIndex(
                      obj => obj[1].date === this.state.curdate.substring(0, 10)
                    ) !==
                    this.state.suggested_dates.length - 1 ? (
                      <TouchableOpacity onPress={this.onRightPress.bind(this)}>
                        <Image
                          style={styles.icon}
                          source={require('../../assets/icons/right-arrow.png')}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    {this.state.curscheduler.title}
                  </Text>
                  <FlatList
                    style={{ padding: 10 }}
                    extraData={this.state.checked}
                    data={this.state.suggested_times}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <React.Fragment>
                        {Moment(
                          new Date(parseInt(item[1].time)).toLocaleString(
                            'en-US',
                            {
                              timeZone: 'America/Los_Angeles',
                            }
                          )
                        ).format('MM/DD/YYYY') ===
                        Moment(new Date(this.state.curdate)).format(
                          'MM/DD/YYYY'
                        ) ? (
                          <React.Fragment>
                            <TouchableOpacity
                              onPress={this.radioClick.bind(this, item)}
                              style={[
                                this.state.checked.findIndex(
                                  element => element === item[0]
                                ) !== -1
                                  ? {
                                      backgroundColor: '#FFA0FC',
                                      borderRadius: 15,
                                    }
                                  : null,
                              ]}>
                              <View style={{ flexDirection: 'row' }}>
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
                                <Text style={styles.responseInfo}>
                                  {item[1].displayDate}
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <View style={styles.greyLine} />
                          </React.Fragment>
                        ) : null}
                      </React.Fragment>
                    )}
                  />
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={this.onSubmit.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Submit</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.switchDetailsCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>See Details</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.state.showDetailsCard === false &&
                this.state.calendarShow === false ? (
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
                              marginBottom:
                                Dimensions.get('window').height * 0.01,
                            },
                          ]}>
                          {this.state.curscheduler.title}
                        </Text>
                        {this.state.curscheduler.creator_id ===
                          firebase.auth().currentUser.uid ||
                        this.state.organizer_id ===
                          firebase.auth().currentUser.uid ? (
                          <Text style={styles.schedulerTypeInfo}>Results</Text>
                        ) : (
                          <React.Fragment>
                            {this.state.curscheduler.responded !== null ? (
                              <React.Fragment>
                                {this.state.curscheduler.responded === true ? (
                                  <Text style={styles.schedulerTypeInfo}>
                                    You have completed this time request.
                                  </Text>
                                ) : (
                                  <Text style={styles.schedulerTypeInfo}>
                                    This time request is closed.
                                  </Text>
                                )}
                                <Text style={styles.schedulerTypeInfo}>
                                  The time request creator or squad organizer
                                  can share the results with you.
                                </Text>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <Text style={styles.schedulerTypeInfo}>
                                  You were not asked to reply to this time
                                  request.
                                </Text>
                                <Text style={styles.schedulerTypeInfo}>
                                  The time request creator or squad organizer
                                  can share the results with you.
                                </Text>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        )}
                        <View
                          style={[
                            styles.line,
                            {
                              marginTop: Dimensions.get('window').height * 0.01,
                            },
                          ]}
                        />
                        <FlatList
                          style={{ padding: 10 }}
                          extraData={this.state}
                          data={this.state.suggested_times}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <React.Fragment>
                              <View
                                style={{
                                  flexDirection: 'row',
                                }}>
                                {this.state.curscheduler.creator_id ===
                                  firebase.auth().currentUser.uid ||
                                this.state.organizer_id ===
                                  firebase.auth().currentUser.uid ? (
                                  <TouchableOpacity
                                    onPress={this.createRadioClick.bind(
                                      this,
                                      item
                                    )}
                                    style={[
                                      this.state.createChecked.findIndex(
                                        element => element === item[0]
                                      ) !== -1
                                        ? {
                                            backgroundColor: '#FFA0FC',
                                            borderRadius: 15,
                                            width:
                                              Dimensions.get('window').width *
                                              0.67,
                                          }
                                        : null,
                                    ]}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                      }}>
                                      <Text style={styles.responseInfo}>
                                        {item[1].displayDate} : {item[1].votes}{' '}
                                        Votes
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                ) : (
                                  <Text style={styles.responseInfo}>
                                    {item[1].displayDate}
                                  </Text>
                                )}
                              </View>
                              <View style={styles.greyLine} />
                              <Text style={styles.answersGeneric}>
                                {Moment(
                                  new Date(
                                    parseInt(item[1].time)
                                  ).toLocaleString('en-US', {
                                    timeZone: 'America/Los_Angeles',
                                  })
                                ).format('dddd, MM/DD/YYYY')}
                              </Text>
                            </React.Fragment>
                          )}
                        />
                      </ScrollView>
                    </Card>
                    <View style={styles.buttonRow}>
                      {this.state.curscheduler.creator_id ===
                        firebase.auth().currentUser.uid ||
                      this.state.organizer_id ===
                        firebase.auth().currentUser.uid ? (
                        <TouchableOpacity
                          onPress={this.onCreateEventPress.bind(this)}>
                          <View style={styles.customButton}>
                            <Text
                              style={[
                                this.state.curscheduler.event_created
                                  ? [styles.buttonText, { color: 'grey' }]
                                  : styles.buttonText,
                              ]}>
                              Create Event
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        onPress={this.switchDetailsCard.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>See Details</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : null}
              </React.Fragment>
            )}
            {this.state.calendarShow === true ? (
              <React.Fragment>
                <Calendar
                  extraData={this.state}
                  markedDates={this.state.calendarDots}
                  dateNameStyle={{ fontWeight: 'bold' }}
                  current={this.state.curdate}
                  onDayPress={day => {
                    JSON.stringify(this.state.suggested_dates).includes(
                      day.dateString
                    )
                      ? this.setState({
                          calendarShow: false,
                          curdate: day.dateString + 'T12:00:00.000Z',
                        })
                      : alert(
                          'Sorry, please choose a date that has been suggested.'
                        );
                  }}
                  hideArrows={false}
                  disableMonthChange={false}
                  theme={{
                    arrowColor: 'black',
                  }}
                  style={{
                    width: Dimensions.get('window').width * 0.9,
                    borderRadius: 15,
                    marginTop: Dimensions.get('window').height * 0.065,
                    marginBottom: Dimensions.get('window').height * 0.025,
                    paddingBottom: Dimensions.get('window').height * 0.02,
                    shadowOffset: { width: 12, height: 12 },
                    shadowColor: 'black',
                    shadowOpacity: 0.15,
                  }}
                />
                {/*this flatlist is just to align the two different calendars*/}
                <FlatList style={{ padding: 10 }} />
              </React.Fragment>
            ) : null}
            {this.state.showDetailsCard ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text style={styles.detailsInfo}>
                      {this.state.curscheduler.creator_name}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Creator</Text>
                    <Text style={styles.detailsInfo}>
                      {new Date(
                        parseInt(this.state.curscheduler.createdAt)
                      ).toLocaleString('en-US', {
                        timeZone: 'America/Los_Angeles',
                      })}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Created At</Text>
                    <Text style={styles.detailsInfo}>
                      {this.state.curscheduler.status}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Status</Text>
                    <Text style={styles.detailsInfo}>
                      {this.state.curscheduler.total_votes}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Number of Responses</Text>
                    <Text style={styles.detailsInfo}>Responders:</Text>
                    <View style={styles.line} />
                    <FlatList
                      style={{ padding: 10 }}
                      extraData={this.state.checked}
                      data={this.state.users}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          {item[1].responded === true ? (
                            <View
                              style={{
                                marginBottom:
                                  Dimensions.get('window').height * 0.01,
                              }}>
                              <Text
                                style={[
                                  styles.generic,
                                  {
                                    marginLeft:
                                      Dimensions.get('window').width * 0.05,
                                    color: '#5B4FFF',
                                    marginBottom:
                                      Dimensions.get('window').height * 0.01,
                                  },
                                ]}>
                                {item[1].user_name}
                              </Text>
                            </View>
                          ) : null}
                        </React.Fragment>
                      )}
                    />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  {this.state.curscheduler.creator_id ===
                    firebase.auth().currentUser.uid ||
                  this.state.organizer_id ===
                    firebase.auth().currentUser.uid ? (
                    <TouchableOpacity
                      onPress={this.closeOpenScheduler.bind(this)}>
                      <View style={styles.customButton}>
                        {this.state.curscheduler.status === 'open' ? (
                          <Text style={styles.buttonText}>Close Request</Text>
                        ) : (
                          <Text
                            style={[
                              this.state.curscheduler.event_created
                                ? [styles.buttonText, { color: 'grey' }]
                                : styles.buttonText,
                            ]}>
                            Reopen Request
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={this.switchDetailsCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Close Details</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
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
    marginVertical: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
    textAlign: 'center',
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
  schedulerTypeInfo: {
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
  generic: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.075,
    color: '#8F8F8F',
  },
  answersGeneric: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.025,
    marginBottom: Dimensions.get('window').height * 0.025,
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
  greyLine: {
    backgroundColor: '#B8B8B8',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
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
