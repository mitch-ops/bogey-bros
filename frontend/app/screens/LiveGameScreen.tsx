import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const LiveGameScreen = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.topSection}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Live Game</Text>
            <Text style={styles.holeText}>13</Text>
          </View>

          <Text style={styles.subheading}>Thru 12</Text>

          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.cell}>Player</Text>
            <Text style={styles.cell}>Score</Text>
            <Text style={styles.cell}>Total</Text>
            <Text style={styles.cell}>Net $</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>You</Text>
            <Text style={styles.cell}>3</Text>
            <Text style={styles.cell}>E</Text>
            <Text style={styles.cell}>+$7</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>Jess</Text>
            <Text style={styles.cell}>5</Text>
            <Text style={styles.cell}>+3</Text>
            <Text style={styles.cell}>-$3.50</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>John</Text>
            <Text style={styles.cell}>4</Text>
            <Text style={styles.cell}>+1</Text>
            <Text style={styles.cell}>-$3.50</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Scorecard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.activeButton]}>
            <Text style={[styles.buttonText, styles.activeButtonText]}>
              Enter Score
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Next Hole</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LiveGameScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between", 
  },
  topSection: {
    marginTop: 40,
  },
  header: {
    backgroundColor: "#5C4DB1",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  holeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 8,
  },
  tableHeader: {
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: "#5C4DB1",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  activeButtonText: {
    color: "#fff",
  },
});
