import React, { createContext, useContext, useState, useEffect } from 'react';

interface DataSaverContextType {
  dataSaverMode: boolean;
  toggleDataSaverMode: () => void;
  setDataSaverMode: (enabled: boolean) => void;
}

const DataSaverContext = createContext<DataSaverContextType>({
  dataSaverMode: false,
  toggleDataSaverMode: () => {},
  setDataSaverMode: () => {}
});

export const DataSaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataSaverMode, setDataSaverState] = useState<boolean>(() => {
    const saved = localStorage.getItem('bharatfarm_datasaver_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const setDataSaverMode = (enabled: boolean) => {
    setDataSaverState(enabled);
    localStorage.setItem('bharatfarm_datasaver_mode', JSON.stringify(enabled));
  };

  const toggleDataSaverMode = () => {
    setDataSaverMode(!dataSaverMode);
  };

  return (
    <DataSaverContext.Provider value={{ dataSaverMode, toggleDataSaverMode, setDataSaverMode }}>
      {children}
    </DataSaverContext.Provider>
  );
};

export const useDataSaver = () => useContext(DataSaverContext);
