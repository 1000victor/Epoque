import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 40,
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayContainer: {
    overflow: "hidden",
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "column",
  },
  dayText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  eventText: {
    fontSize: 12,
    color: "#333",
  },
  weatherText: {
    color: "#555",
    fontSize: 12,
  },
});
export default styles;
