import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";

export default function SplashScreen({ onFinish }) {
  const timerRef = useRef(null);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    timerRef.current = setTimeout(() => {
      onFinish?.();
    }, 2200);

    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require("../../assets/bros_icon_concept4_monogram_clean.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}>
        <Text style={styles.brandName}>BROS</Text>
        <Text style={styles.brandSub}>TECHNOLOGY</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, { opacity: textOpacity }]}>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Admin Panel</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1878B4",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 8,
  },
  brandSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 6,
    marginTop: 4,
  },
  taglineContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
});
