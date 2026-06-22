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

  // VHT Workflow - Preparation & Greetings
  equipmentChecked: boolean;
  consentObtained: boolean;
  educationProvided: boolean;

  // VHT Workflow - Key Questions
  hasEyeConcerns: boolean;
  followsMovement: boolean;
  hasSevereEyePain: boolean;
  hasSuddenVisionLoss: boolean;
  hasDiabetesHypertension: boolean;
  familyHistoryBlindness: boolean;
  referralReasonsFromQuestions: string[];

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

  // VHT Workflow - Screening Preparation
  screeningAreaPrepared: boolean;
  testsExplainedToClient: boolean;

  // VHT Workflow - Reading Glasses
  glassesDispensed: boolean;
  glassesPower: string;
  glassesFrameType: string;
  selectedGlassesPower: string;
  selectedFrameType: string;
  glassesEducationProvided: boolean;

  // Step 6: Results
  needsGlasses: boolean;
  needsReferral: boolean;
  referralReason: string;
  referralFacility: string;
  referralUrgency: string;
  referralStep: string;
  recommendedProductId: string;
  recommendedPower: string;
  notes: string;
  screeningId: string;
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
