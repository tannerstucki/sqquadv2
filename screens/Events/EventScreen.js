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
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import { CheckBox } from 'react-native-elements';
import Moment from 'moment';
import NavigationService from '../../navigation/NavigationService';

export default class EventScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('eventName', 'Event'),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      curevent: '',
      users: ['intitialize'],
      showDetailsCard: false,
      showResultsCard: false,
      checked: '',
      statuses: ['To Do', 'In Progress', 'Need Help', 'Done'],
      cursquad: '',
      curdate: '',
      showRsvpCard: false,
      showCheckInCard: false,
      showStatusCard: false,
      selected_user: [
        '0',
        {
          user_id: 'initialize',
          user_name: 'initialize',
          status: 'initialize',
        },
      ],
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curevent = params.curevent;
    const users = Object.entries(curevent.users);
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
      curevent: curevent,
      users: users,
      selected_user: selected_user,
      curdate: new Date(),
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    if (curevent.squad_id !== 'null') {
      var squad_ref = firebase.database().ref('squads/' + curevent.squad_id);
      squad_ref.on('value', snapshot => {
        this.setState({ cursquad: snapshot.val() });
      });
    }

    this.setState({ loading: false });
  }

  switchRsvpCard() {
    if (this.state.showRsvpCard === true) {
      this.setState({
        showRsvpCard: false,
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
      this.setState({ showRsvpCard: true });
    }
  }

  switchCheckInCard() {
    if (this.state.showCheckInCard === true) {
      this.setState({
        showCheckInCard: false,
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
      this.setState({ showCheckInCard: true });
    }
  }

  onSubmit(rsvp) {
    var users = this.state.users;
    var index = users.findIndex(
      element => element[1].user_id === firebase.auth().currentUser.uid
    );
    var selected_user = this.state.users[index];
    if (selected_user[1].rsvp !== rsvp) {
      users[index][1].rsvp = rsvp;
      var eventUpdateData = {
        users: Object.fromEntries(users),
      };
      const rootRef = firebase.database().ref();
      const eventRef = rootRef.child('events/' + this.state.curevent.key);
      this.setState({ users: users });

      eventRef.update(eventUpdateData);
      alert('Your RSVP has been saved.');
    }
  }

  cancelStatusCard() {
    this.setState({
      showStatusCard: false,
      showRsvpCard: false,
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

  onCheckIn() {
    var users = this.state.users;
    if (JSON.stringify(users).includes(firebase.auth().currentUser.uid)) {
      var index = users.findIndex(
        element => element[1].user_id === firebase.auth().currentUser.uid
      );
      var selected_user = this.state.users[index];
      if (selected_user[1].checkedIn !== 'Yes') {
        users[index][1].checkedIn = 'Yes';
        var eventUpdateData = {
          users: Object.fromEntries(users),
        };
        const rootRef = firebase.database().ref();
        const eventRef = rootRef.child('events/' + this.state.curevent.key);
        console.log(eventUpdateData);
        this.setState({ users: users });

        eventRef.update(eventUpdateData);
        alert('You have checked in for this event.');
      } else {
        alert('You have already checked in for this event.');
      }
    } else {
      alert('Sorry, you can only check in for events that you are invited to.');
    }
  }

  onFailedCheckIn() {
    var users = this.state.users;
    if (JSON.stringify(users).includes(firebase.auth().currentUser.uid)) {
      alert(
        "This event isn't happening right now. Check in between this event's start time and end time."
      );
    } else {
      alert('Sorry, you can only check in for events that you are invited to.');
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
            {this.state.showRsvpCard === false &&
            this.state.showStatusCard === false &&
            this.state.showCheckInCard === false ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    {this.state.curevent.title}
                  </Text>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text style={styles.detailsInfo}>
                      {this.state.curevent.description}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Description</Text>
                    {Moment(
                      new Date(
                        parseInt(this.state.curevent.startAt)
                      ).toLocaleString('en-US', {
                        timeZone: 'America/Los_Angeles',
                      })
                    )
                      .format('hh:mm A')
                      .substring(0, 1) === '0' ? (
                      <Text style={styles.detailsInfo}>
                        {Moment(
                          new Date(
                            parseInt(this.state.curevent.startAt)
                          ).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })
                        ).format('h:mm A on MM/DD/YYYY')}
                      </Text>
                    ) : (
                      <Text style={styles.detailsInfo}>
                        {Moment(
                          new Date(
                            parseInt(this.state.curevent.startAt)
                          ).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })
                        ).format('hh:mm A on MM/DD/YYYY')}
                      </Text>
                    )}
                    <View style={styles.line} />
                    <Text style={styles.generic}>Starts At</Text>
                    {Moment(
                      new Date(
                        parseInt(this.state.curevent.endAt)
                      ).toLocaleString('en-US', {
                        timeZone: 'America/Los_Angeles',
                      })
                    )
                      .format('hh:mm A')
                      .substring(0, 1) === '0' ? (
                      <Text style={styles.detailsInfo}>
                        {Moment(
                          new Date(
                            parseInt(this.state.curevent.endAt)
                          ).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })
                        ).format('h:mm A on MM/DD/YYYY')}
                      </Text>
                    ) : (
                      <Text style={styles.detailsInfo}>
                        {Moment(
                          new Date(
                            parseInt(this.state.curevent.endAt)
                          ).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })
                        ).format('hh:mm A on MM/DD/YYYY')}
                      </Text>
                    )}
                    <View style={styles.line} />
                    <Text style={styles.generic}>Ends At</Text>
                    <Text style={styles.detailsInfo}>
                      {this.state.curevent.creator_name}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Creator</Text>
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
                        <Text style={styles.detailsInfo}>Personal Event</Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>
                          Only you can see this event
                        </Text>
                      </React.Fragment>
                    )}
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  {this.state.curdate > this.state.curevent.startAt &&
                  this.state.curdate < this.state.curevent.endAt ? (
                    <TouchableOpacity onPress={this.onCheckIn.bind(this)}>
                      <View style={styles.customButton}>
                        <Text style={styles.buttonText}>Check In</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <React.Fragment>
                      {this.state.curdate > this.state.curevent.endAt &&
                      (this.state.cursquad.organizer_id ===
                        firebase.auth().currentUser.uid ||
                        this.state.curevent.creator_id ===
                          firebase.auth().currentUser.uid) ? (
                        <TouchableOpacity
                          onPress={this.switchCheckInCard.bind(this)}>
                          <View style={styles.customButton}>
                            <Text style={[styles.buttonText]}>
                              Checked In List
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={this.onFailedCheckIn.bind(this)}>
                          <View style={styles.customButton}>
                            <Text
                              style={[styles.buttonText, { color: 'grey' }]}>
                              Check In
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </React.Fragment>
                  )}
                  <TouchableOpacity onPress={this.switchRsvpCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>RSVP</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
            {this.state.showRsvpCard === true ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    {this.state.curevent.title}
                  </Text>
                  <View style={styles.line} />
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    {JSON.stringify(this.state.users).includes(
                      firebase.auth().currentUser.uid
                    ) ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignContent: 'center',
                          textAlign: 'center',
                          alignSelf: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={this.onSubmit.bind(this, 'Yes')}>
                          <Text style={styles.info}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.onSubmit.bind(this, 'No')}>
                          <Text style={styles.info}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.onSubmit.bind(this, 'Maybe')}>
                          <Text style={styles.info}>Maybe</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.info}>
                        Sorry, you can only RVSP for events that you are invited
                        to.
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.info,
                        {
                          marginBottom: Dimensions.get('window').height * 0.01,
                        },
                      ]}>
                      All Invitees
                    </Text>
                    <View style={styles.line} />
                    <FlatList
                      style={{
                        padding: 10,
                        textAlign: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                      }}
                      data={this.state.users}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View
                              style={{
                                flexDirection: 'column',
                              }}>
                              <Text style={styles.assigneesInfo}>
                                {item[1].rsvp}
                              </Text>
                              <View style={styles.radioLine} />
                              <Text style={styles.assigneesGeneric}>
                                {item[1].user_name}
                              </Text>
                            </View>
                          </View>
                        </React.Fragment>
                      )}
                    />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={this.switchRsvpCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Close RSVP</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : null}
            {this.state.showCheckInCard === true ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    Checked in for {this.state.curevent.title}
                  </Text>
                  <View style={styles.line} />
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <FlatList
                      style={{
                        padding: 10,
                        textAlign: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                      }}
                      data={this.state.users}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          {item[1].checkedIn === 'Yes' ? (
                            <React.Fragment>
                              <Text style={styles.assigneesInfo}>
                                {item[1].user_name}
                              </Text>
                              <View style={styles.line} />
                            </React.Fragment>
                          ) : null}
                        </React.Fragment>
                      )}
                    />
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={this.switchCheckInCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Close List</Text>
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
