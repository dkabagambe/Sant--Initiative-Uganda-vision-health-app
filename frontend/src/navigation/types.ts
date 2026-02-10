export type RootStackParamList = {
  // Auth Screens
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  RoleLogin: undefined;
  OTPScreen: { phone: string; userType: string };
  // Vision screening screens
  VisionScreen1: { clientAge: number };
  VisionScreen2: { clientAge: number };
  VisionScreen3: { clientAge: number };
  VisionScreen4: { clientAge: number };
  VisionScreen5: { clientAge: number };
  VisionScreen6: { clientAge: number };

  // CHW Registration
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: { step1Data: any };
  CHWRegistrationStep3: { step1Data: any; step2Data: any };
  CHWRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };

  // Outlet Registration
  OutletRegistrationStep1: undefined;
  OutletRegistrationStep2: { step1Data: any };
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  OutletRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };

  // Dashboards
  CHWDashboard: undefined;
  OutletDashboard: undefined;
  VSLADashboard: undefined;
};
