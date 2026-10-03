import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/*
        translucent={true} avoids the deprecated Window.setStatusBarColor API
        that Google Play warns about. Bar tint is controlled via barStyle only.
        The SafeAreaView background colour provides the visual bar colour.
      */}
      <StatusBar
        translucent
        barStyle={statusBarStyle}
        backgroundColor="transparent"
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
