
import { DatabaseSettings, PostgreSQLConfig } from "@/components/DatabaseSettings";

interface DatabaseTabProps {
  onConnect: (config: PostgreSQLConfig) => void;
  isConnected: boolean;
  currentConfig?: PostgreSQLConfig;
}

export const DatabaseTab = ({ onConnect, isConnected, currentConfig }: DatabaseTabProps) => {
  return (
    <DatabaseSettings 
      onConnect={onConnect}
      isConnected={isConnected}
      currentConfig={currentConfig}
    />
  );
};
