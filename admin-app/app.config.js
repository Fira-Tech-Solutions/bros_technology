export default {
  expo: {
    name: "BROS Technology",
    slug: "admin-app",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/bros_icon_concept4_monogram_clean.png",
    scheme: "brostechnology-admin",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/bros_splash_full_concept4.png",
      resizeMode: "contain",
      backgroundColor: "#1878B4",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.brostechnology.admin",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/bros_icon_concept4_monogram_clean.png",
        backgroundColor: "#1878B4",
      },
      package: "com.brostechnology.admin",
      permissions: ["android.permission.RECORD_AUDIO"],
      jsEngine: "hermes",
    },
    web: {
      favicon: "./assets/bros_icon_concept4_monogram_clean.png",
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "Allow access to photos for listing images",
          cameraPermission: "Allow access to camera for taking listing photos",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#1878B4",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "d706b125-4daf-4c2c-860a-537b89af730a",
      },
    },
    owner: "codearchitect001",
    env: {
      EXPO_PUBLIC_API_URL: "https://api.broslaptop.com",
    },
  },
};
