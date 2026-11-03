import { Component } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default class RootErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Quanti] launch error', error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    const message = this.state.error?.message
      ? String(this.state.error.message)
      : String(this.state.error);
    const stack = this.state.error?.stack ? String(this.state.error.stack) : '';
    return (
      <View style={styles.wrap}>
        <Text style={styles.kicker}>LAUNCH ERROR</Text>
        <Text style={styles.title}>Quanti hit a JavaScript exception.</Text>
        <ScrollView style={styles.scroll}>
          <Text selectable style={styles.body}>
            {message}
          </Text>
          {stack ? (
            <Text selectable style={styles.stack}>
              {stack}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#09090B',
    flex: 1,
    padding: 24,
    paddingTop: 72,
  },
  kicker: {
    color: '#FCD34D',
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: {
    color: '#F5F5F5',
    fontSize: 22,
    marginBottom: 16,
  },
  scroll: { flex: 1 },
  body: {
    color: '#F5F5F5',
    fontSize: 15,
    lineHeight: 22,
  },
  stack: {
    color: '#A3A3A3',
    fontSize: 11,
    marginTop: 16,
  },
});
