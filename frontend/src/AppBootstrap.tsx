/**
 * AppBootstrap.tsx
 *
 * Thin wrapper rendered once at the root of the app (inside App.tsx).
 * Responsibilities:
 *  1. Initialise the SQLite database (create tables if needed)
 *  2. Start the NetInfo sync listener (auto-push when reconnected)
 *  3. On first online open: pull latest Neon data into SQLite
 *
 * Renders nothing visible – just returns its children once ready.
 */

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { initDb } from "./services/db";
import { startSyncListener, pullFromNeon } from "./services/sync";
import NetInfo from "@react-native-community/netinfo";

interface Props {
  children: React.ReactNode;
}

export default function AppBootstrap({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // 1. Initialise SQLite (idempotent CREATE TABLE IF NOT EXISTS)
        await initDb();

        // 2. Start the network listener (pushes queue when back online)
        startSyncListener();

        // 3. Pull from Neon if we're online (best-effort, non-blocking)
        const state = await NetInfo.fetch();
        if (state.isConnected && state.isInternetReachable !== false) {
          // Fire-and-forget – don't block the app boot
          pullFromNeon().catch((e) =>
            console.warn("[bootstrap] initial pull failed:", e)
          );
        }
      } catch (err) {
        // DB init must never crash the app
        console.error("[bootstrap] initDb error:", err);
      } finally {
        if (mounted) setReady(true);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
      // We intentionally keep the sync listener running for the app's lifetime.
      // Call stopSyncListener() only when fully unmounting (e.g. during tests).
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FFF8" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return <>{children}</>;
}
