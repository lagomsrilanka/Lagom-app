import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Card, Text, Button, TextInput, useTheme, Divider, TouchableRipple, Surface, ProgressBar, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Line } from 'react-chartjs-2';
import { productionService } from '../services/productionService';
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

type ProductionStage = {
  name: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  efficiency: number;
  date: string;
  subEfficiencies?: {
    logo: number;
    pocket: number;
  };
};

const INITIAL_STAGES: ProductionStage[] = [
  { 
    name: 'Cutting', 
    inputs: { cottonCloth: 0 }, 
    outputs: { bagBelts: 0, bagCutPieces: 0, pocketCutPieces: 0 }, 
    efficiency: 0,
    date: new Date().toISOString().split('T')[0]
  },
  { 
    name: 'Embroidery', 
    inputs: { logo: 0, pocket: 0 }, 
    outputs: { logo: 0, pocket: 0 }, 
    efficiency: 0,
    date: new Date().toISOString().split('T')[0],
    subEfficiencies: {
      logo: 0,
      pocket: 0
    }
  },
  { 
    name: 'Sewing', 
    inputs: { total: 0 }, 
    outputs: { total: 0 }, 
    efficiency: 0,
    date: new Date().toISOString().split('T')[0]
  },
  { 
    name: 'Washing', 
    inputs: { total: 0 }, 
    outputs: { total: 0 }, 
    efficiency: 0,
    date: new Date().toISOString().split('T')[0]
  },
  { 
    name: 'Packing', 
    inputs: { total: 0 }, 
    outputs: { total: 0 }, 
    efficiency: 0,
    date: new Date().toISOString().split('T')[0]
  },
];

const renderDateInput = (stage: ProductionStage, index: number, handleDateChange: (index: number, date: string) => void) => (
  <Surface style={styles.dateInputContainer}>
    <View style={styles.dateInputContent}>
      <View style={styles.dateInputLeft}>
        <Text variant="titleMedium" style={styles.dateLabel}>Production Date</Text>
        <Text variant="bodySmall" style={styles.dateHelper}>Record date for {stage.name.toLowerCase()} stage</Text>
      </View>
      <View style={styles.dateInputRight}>
        <TextInput
          mode="outlined"
          value={stage.date}
          onChangeText={(value) => handleDateChange(index, value)}
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          right={<TextInput.Icon icon="calendar" />}
          {...(Platform.OS === 'web' ? { type: 'date' } : {})}
        />
      </View>
    </View>
  </Surface>
);

export default function Production() {
  const theme = useTheme();
  const [stages, setStages] = useState<ProductionStage[]>(INITIAL_STAGES);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const savedStages = await productionService.getStages();
        if (savedStages.length > 0) {
          setStages(savedStages);
        }
      } catch (error) {
        console.error('Error loading stages:', error);
      }
    };
    loadStages();
  }, []);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const handleInputChange = (index: number, type: string, value: string) => {
    const newStages = [...stages];
    const numValue = parseInt(value) || 0;
    const stage = newStages[index];
    
    stage.inputs[type] = numValue;

    if (stage.name === 'Cutting') {
      const totalOutputPieces = (stage.outputs.bagBelts / 2) +
                               stage.outputs.bagCutPieces +
                               stage.outputs.pocketCutPieces;
      const expectedPieces = stage.inputs.cottonCloth * 2;
      stage.efficiency = expectedPieces > 0 ? (totalOutputPieces / expectedPieces) * 100 : 0;
    } else if (stage.name === 'Embroidery') {
      const logoEfficiency = stage.inputs.logo > 0 ? (stage.outputs.logo / stage.inputs.logo) * 100 : 0;
      const pocketEfficiency = stage.inputs.pocket > 0 ? (stage.outputs.pocket / stage.inputs.pocket) * 100 : 0;
      
      stage.subEfficiencies = {
        logo: logoEfficiency,
        pocket: pocketEfficiency
      };
      
      stage.efficiency = (logoEfficiency + pocketEfficiency) / 2;
    } else {
      stage.efficiency = stage.inputs.total > 0 ? (stage.outputs.total / stage.inputs.total) * 100 : 0;
    }

    setStages(newStages);
  };

  const handleOutputChange = (index: number, type: string, value: string) => {
    const newStages = [...stages];
    const numValue = parseInt(value) || 0;
    const stage = newStages[index];
    
    stage.outputs[type] = numValue;

    if (stage.name === 'Cutting') {
      const totalOutputPieces = (stage.outputs.bagBelts / 2) +
                               stage.outputs.bagCutPieces +
                               stage.outputs.pocketCutPieces;
      const expectedPieces = stage.inputs.cottonCloth * 2;
      stage.efficiency = expectedPieces > 0 ? (totalOutputPieces / expectedPieces) * 100 : 0;
    } else if (stage.name === 'Embroidery') {
      const logoEfficiency = stage.inputs.logo > 0 ? (stage.outputs.logo / stage.inputs.logo) * 100 : 0;
      const pocketEfficiency = stage.inputs.pocket > 0 ? (stage.outputs.pocket / stage.inputs.pocket) * 100 : 0;
      
      stage.subEfficiencies = {
        logo: logoEfficiency,
        pocket: pocketEfficiency
      };
      
      stage.efficiency = (logoEfficiency + pocketEfficiency) / 2;
    } else {
      stage.efficiency = stage.inputs.total > 0 ? (stage.outputs.total / stage.inputs.total) * 100 : 0;
    }

    setStages(newStages);
  };

  const handleDateChange = (index: number, date: string) => {
    const newStages = [...stages];
    newStages[index].date = date;
    setStages(newStages);
  };

  const handleSubmit = async (index: number, embroideryType?: 'logo' | 'pocket') => {
    try {
      const currentStage = stages[index];
      
      // Special handling for Embroidery stage
      if (currentStage.name === 'Embroidery') {
        if (embroideryType === 'logo') {
          const logoStage = {
            ...currentStage,
            name: 'Logo Embroidery',
            inputs: { total: currentStage.inputs.logo },
            outputs: { total: currentStage.outputs.logo },
            efficiency: currentStage.subEfficiencies?.logo || 0
          };
          await productionService.saveStages([logoStage]);
        } else if (embroideryType === 'pocket') {
          const pocketStage = {
            ...currentStage,
            name: 'Pocket Embroidery',
            inputs: { total: currentStage.inputs.pocket },
            outputs: { total: currentStage.outputs.pocket },
            efficiency: currentStage.subEfficiencies?.pocket || 0
          };
          await productionService.saveStages([pocketStage]);
        } else {
          const logoStage = {
            ...currentStage,
            name: 'Logo Embroidery',
            inputs: { total: currentStage.inputs.logo },
            outputs: { total: currentStage.outputs.logo },
            efficiency: currentStage.subEfficiencies?.logo || 0
          };
          
          const pocketStage = {
            ...currentStage,
            name: 'Pocket Embroidery',
            inputs: { total: currentStage.inputs.pocket },
            outputs: { total: currentStage.outputs.pocket },
            efficiency: currentStage.subEfficiencies?.pocket || 0
          };
          
          const updatedStages = stages.map((stage, i) => {
            if (i === index) {
              return [logoStage, pocketStage];
            }
            return [stage];
          }).flat();
          
          await productionService.saveStages(updatedStages);
        }
      } else {
        await productionService.saveStages(stages);
      }
      
      setExpandedStage(currentStage.name);
    } catch (error) {
      console.error('Error saving stage:', error);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return theme.colors.primary;
    if (efficiency >= 70) return theme.colors.warning || '#f59e0b';
    return theme.colors.error;
  };

  const renderTrendChart = (stage: ProductionStage) => {
    if (!stage.trend || Platform.OS !== 'web') return null;

    const chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [
        {
          label: 'Efficiency Trend',
          data: stage.trend,
          borderColor: theme.colors.primary,
          backgroundColor: `${theme.colors.primary}20`,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
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

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>Weekly Efficiency Trend</Text>
        <Line data={chartData} options={chartOptions} style={styles.chart} />
      </View>
    );
  };

  const renderInputFields = (stage: ProductionStage, index: number) => {
    if (stage.name === 'Cutting') {
      return (
        <View style={styles.cuttingContainer}>
          {renderDateInput(stage, index, handleDateChange)}
          
          <Surface style={styles.surfaceContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Input Materials</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Cotton Cloth (meters)</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.inputs.cottonCloth.toString()}
                  onChangeText={(value) => handleInputChange(index, 'cottonCloth', value)}
                  style={styles.input}
                />
              </View>
            </View>
          </Surface>

          <Surface style={[styles.surfaceContainer, { marginTop: 16 }]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Output Products</Text>
            <View style={styles.outputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Bag Belts</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.outputs.bagBelts.toString()}
                  onChangeText={(value) => handleOutputChange(index, 'bagBelts', value)}
                  style={styles.input}
                />
                <Text variant="bodySmall" style={styles.helperText}>2 belts per bag</Text>
              </View>
            </View>

            <View style={styles.outputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Bag Cut Pieces</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.outputs.bagCutPieces.toString()}
                  onChangeText={(value) => handleOutputChange(index, 'bagCutPieces', value)}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.outputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Pocket Cut Pieces</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.outputs.pocketCutPieces.toString()}
                  onChangeText={(value) => handleOutputChange(index, 'pocketCutPieces', value)}
                  style={styles.input}
                />
              </View>
            </View>
          </Surface>
        </View>
      );
    } else if (stage.name === 'Embroidery') {
      return (
        <View style={styles.embroideryContainer}>
          {renderDateInput(stage, index, handleDateChange)}
          
          <Surface style={styles.surfaceContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Logo Embroidery</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Input Quantity</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.inputs.logo.toString()}
                  onChangeText={(value) => handleInputChange(index, 'logo', value)}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Output Quantity</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.outputs.logo.toString()}
                  onChangeText={(value) => handleOutputChange(index, 'logo', value)}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.metricsContainer}>
              <Surface style={styles.metricCard}>
                <Text variant="bodyMedium">Efficiency</Text>
                <Text variant="headlineMedium" style={{
                  color: getEfficiencyColor(stage.subEfficiencies?.logo ?? 0)
                }}>
                  {stage.subEfficiencies?.logo.toFixed(1)}%
                </Text>
              </Surface>
              <Surface style={styles.metricCard}>
                <Text variant="bodyMedium">Material Loss</Text>
                <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
                  {stage.inputs.logo - stage.outputs.logo}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>pieces</Text>
              </Surface>
            </View>
            <Button
              mode="contained"
              onPress={() => handleSubmit(index, 'logo')}
              style={styles.button}
              icon="content-save">
              Save Logo Embroidery Data
            </Button>
          </Surface>

          <Surface style={[styles.surfaceContainer, { marginTop: 16 }]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Pocket Embroidery</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Input Quantity</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.inputs.pocket.toString()}
                  onChangeText={(value) => handleInputChange(index, 'pocket', value)}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text variant="bodyMedium">Output Quantity</Text>
                <TextInput
                  mode="outlined"
                  inputMode="decimal"
                  value={stage.outputs.pocket.toString()}
                  onChangeText={(value) => handleOutputChange(index, 'pocket', value)}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.metricsContainer}>
              <Surface style={styles.metricCard}>
                <Text variant="bodyMedium">Efficiency</Text>
                <Text variant="headlineMedium" style={{
                  color: getEfficiencyColor(stage.subEfficiencies?.pocket ?? 0)
                }}>
                  {stage.subEfficiencies?.pocket.toFixed(1)}%
                </Text>
              </Surface>
              <Surface style={styles.metricCard}>
                <Text variant="bodyMedium">Material Loss</Text>
                <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
                  {stage.inputs.pocket - stage.outputs.pocket}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>pieces</Text>
              </Surface>
            </View>
            <Button
              mode="contained"
              onPress={() => handleSubmit(index, 'pocket')}
              style={styles.button}
              icon="content-save">
              Save Pocket Embroidery Data
            </Button>
          </Surface>
        </View>
      );
    }

    return (
      <Surface style={styles.surfaceContainer}>
        {renderDateInput(stage, index, handleDateChange)}
        
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium">Input Quantity</Text>
            <TextInput
              mode="outlined"
              inputMode="decimal"
              value={stage.inputs.total.toString()}
              onChangeText={(value) => handleInputChange(index, 'total', value)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium">Output Quantity</Text>
            <TextInput
              mode="outlined"
              inputMode="decimal"
              value={stage.outputs.total.toString()}
              onChangeText={(value) => handleOutputChange(index, 'total', value)}
              style={styles.input}
            />
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineMedium" style={styles.title}>Production Tracking</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Track production progress across different stages
            </Text>
          </View>
          <IconButton
            icon="refresh"
            mode="contained"
            onPress={async () => {
              try {
                const savedStages = await productionService.getStages();
                if (savedStages.length > 0) {
                  setStages(savedStages);
                }
              } catch (error) {
                console.error('Error refreshing data:', error);
              }
            }}
          />
        </View>
      </Surface>

      {stages.map((stage, index) => (
        <Card 
          key={stage.name} 
          style={styles.card}
          mode="elevated"
        >
          <TouchableRipple
            onPress={(event) => {
              // Prevent collapsing if clicking on input fields
              const target = event.target as HTMLElement;
              if (target.tagName === 'INPUT' || target.closest('input')) {
                return;
              }
              setExpandedStage(expandedStage === stage.name ? null : stage.name);
            }}
            style={{ borderRadius: theme.roundness }}>
            <Card.Content>
              <View style={styles.stageHeader}>
                <View style={styles.stageHeaderLeft}>
                  <Text variant="titleLarge" style={styles.stageName}>{stage.name}</Text>
                  <ProgressBar 
                    progress={stage.efficiency / 100} 
                    color={getEfficiencyColor(stage.efficiency)}
                    style={styles.progressBar} 
                  />
                </View>
                <View style={styles.stageHeaderRight}>
                  <Text 
                    variant="headlineSmall" 
                    style={{ color: getEfficiencyColor(stage.efficiency) }}
                  >
                    {stage.efficiency.toFixed(1)}%
                  </Text>
                  <IconButton
                    icon={expandedStage === stage.name ? 'chevron-up' : 'chevron-down'}
                    size={24}
                  />
                </View>
              </View>

              {expandedStage === stage.name && (
                <>
                  {renderInputFields(stage, index)}
                  
                  {stage.name === 'Embroidery' ? null : (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                          <Text variant="bodyMedium">Material Loss</Text>
                          <Text variant="headlineSmall" style={{
                            color: theme.colors.error
                          }}>
                            {stage.name === 'Cutting'
                              ? `${(stage.inputs.cottonCloth -
                                  ((stage.outputs.bagBelts / 2 + stage.outputs.bagCutPieces + stage.outputs.pocketCutPieces) / 2)
                                ).toFixed(1)}m`
                              : (stage.inputs.total - stage.outputs.total)}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}

                  {stage.name === 'Embroidery' ? null : (
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit(index)}
                      style={styles.button}
                      icon="content-save">
                      Save {stage.name} Data
                    </Button>
                  )}
                </>
              )}
            </Card.Content>
          </TouchableRipple>
        </Card>
      ))}
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
      },
      default: {
        padding: 16,
      },
    }),
  },
  header: {
    marginBottom: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        marginHorizontal: 4,
      },
    }),
  },
  headerContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        marginHorizontal: 4,
      },
    }),
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageName: {
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  surfaceContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        flexDirection: 'column',
      },
      default: {
        flexDirection: 'row',
      },
    }),
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        marginRight: 0,
      },
      default: {
        marginRight: 16,
      },
    }),
  },
  input: {
    marginTop: 8,
  },
  helperText: {
    marginTop: 4,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
  },
  chartContainer: {
    marginTop: 16,
    height: 200,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  chart: {
    flex: 1,
  },
  dateInputContainer: {
    marginBottom: 16,
    borderRadius: 8,
  },
  dateInputContent: {
    padding: 16,
    ...Platform.select({
      ios: {
        flexDirection: 'column',
      },
      default: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    }),
  },
  dateInputLeft: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  dateInputRight: {
    ...Platform.select({
      ios: {
        width: '100%',
      },
      default: {
        width: 200,
      },
    }),
  },
  dateInput: {
    backgroundColor: 'transparent',
  },
  dateLabel: {
    fontWeight: '600',
  },
  dateHelper: {
    opacity: 0.7,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageName: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  surfaceContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  dateContainer: {
    marginBottom: 16,
  },
  cuttingContainer: {
    marginTop: 16,
  },
  embroideryContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#666',
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    marginTop: 4,
  },
  helperText: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
  efficiencyIndicator: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  chartContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  chartTitle: {
    marginBottom: 16,
    color: '#666',
  },
  chart: {
    height: 200,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  dateInputContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputLeft: {
    flex: 1,
    marginRight: 16,
  },
  dateInputRight: {
    width: '40%',
  },
  dateLabel: {
    color: '#1f2937',
    fontWeight: '600',
  },
  dateHelper: {
    color: '#6b7280',
    marginTop: 4,
  },
  dateInput: {
    backgroundColor: '#fff',
  },
});