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
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import CalendarStrip from 'react-native-calendar-strip';
import Moment from 'moment';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import NavigationService from '../../navigation/NavigationService';

export default class MyEventsScreen extends React.Component {
  static navigationOptions = {
    title: 'Schedule',
  };

  constructor(props) {
    super(props);
    this.state = {
      squads: [],
      events: [],
      markedDates: [],
      noEvents: true,
      dateSelected: '',
      calendarShow: false,
      firstSelect: true,
      switchSquadCardShow: false,
      squadOption: 'My Schedule',
      calendarDots: {},
      calendarStripDots: [],
    };
  }

  componentDidMount() {
    var user_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    user_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    const rootRef = firebase.database().ref();
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

    const eventsRef = rootRef.child('events');

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid)
      .child('events');
    data_ref.on('value', snapshot => {
      snapshot.forEach(snapshot => {
        eventsRef
          .child(snapshot.val().event_id)
          .orderByChild('startAt')
          .on('value', snapshot => {
            var item = snapshot.val();
            item.key = snapshot.key;
            var switchArray = this.state.events;
            var index = switchArray.findIndex(obj => obj.key === item.key);
            if (index !== -1) {
              switchArray.splice(index, 1);
              switchArray.unshift(item);
              this.setState({ events: switchArray, noEvents: false });
            } else {
              switchArray.push(item);

              var objectTitle = Moment(
                new Date(parseInt(item.startAt)).toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })
              ).format('YYYY-MM-DD');

              var calendarDots = this.state.calendarDots;
              calendarDots[objectTitle] = {
                /*marked: true, dotColor: '#5B4FFF'*/
                selected: true,
                selectedColor: '#D616CF',
              };

              var calendarStripDots = this.state.calendarStripDots;
              calendarStripDots.push({
                date: objectTitle,
                dots: [{ color: '#5B4FFF', selectedDotColor: 'white' }],
              });

              this.setState({
                calendarDots: calendarDots,
                calendarStripDots: calendarStripDots,
                events: switchArray,
                noEvents: false,
              });
            }
          });
      });
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
      dateSelected: {
        [fullDate]: {
          selected: true,
          selectedColor: '#D616CF',
        },
      },
    });
  }

  onDayPress(day) {
    this.setState({
      selected: day.dateString,
    });
  }

  switchSquadOption() {
    if (this.state.noSquads === true) {
      alert('Sorry, you have no squads. Join or create one to get started!');
    } else {
      this.setState({ switchSquadCardShow: true });
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

  updateEvents(item) {
    const rootRef = firebase.database().ref();
    const eventsRef = rootRef.child('events');

    if (item.name) {
      this.setState({
        squadOption: item.name,
        squad_id: item.key,
      });
      var squad_data_ref = firebase
        .database()
        .ref('events')
        .orderByChild('squad_id')
        .equalTo(item.key);
      squad_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          var item = snapshot.val();
          item.key = snapshot.key;
          var switchArray = this.state.events;
          var index = switchArray.findIndex(obj => obj.key === item.key);
          if (index === -1) {
            switchArray.push(item);

            var objectTitle = Moment(
              new Date(parseInt(item.startAt)).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
              })
            ).format('YYYY-MM-DD');

            var calendarDots = this.state.calendarDots;
            calendarDots[objectTitle] = {
              /*marked: true, dotColor: '#5B4FFF'*/
              selected: true,
              selectedColor: '#D616CF',
            };

            var calendarStripDots = this.state.calendarStripDots;
            calendarStripDots.push({
              date: objectTitle,
              dots: [{ color: '#5B4FFF', selectedDotColor: 'white' }],
            });

            this.setState({
              calendarDots: calendarDots,
              calendarStripDots: calendarStripDots,
              events: switchArray,
              noEvents: false,
            });
          }
        });
      });
    } else {
      this.setState({
        squadOption: 'My Schedule',
        squad_id: '',
      });
      var user_data_ref = firebase
        .database()
        .ref('users/' + firebase.auth().currentUser.uid)
        .child('events');
      user_data_ref.on('value', snapshot => {
        snapshot.forEach(snapshot => {
          eventsRef
            .child(snapshot.val().event_id)
            .orderByChild('startAt')
            .on('value', snapshot => {
              var item = snapshot.val();
              item.key = snapshot.key;
              var switchArray = this.state.events;
              var index = switchArray.findIndex(obj => obj.key === item.key);
              if (index === -1) {
                switchArray.push(item);

                var objectTitle = Moment(
                  new Date(parseInt(item.startAt)).toLocaleString('en-US', {
                    timeZone: 'America/Los_Angeles',
                  })
                ).format('YYYY-MM-DD');

                var calendarDots = this.state.calendarDots;
                calendarDots[objectTitle] = {
                  /*marked: true,
                  dotColor: '#5B4FFF',*/
                  selected: true,
                  selectedColor: '#D616CF',
                };

                var calendarStripDots = this.state.calendarStripDots;
                calendarStripDots.push({
                  date: objectTitle,
                  dots: [{ color: '#5B4FFF', selectedDotColor: 'white' }],
                });

                this.setState({
                  calendarDots: calendarDots,
                  calendarStripDots: calendarStripDots,
                  events: switchArray,
                  noEvents: false,
                });
              }
            });
        });
      });
    }
  }

  chooseSquad(item) {
    if (
      item !== this.state.squadOption &&
      item.name !== this.state.squadOption
    ) {
      this.setState(
        { events: [], calendarDots: {}, calendarStripDots: [], noEvents: true },
        this.updateEvents.bind(this, item)
      );
    }

    //this if checks to see that the calendar is showing and basically reloads it to regenerate dots
    if (this.state.calendarShow) {
      this.setState(
        {
          switchSquadCardShow: false,
          calendarShow: false,
        },
        () => {
          this.setState({
            switchSquadCardShow: false,
            calendarShow: true,
          });
        }
      );
    } else {
      this.setState({
        switchSquadCardShow: false,
        calendarShow: false,
      });
    }
  }

  openEvent(curevent) {
    var eventName;
    if (curevent.squad_id !== 'null') {
      for (let i = 0; i < this.state.squads.length; i++) {
        if (this.state.squads[i].key === curevent.squad_id) {
          eventName = this.state.squads[i].name;
          break;
        }
      }
    } else {
      eventName = 'Event Details';
    }

    NavigationService.navigate('EventScreen', {
      curevent: curevent,
      eventName: eventName,
    });
  }

  createEvent() {
    NavigationService.navigate('CreateEventScreen', {
      squads: this.state.squads,
    });
  }

  openScheduler() {
    NavigationService.navigate('MySchedulersScreen', {});
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
                    <TouchableOpacity
                      onPress={this.switchSquadOption.bind(this)}>
                      <View>
                        <Text style={styles.squadOption}>
                          {this.state.squadOption}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {this.state.calendarShow === true ? (
                      <React.Fragment>
                        <Calendar
                          extraData={this.state}
                          markedDates={this.state.calendarDots}
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
                            shadowOffset: { width: 12, height: 12 },
                            shadowColor: 'black',
                            shadowOpacity: 0.15,
                          }}
                        />
                        {/*this flatlist is just to align the two different calendars*/}
                        <FlatList style={{ padding: 10 }} />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <TouchableOpacity
                          onPress={this.toggleCalendar.bind(this)}>
                          <CalendarStrip
                            selectedDate={
                              this.state.firstSelect === true
                                ? new Date()
                                : new Date(
                                    Object.keys(this.state.dateSelected) +
                                      'T12:00:00.000Z'
                                  )
                            }
                            onDateSelected={day => {
                              this.setState({
                                dateSelected: {
                                  [day.format().substring(0, 10)]: {
                                    selected: true,
                                    selectedColor: '#D616CF',
                                    selectedDotColor: 'white',
                                  },
                                },
                                calendarShow: false,
                                firstSelect: false,
                              });
                            }}
                            markedDates={this.state.calendarStripDots}
                            iconLeft={require('../../assets/icons/left-arrow.png')}
                            iconRight={require('../../assets/icons/right-arrow.png')}
                            calendarColor={'white'}
                            dateNameStyle={{
                              color: 'black',
                              fontSize: 10,
                              fontWeight: 'regular',
                            }}
                            highlightDateNameStyle={{
                              color: 'white',
                              fontSize: 10,
                            }}
                            dateNumberStyle={{
                              color: 'black',
                              fontSize: 15,
                              fontWeight: 'regular',
                            }}
                            highlightDateNumberStyle={{
                              color: 'white',
                              fontSize: 15,
                            }}
                            calendarHeaderStyle={{
                              color: 'black',
                              fontSize: 15,
                              fontWeight: 'regular',
                            }}
                            calendarHeaderContainerStyle={{ padding: 10 }}
                            iconStyle={{
                              width: 20,
                              height: 20,
                              marginBottom: 30,
                            }}
                            daySelectionAnimation={{
                              type: 'background',
                              duration: 300,
                              highlightColor: '#D616CF',
                            }}
                            style={{
                              width: Dimensions.get('window').width * 0.9,
                              height:
                                Platform.OS === 'ios' ||
                                Platform.OS === 'android'
                                  ? Dimensions.get('window').height * 0.12
                                  : Dimensions.get('window').height * 0.2,
                              marginTop:
                                Dimensions.get('window').height * 0.025,
                              borderRadius: 15,
                              paddingHorizontal: 5,
                              fontWeight: 'regular',
                              shadowOffset: { width: 7, height: 7 },
                              shadowColor: 'black',
                              shadowOpacity: 0.2,
                            }}
                          />
                        </TouchableOpacity>
                        {this.state.noEvents === true ? (
                          <React.Fragment>
                            {this.state.noSquads === true ? (
                              <React.Fragment>
                                <Text style={styles.noEvents}>
                                  Sorry, you have no events.
                                </Text>
                                <Text style={styles.noEvents}>
                                  Create an event for yourself or get started by
                                  creating or joining a squad!
                                </Text>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <Text style={styles.noEvents}>
                                  Events from your new squads will show up here.
                                </Text>
                                <Text style={styles.noEvents}>
                                  To see previously created events for your
                                  squads, select a squad from the filter above!
                                </Text>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ) : null}
                        <FlatList
                          style={{ padding: 10 }}
                          extraData={this.state}
                          data={this.state.events}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <React.Fragment>
                              {Moment(
                                new Date(parseInt(item.startAt)).toLocaleString(
                                  'en-US',
                                  {
                                    timeZone: 'America/Los_Angeles',
                                  }
                                )
                              ).format('YYYY-MM-DD') ===
                              Object.keys(this.state.dateSelected)[0] ? (
                                <TouchableOpacity
                                  onPress={this.openEvent.bind(this, item)}>
                                  <Card style={styles.listCard}>
                                    <Text style={styles.info}>
                                      {item.title}
                                    </Text>
                                    <View style={{ flexDirection: 'row' }}>
                                      {Moment(
                                        new Date(
                                          parseInt(item.startAt)
                                        ).toLocaleString('en-US', {
                                          timeZone: 'America/Los_Angeles',
                                        })
                                      )
                                        .format('hh:mm A')
                                        .substring(0, 1) === '0' ? (
                                        <Text style={styles.startAt}>
                                          {Moment(
                                            new Date(
                                              parseInt(item.startAt)
                                            ).toLocaleString('en-US', {
                                              timeZone: 'America/Los_Angeles',
                                            })
                                          ).format('h:mm A')}{' '}
                                          to
                                        </Text>
                                      ) : (
                                        <Text style={styles.startAt}>
                                          {Moment(
                                            new Date(
                                              parseInt(item.startAt)
                                            ).toLocaleString('en-US', {
                                              timeZone: 'America/Los_Angeles',
                                            })
                                          ).format('hh:mm A')}{' '}
                                          to
                                        </Text>
                                      )}
                                      {Moment(
                                        new Date(
                                          parseInt(item.startAt)
                                        ).toLocaleString('en-US', {
                                          timeZone: 'America/Los_Angeles',
                                        })
                                      ).format('yyyy-mm-dd') ===
                                      Moment(
                                        new Date(
                                          parseInt(item.endAt)
                                        ).toLocaleString('en-US', {
                                          timeZone: 'America/Los_Angeles',
                                        })
                                      ).format('yyyy-mm-dd') ? (
                                        <React.Fragment>
                                          {Moment(
                                            new Date(
                                              parseInt(item.endAt)
                                            ).toLocaleString('en-US', {
                                              timeZone: 'America/Los_Angeles',
                                            })
                                          )
                                            .format('hh:mm A')
                                            .substring(0, 1) === '0' ? (
                                            <Text style={styles.endAt}>
                                              {Moment(
                                                new Date(
                                                  parseInt(item.endAt)
                                                ).toLocaleString('en-US', {
                                                  timeZone:
                                                    'America/Los_Angeles',
                                                })
                                              ).format('h:mm A')}
                                            </Text>
                                          ) : (
                                            <Text style={styles.endAt}>
                                              {Moment(
                                                new Date(
                                                  parseInt(item.endAt)
                                                ).toLocaleString('en-US', {
                                                  timeZone:
                                                    'America/Los_Angeles',
                                                })
                                              ).format('hh:mm A')}
                                            </Text>
                                          )}
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                          {Moment(
                                            new Date(
                                              parseInt(item.endAt)
                                            ).toLocaleString('en-US', {
                                              timeZone: 'America/Los_Angeles',
                                            })
                                          )
                                            .format('hh:mm A')
                                            .substring(0, 1) === '0' ? (
                                            <Text style={styles.endAt}>
                                              {Moment(
                                                new Date(
                                                  parseInt(item.endAt)
                                                ).toLocaleString('en-US', {
                                                  timeZone:
                                                    'America/Los_Angeles',
                                                })
                                              ).format('h:mm A on MM/DD/YYYY')}
                                            </Text>
                                          ) : (
                                            <Text style={styles.endAt}>
                                              {Moment(
                                                new Date(
                                                  parseInt(item.endAt)
                                                ).toLocaleString('en-US', {
                                                  timeZone:
                                                    'America/Los_Angeles',
                                                })
                                              ).format('hh:mm A on MM/DD/YYYY')}
                                            </Text>
                                          )}
                                        </React.Fragment>
                                      )}
                                    </View>
                                  </Card>
                                </TouchableOpacity>
                              ) : null}
                            </React.Fragment>
                          )}
                        />
                      </React.Fragment>
                    )}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={this.createEvent.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>New Event</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.openScheduler.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>
                            Schedule Assistant
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : (
                  <Card style={styles.resultsCard}>
                    <TouchableOpacity
                      onPress={this.chooseSquad.bind(this, 'My Schedule')}>
                      <Text
                        style={[
                          styles.info,
                          { fontSize: 20, textAlign: 'center' },
                        ]}>
                        My Schedule
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
  startAt: {
    fontSize: 12,
    paddingTop: 5,
    paddingLeft: 15,
    marginRight: 0,
    color: 'grey',
    textAlignVertical: 'center',
  },
  noEvents: {
    fontSize: 20,
    padding: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  endAt: {
    fontSize: 12,
    paddingTop: 5,
    paddingLeft: 2,
    color: 'grey',
    textAlignVertical: 'center',
  },
  squadOption: {
    marginTop: Dimensions.get('window').height * 0.02,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textAlignVertical: 'center',
    textDecorationLine: 'underline',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * 0.05,
  },
  listCard: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.1,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: Dimensions.get('window').height * 0.025,
    shadowOffset: { width: 7, height: 7 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
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
});
