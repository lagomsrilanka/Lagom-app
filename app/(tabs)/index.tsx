import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const theme = useTheme();

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Production',
        data: [20, 45, 28, 80, 99],
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.colors.outlineVariant,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const WebChart = Platform.select({
    web: () => (
      <Line data={chartData} options={chartOptions} style={styles.chart} />
    ),
    default: () => (
      <View style={styles.chartPlaceholder}>
        <Text variant="bodyMedium">Chart not available on mobile</Text>
      </View>
    ),
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium">Raw Material</Text>
            <Text variant="displaySmall">2,450m</Text>
            <Text variant="bodySmall">Cotton Cloth Available</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium">Production</Text>
            <Text variant="displaySmall">847</Text>
            <Text variant="bodySmall">Bags in Progress</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium">Completed</Text>
            <Text variant="displaySmall">1,232</Text>
            <Text variant="bodySmall">Ready for Dispatch</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.productionCard}>
        <Card.Content>
          <Text variant="titleLarge">Production Progress</Text>
          <View style={styles.progressSection}>
            <Text variant="bodyMedium">Cutting</Text>
            <ProgressBar progress={0.8} style={styles.progressBar} />
            <Text variant="bodySmall">80% Complete</Text>
          </View>
          <View style={styles.progressSection}>
            <Text variant="bodyMedium">Embroidery</Text>
            <ProgressBar progress={0.6} style={styles.progressBar} />
            <Text variant="bodySmall">60% Complete</Text>
          </View>
          <View style={styles.progressSection}>
            <Text variant="bodyMedium">Sewing</Text>
            <ProgressBar progress={0.4} style={styles.progressBar} />
            <Text variant="bodySmall">40% Complete</Text>
          </View>
          <View style={styles.progressSection}>
            <Text variant="bodyMedium">Washing</Text>
            <ProgressBar progress={0.3} style={styles.progressBar} />
            <Text variant="bodySmall">30% Complete</Text>
          </View>
          <View style={styles.progressSection}>
            <Text variant="bodyMedium">Packing</Text>
            <ProgressBar progress={0.2} style={styles.progressBar} />
            <Text variant="bodySmall">20% Complete</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleLarge">Weekly Production</Text>
          {WebChart && <WebChart />}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      ios: {
        paddingHorizontal: 12,
        paddingVertical: 16,
      },
      default: {
        padding: 16,
      },
    }),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
    ...Platform.select({
      ios: {
        marginHorizontal: 4,
      },
    }),
  },
  statsCard: {
    flex: 1,
    minWidth: Platform.OS === 'ios' ? '100%' : 250,
    marginBottom: 0,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  productionCard: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        marginHorizontal: 4,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  progressSection: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  chartCard: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        marginHorizontal: 4,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  chart: {
    marginTop: 16,
    borderRadius: 16,
    height: 220,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginTop: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  statsCard: {
    flex: 1,
    minWidth: 250,
    marginBottom: 0,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  productionCard: {
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  progressSection: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  chartCard: {
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  chart: {
    marginTop: 16,
    borderRadius: 16,
    height: 220,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginTop: 16,
  },
});