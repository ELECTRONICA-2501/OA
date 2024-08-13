import React, { useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { firebaseDatabase, firebaseDB } from "../firebase/firebase";
import { connect } from "react-redux";
import { update as updateAllCharactersData } from "./slices/allCharactersSlice";

function FirebaseListener({ updateAllCharactersData }) {
  //basically, this component will listen to the firebase database and update the state

  useEffect(() => {
    // useEffect is a hook that allows us to listen to the firebase database and update the state
    const usersRef = ref(firebaseDatabase, "users/");
    const unsubcribeUserListener = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      console.log("FirebaseListener data: ", data);
      updateAllCharactersData(data);
    });
    return unsubcribeUserListener;
  }, []);
  return null;
}
const mapDispatch = { updateAllCharactersData };
export default connect(null, mapDispatch)(FirebaseListener);
