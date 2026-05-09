import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../constants/theme';

export default function Index() {
  const { isLoading, activeMember } = useAppStore();

  useEffect(() => {
    if (!isLoading) {
      if (activeMember) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)');
      }
    }
  }, [isLoading, activeMember]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
