import React, { useEffect, useState, useRef } from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { cacheImage, getCachedUri } from "../utils/mediaCache";
import { useTheme } from "../context/ThemeContext";

export default function CachedImage({ uri, style, ...props }) {
  const { colors } = useTheme();
  const [localUri, setLocalUri] = useState(null);
  const [ready, setReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!uri) {
      if (mountedRef.current) {
        setLocalUri(null);
        setReady(false);
      }
      return;
    }
    if (uri.startsWith("file://") || uri.startsWith("data:")) {
      if (mountedRef.current) {
        setLocalUri(uri);
        setReady(true);
      }
      return;
    }

    let cancelled = false;

    getCachedUri(uri).then((cached) => {
      if (!cancelled && mountedRef.current) {
        setLocalUri(cached);
        setReady(true);
      }
    });

    cacheImage(uri).then((local) => {
      if (!cancelled && mountedRef.current && local !== localUri) {
        setLocalUri(local);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (!ready || !localUri) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: `${colors.textMuted}12`,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          },
        ]}
      >
        <ActivityIndicator size="small" color={`${colors.primary}60`} />
      </View>
    );
  }

  return <Image source={{ uri: localUri }} style={style} {...props} />;
}
