import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#eee",
    paddingBottom: 30,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 10,
  },
  dayText: {
    fontSize: 12,
  },
  eventDayText: {
    fontSize: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
  eventText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  listStyle: {
    marginVertical: 10,
    maxHeight: 140,
  },
  imageContainer: {
    marginRight: 5,
    aspectRatio: 3 / 4,
    width: "100%",
    height: "100%",
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  textinput: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
  },
  map: {
    width: "100%",
    height: 200,
  },
});
export default styles;
