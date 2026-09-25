// Mock @react-navigation/native and native-stack
const React = require("react");

const mockNavigate   = jest.fn();
const mockGoBack     = jest.fn();
const mockGetParent  = jest.fn(() => ({ getParent: jest.fn(() => ({ navigate: mockNavigate })) }));

module.exports = {
  useNavigation: () => ({
    navigate:   mockNavigate,
    goBack:     mockGoBack,
    getParent:  mockGetParent,
  }),
  useRoute: () => ({ params: {} }),
  NavigationContainer: (props) => props.children,
  createNativeStackNavigator: () => ({
    Navigator: (props) => props.children,
    Screen:    (props) => props.children,
  }),
};
