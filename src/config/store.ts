import create from 'zustand';
import { ConfigType } from '../types/config';

export const useConfigStore = create<UseConfigStoreType>((set, get) => ({
  configs: [],
  initConfig: (name, config, increaseVersion) => {
    set((old) => ({
      ...old,
      configs: [
        ...old.configs.filter((x) => x.value.configProperties?.name !== name),
        { increaseVersion, value: config },
      ],
    }));
  },
  updateConfig: async (
    name,
    updateCallback: (previous: ConfigType) => ConfigType,
    shouldRegenerateGridstack = false
  ) => {
    const { configs } = get();
    const currentConfig = configs.find((x) => x.value.configProperties.name === name);
    if (!currentConfig) return;
    // copies the value of currentConfig and creates a non reference object named previousConfig
    const previousConfig: ConfigType = JSON.parse(JSON.stringify(currentConfig.value));

    // TODO: update config on server
    const updatedConfig = updateCallback(currentConfig.value);
    set((old) => ({
      ...old,
      configs: [
        ...old.configs.filter((x) => x.value.configProperties.name !== name),
        { value: updatedConfig, increaseVersion: currentConfig.increaseVersion },
      ],
    }));

    if (
      (typeof shouldRegenerateGridstack === 'boolean' && shouldRegenerateGridstack) ||
      (typeof shouldRegenerateGridstack === 'function' &&
        shouldRegenerateGridstack(previousConfig, updatedConfig))
    ) {
      currentConfig.increaseVersion();
    }
  },
}));

interface UseConfigStoreType {
  configs: { increaseVersion: () => void; value: ConfigType }[];
  initConfig: (name: string, config: ConfigType, increaseVersion: () => void) => void;
  updateConfig: (
    name: string,
    updateCallback: (previous: ConfigType) => ConfigType,
    shouldRegenerateGridstace?:
      | boolean
      | ((previousConfig: ConfigType, currentConfig: ConfigType) => boolean)
  ) => Promise<void>;
}
