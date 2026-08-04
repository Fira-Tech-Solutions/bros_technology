import React from "react";
import { Image } from "react-native";

export default function DeviceIllustration({ width = 220, height = 160 }) {
  return (
    <Image
      source={require("../../assets/device-illustration.png")}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
