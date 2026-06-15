import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/Button";

const { height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageBackground
        source={require("../../assets/login-1.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {/* Top section - Logo top-left + text */}
            <View style={{ paddingHorizontal: 24, paddingTop: height * 0.08 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/android-chrome-192x192.png")}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                  }}
                  resizeMode="cover"
                />
                <View style={{ marginLeft: 14, flexShrink: 1 }}>
                  <Text
                    style={{
                      fontFamily: "serif",
                      fontStyle: "italic",
                      color: colors.primary,
                      fontSize: 24,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                    }}
                    numberOfLines={1}
                  >
                    Retailment
                  </Text>
                  <Text
                    style={{
                      fontFamily: "serif",
                      fontStyle: "italic",
                      color: `${colors.primary}b3`,
                      fontSize: 12,
                      letterSpacing: 3,
                      fontWeight: "500",
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    PREMIUM MARKETPLACE
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: "serif",
                  fontStyle: "italic",
                  color: "#000000",
                  fontSize: 14,
                  lineHeight: 20,
                  marginTop: 20,
                  letterSpacing: 0.6,
                  maxWidth: "80%",
                }}
                numberOfLines={2}
              >
                Curating exceptional properties for discerning clientele since
                2020.
              </Text>
            </View>

            {/* Sign In button */}
            <View style={{
                width: "100%",
                marginTop: "auto",
                paddingBottom: height * 0.1,
                paddingHorizontal: 16,
                borderRadius: 9999,
              }}
            >
              <Button
                title={t("loginButton")}
                onPress={() => navigation.navigate("Login")}
                size="lg"
                icon={ArrowRight}
                color={colors.primary}
                className="rounded-[100px]"
              />
              <TouchableOpacity
                onPress={() => Linking.openURL("https://firatech.systems")}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 11,
                    letterSpacing: 0.5,
                    marginTop: 20,
                  }}
                >
                  fira tech solutions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
