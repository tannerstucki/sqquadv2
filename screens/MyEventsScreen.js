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
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import NavigationService from '../navigation/NavigationService';

export default class MyEventsScreen extends React.Component {
  static navigationOptions = {
    title: 'Schedule',
  };

  constructor(props) {
    super(props);
    this.state = {
      squads: [],
      events: [],
      noEvents: true,
      dateSelected: '',
      calendarShow: false,
      firstSelect: true,
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
              switchArray.unshift(
                (item: {
                  dots: [
                    {
                      key: 'marked',
                      color: 'blue',
                      selectedDotColor: 'white',
                    },
                  ],
                })
              );
              this.setState({ events: switchArray, noEvents: false });
            } else {
              switchArray.push(item);
              this.setState({ events: switchArray, noEvents: false });
            }
          });
      });
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
    });
  }

  onDayPress(day) {
    this.setState({
      selected: day.dateString,
    });
  }

  switchSquadOption() {
    console.log(this.state.dateSelected);
    console.log(Object.keys(this.state.dateSelected)[0]);
    console.log(new Date(Object.keys(this.state.dateSelected)));
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
                <TouchableOpacity onPress={this.switchSquadOption.bind(this)}>
                  <View>
                    <Text style={styles.squadOption}>My Events</Text>
                  </View>
                </TouchableOpacity>
                {this.state.calendarShow === true ? (
                  <React.Fragment>
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
                      style={{
                        width: Dimensions.get('window').width * 0.9,
                        borderRadius: 15,
                        marginTop: Dimensions.get('window').height * 0.025,
                        marginBottom: Dimensions.get('window').height * 0.025,
                        paddingBottom: Dimensions.get('window').height * 0.02,
                      }}
                      //markedDates={this.state.events}
                    />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <TouchableOpacity onPress={this.toggleCalendar.bind(this)}>
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
                              },
                            },
                            calendarShow: false,
                            firstSelect: false,
                          });
                        }}
                        calendarHeaderStyle={{ color: 'black' }}
                        calendarColor={'white'}
                        dateNameStyle={{ color: 'black', fontSize: 10 }}
                        highlightDateNameStyle={{
                          color: 'black',
                          fontSize: 10,
                        }}
                        dateNumberStyle={{ color: 'black', fontSize: 15 }}
                        highlightDateNumberStyle={{
                          color: 'black',
                          fontSize: 15,
                        }}
                        calendarHeaderStyle={{ color: 'black', fontSize: 15 }}
                        calendarHeaderContainerStyle={{ padding: 10 }}
                        iconStyle={{ width: 40, height: 40, marginBottom: 30 }}
                        daySelectionAnimation={{
                          type: 'background',
                          duration: 300,
                          highlightColor: '#D616CF',
                        }}
                        style={{
                          width: Dimensions.get('window').width * 0.9,
                          height:
                            Platform.OS === 'ios' || 'android'
                              ? Dimensions.get('window').height * 0.12
                              : Dimensions.get('window').height * 0.8,
                          marginTop: Dimensions.get('window').height * 0.025,
                          borderRadius: 15,
                        }}
                      />
                    </TouchableOpacity>
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
                            <TouchableOpacity>
                              <Card style={styles.listCard}>
                                <Text style={styles.info}>{item.title}</Text>
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
                                    ).format('h:mm A')}
                                  </Text>
                                ) : (
                                  <Text style={styles.startAt}>
                                    {Moment(
                                      new Date(
                                        parseInt(item.startAt)
                                      ).toLocaleString('en-US', {
                                        timeZone: 'America/Los_Angeles',
                                      })
                                    ).format('hh:mm A')}
                                  </Text>
                                )}
                              </Card>
                            </TouchableOpacity>
                          ) : null}
                        </React.Fragment>
                      )}
                    />
                  </React.Fragment>
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>New Event</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Find Time</Text>
                    </View>
                  </TouchableOpacity>
                </View>
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
    paddingHorizontal: 15,
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
    //marginBottom: Dimensions.get('window').height * -0.1,
    marginHorizontal: Dimensions.get('window').width * 0.05,
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
});
