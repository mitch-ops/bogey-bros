import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
//friend
type Friend = {
  id: string;
  name: string;
  avatar: string;
  handicap: number;
};

//course
type Course = {
  id: string;
  name: string;
};

const PlayPage = () => {
  const [betEnabled, setBetEnabled] = useState(true);
  const [selectedMode, setSelectedMode] = useState('Strokeplay');
  const [stake, setStake] = useState(7);
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // course api address need be added
  const COURSE_API_URL = 'https://course api';

  // friend api address need be added
  const FRIENDS_API_URL = 'https://friend api';

  // token need be added
  const AUTH_TOKEN = 'token';

  useEffect(() => {
    const mockCourses = [
      { id: '1', name: 'Pebble Beach' },
      { id: '2', name: 'Augusta National' },
      { id: '3', name: 'St Andrews' },
    ];
    setCourses(mockCourses);
    setLoadingCourses(false);
  }, []);

  useEffect(() => {
    
    const mockFriends = [
      {
        id: '1',
        name: 'Mitchell Heidbrink',
        avatar: 'https://i.pravatar.cc/100?img=1',
        handicap: 23.2,
      },
      {
        id: '2',
        name: 'Jess Smith',
        avatar: 'https://i.pravatar.cc/100?img=2',
        handicap: 18.4,
      },
    ];
    setFriends(mockFriends);
    setLoadingFriends(false);
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>

      {/* Bet Toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: '#eee', borderRadius: 30, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => setBetEnabled(false)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 30,
            backgroundColor: !betEnabled ? '#494373' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: !betEnabled ? 'white' : 'black' }}>No bet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setBetEnabled(true)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 30,
            backgroundColor: betEnabled ? '#494373' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: betEnabled ? 'white' : 'black' }}>Bet</Text>
        </TouchableOpacity>
      </View>

      {/* Select Mode */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Select Mode</Text>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        marginVertical: 10,
        }}>
          {['Strokeplay', 'Matchplay', 'Skin', 'Wolf'].map((mode) => (
            <TouchableOpacity
            key={mode}
            onPress={() => setSelectedMode(mode)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: selectedMode === mode ? '#494373' : '#ddd',
              margin: 4, 
              }}
            >
              <Text style={{ color: selectedMode === mode ? 'white' : 'black' }}>{mode}</Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* Stake */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Stake</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity onPress={() => setStake(Math.max(1, stake - 1))} style={{ padding: 10 }}>
          <Text style={{ fontSize: 18 }}>−</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, marginHorizontal: 10 }}>${stake}</Text>
        <TouchableOpacity onPress={() => setStake(stake + 1)} style={{ padding: 10 }}>
          <Text style={{ fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Select Course */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Select Course</Text>
      {loadingCourses ? (
        <ActivityIndicator size="small" color="#494373" />
      ) : (
        <View style={{ marginVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}>
          <TextInput
            placeholder="Find a Course..."
            value={course}
            onChangeText={setCourse}
            style={{ height: 40 }}
          />
          {course.length > 0 &&
            courses
              .filter((c) => c.name.toLowerCase().includes(course.toLowerCase()))
              .map((c) => (
                <TouchableOpacity key={c.id} onPress={() => setCourse(c.name)}>
                  <Text style={{ paddingVertical: 4 }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
        </View>
      )}

      {/* Add Friends */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add Friends</Text>

      {loadingFriends ? (
        <ActivityIndicator size="large" color="#494373" style={{ marginTop: 20 }} />
      ) : (
        friends.map((friend) => (
          <View
            key={friend.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              backgroundColor: '#eee',
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Image source={{ uri: friend.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
            <View>
              <Text>{friend.name}</Text>
              <Text style={{ color: '#555' }}>Handicap {friend.handicap}</Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Text style={{ fontSize: 24, marginRight: 8 }}>＋</Text>
        <Text style={{ color: '#555' }}>Add Friend...</Text>
      </TouchableOpacity>

      {/* Begin Round Button */}
      <TouchableOpacity
        style={{
          marginTop: 30,
          backgroundColor: '#494373',
          padding: 16,
          borderRadius: 30,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        onPress={() => console.log('Begin Round!')}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Begin Round!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PlayPage;
