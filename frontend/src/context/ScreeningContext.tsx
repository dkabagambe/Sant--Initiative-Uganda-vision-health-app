import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScreeningData {
  // Step 1: Client Info
  clientName: string;
  clientPhone: string;
  clientAge: number;
  clientGender: string;
  clientVillage: string;
  district: string;
  county: string;
  subCounty: string;
  parish: string;
  
  // Step 4: Torch Test
  torchTestPassed: boolean;
  torchTestAbnormalSigns: string;
  
  // Step 2-5: Vision Tests
  distanceVisionLeft: string;
  distanceVisionRight: string;
  distanceVisionBoth: string;
  nearVisionResult: string;
  pinholeTestLeft: string;
  pinholeTestRight: string;
  
  // Step 6: Results
  needsGlasses: boolean;
  needsReferral: boolean;
  referralReason: string;
  referralUrgency: string;
  referralStep: string;
  recommendedProductId: string;
  recommendedPower: string;
  selectedFrameType: string;
  notes: string;
}

interface ScreeningContextType {
  screeningData: Partial<ScreeningData>;
  updateScreeningData: (data: Partial<ScreeningData>) => void;
  resetScreeningData: () => void;
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export const ScreeningProvider = ({ children }: { children: ReactNode }) => {
  const [screeningData, setScreeningData] = useState<Partial<ScreeningData>>({});

  const updateScreeningData = (data: Partial<ScreeningData>) => {
    setScreeningData(prev => ({ ...prev, ...data }));
  };

  const resetScreeningData = () => {
    setScreeningData({});
  };

  return (
    <ScreeningContext.Provider value={{ screeningData, updateScreeningData, resetScreeningData }}>
      {children}
    </ScreeningContext.Provider>
  );
};

export const useScreening = () => {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within ScreeningProvider');
  }
  return context;
};
