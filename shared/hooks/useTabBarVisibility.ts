import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Theme } from '../../components/ui/styleUtils';

export function useTabBarVisibility() {
  const navigation = useNavigation();

  const hideTabBar = useCallback(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  const showTabBar = useCallback(() => {
    navigation.setOptions({
      tabBarShowLabel: true,
      tabBarActiveTintColor: Theme.Colors.IconBg,
      tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
      },
      tabBarStyle: {
        height: 75,
        paddingHorizontal: 10,
      },
      tabBarItemStyle: {
        height: 83,
        padding: 11,
      },
    });

  }, [navigation]);

  return { hideTabBar, showTabBar };
}
