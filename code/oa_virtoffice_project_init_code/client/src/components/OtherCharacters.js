import React from "react";
import OtherCharacter from "./OtherCharacter";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";

function OtherCharacters({ otherCharactersData }) {
  return (
    <>
      {" "}
      {Object.keys(otherCharactersData).map((id) => (
        <OtherCharacter
          key={id}
          name={otherCharactersData[id]["username"]}
          x={otherCharactersData[id]["position"]["x"]}
          y={otherCharactersData[id]["position"]["y"]}
          characterClass={otherCharactersData[id]["characterClass"]}
        />
      ))}{" "}
    </>
  );
}
const mapStateToProps = (state) => {
  const otherCharactersData = Object.keys(state.allCharacters.users)
    .filter((id) => id != MY_CHARACTER_INIT_CONFIG.id)
    .reduce((filteredObj, key) => {
      filteredObj[key] = state.allCharacters.users[key];
      return filteredObj;
    }, {});
  return { otherCharactersData: otherCharactersData };
};
export default connect(mapStateToProps, {})(OtherCharacters);
