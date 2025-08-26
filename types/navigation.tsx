// src/types/navigation.ts
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddEditHabit: { habitId?: string } | undefined;
};

export type TabParamList = {
  Today: undefined;
  Calendar: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, Screen>;

export type TabScreenProps<Screen extends keyof TabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, Screen>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
