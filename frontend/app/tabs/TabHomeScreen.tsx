import React, { useEffect, useState } from "react";
import httpHelper from "../utils/HttpHelper";
import { useAuth } from "../context/AuthContext";
import Golfers from '../../assets/Golfers.png'

import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TabHomeScreen = () => {
  const [friendActivity, setFriendActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { authState, refreshAuthToken } = useAuth();

  useEffect(() => {
    // Get the activity of friends
    const fetchActivity = async () => {
      setLoading(true)
      refreshAuthToken!();
      try {
        const currActivity = await httpHelper.get('/user/getActivity', authState!.token);
        console.log(currActivity);
        setFriendActivity(currActivity.activities);
      }
      catch (e) {
        console.log("Error: ", e)
      }
      finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  // Mock activity data
  const activities = [
    {
      id: 1,
      user: "Kevin S.",
      course: "Aburn Hills",
      date: "01/24/2024",
      score: "+1",
      holes: "18 holes",
    },
    {
      id: 2,
      user: "Mitchell S.",
      course: "Pete Dye River Course",
      date: "01/20/2024",
      score: "+16",
      holes: "18 holes",
    },
    {
      id: 3,
      user: "Mitchell S.",
      course: "Pete Dye River Course",
      date: "01/18/2024",
      score: "+16",
      holes: "18 holes",
    },
    {
      id: 4,
      user: "Mitchell S.",
      course: "Pete Dye River Course",
      date: "01/01/2024",
      score: "-4",
      holes: "18 holes",
    },
  ];

  return (
    <View style={styles.container}>
      <Modal visible={loading} animationType="fade" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <ActivityIndicator size="small" color="#434371" />
            <Text style={{ marginTop: 10 }}>Loading Data...</Text>
            </View>
        </View>
      </Modal>
      
      {activities.length === 0 ? 
        (
          <View style={{ flex: 1, alignItems: 'center'}}>
            <Image source={Golfers} style={{height: 400, width: 400,}}>
            </Image>
            <Text style={styles.emptyText}>Nothing here yet — Everyone must be on the 19th hole?</Text>
              <Text style={styles.emptyText}>Come back once someone plays a game!</Text>
          </View>
        ) 
        : 
        (
          <ScrollView style={styles.scrollView}>
            <Text style={styles.headerTitle}>Activity</Text>
            {friendActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarInitial}>
                      {activity.user.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{activity.user}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{activity.course}</Text>
                  <View style={styles.courseDetails}>
                    <Text style={styles.courseDate}>{activity.date}</Text>
                    <Text style={styles.courseHoles}>{activity.holes}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.score,
                    activity.score.toString().includes("-")
                      ? styles.negativeScore
                      : styles.positiveScore,
                  ]}
                >
                  {activity.score}
                </Text>
              </View>

              {/* <View style={styles.commentContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#999"
                />
              </View> */}
            </View>
          ))}
          </ScrollView>
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    color: "#333"
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#434371",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarInitial: {
    color: "white",
    fontWeight: "bold",
  },
  userName: {
    fontWeight: "500",
  },
  courseInfo: {
    flex: 1,
    marginLeft: 8,
  },
  courseName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  courseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  courseDate: {
    fontSize: 12,
    color: "#666",
  },
  courseHoles: {
    fontSize: 12,
    color: "#666",
  },
  scoreContainer: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
  },
  positiveScore: {
    color: "#000",
  },
  negativeScore: {
    color: "#000",
  },
  commentContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
  commentInput: {
    fontSize: 14,
    color: "#333",
  },
});

export default TabHomeScreen;
