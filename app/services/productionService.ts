import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProductionStage = {
  name: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  efficiency: number;
  date: string;
  subEfficiencies?: {
    logo: number;
    pocket: number;
  };
  trend?: number[];
};

const STORAGE_KEY = 'production_stages';

export const productionService = {
  saveStages: async (stages: ProductionStage[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
    } catch (error) {
      console.error('Error saving production stages:', error);
      throw error;
    }
  },

  getStages: async (): Promise<ProductionStage[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading production stages:', error);
      throw error;
    }
  },

  clearStages: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing production stages:', error);
      throw error;
    }
  },
};