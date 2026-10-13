import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../ui/Copilot';
import {CloseIcon, MoreIcon, PlusIcon, SearchIcon, UserIcon} from './Icons';
import {fonts, radii, shadows} from './tokens';
import {useRevampTheme} from './useRevampTheme';

export interface MenuItem {
  label: string;
  icon: (colour: string) => React.ReactNode;
  onPress: () => void;
  /** Draws a divider above this item. */
  separated?: boolean;
}

export interface Chip {
  key: string;
  label: string;
  count: number;
}

export interface SearchState {
  query: string;
  onQuery: (q: string) => void;
  chips: Chip[];
  chip: string;
  onChip: (key: string) => void;
}

const MENU_TOP = 70;

/** "Wallet" with the count, add, search and a menu; search opens a field and filter chips below. */
export const WalletHeader: React.FC<{
  countText: string;
  avatarUri?: string;
  onAvatar: () => void;
  onAdd: () => void;
  searching: boolean;
  onToggleSearch?: () => void;
  search?: SearchState;
  menu: MenuItem[];
}> = ({
  countText,
  avatarUri,
  onAvatar,
  onAdd,
  searching,
  onToggleSearch,
  search,
  menu,
}) => {
  const {c} = useRevampTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <View style={{paddingTop: insets.top, backgroundColor: c.canvas}}>
      <View style={styles.bar}>
        <View style={styles.left}>
          <Pressable
            onPress={onAvatar}
            accessibilityLabel="Open profile"
            style={[styles.avatarRing, {borderColor: c.sel}]}>
            <View style={[styles.avatar, {backgroundColor: '#c3d3e6'}]}>
              {avatarUri ? (
                <Image source={{uri: avatarUri}} style={styles.avatarImg} />
              ) : (
                <UserIcon color={c.ink} size={22} />
              )}
            </View>
          </Pressable>
          <View style={{gap: 2, minWidth: 0}}>
            <Text style={[styles.h1, {color: c.ink}]}>Wallet</Text>
            <Text
              style={[styles.count, {color: c.inkMuted}]}
              accessibilityLiveRegion="polite">
              {countText}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Copilot
            title={t('copilot:downloadTitle')}
            description={t('copilot:downloadMessage')}
            order={1}
            targetStyle={{borderRadius: radii.pill}}>
            <Pressable
              onPress={onAdd}
              testID="downloadCardButton"
              accessibilityLabel="Add a credential"
              style={({pressed}) => [
                styles.iconBtn,
                shadows.raised,
                {backgroundColor: c.card, borderColor: c.line},
                pressed && {transform: [{scale: 0.95}]},
              ]}>
              <PlusIcon color={c.ink} />
            </Pressable>
          </Copilot>
          <View
            style={[
              styles.group,
              shadows.raised,
              {backgroundColor: c.card, borderColor: c.line},
            ]}>
            {onToggleSearch ? (
              <Pressable
                onPress={onToggleSearch}
                accessibilityLabel="Search credentials"
                accessibilityState={{expanded: searching}}
                style={[
                  styles.groupBtn,
                  searching && {backgroundColor: c.sand},
                ]}>
                <SearchIcon color={c.ink} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="More options"
              accessibilityState={{expanded: menuOpen}}
              style={[styles.groupBtn, menuOpen && {backgroundColor: c.sand}]}>
              <MoreIcon color={c.ink} />
            </Pressable>
          </View>
        </View>
      </View>

      {searching && search && onToggleSearch ? (
        <SearchPanel search={search} onCancel={onToggleSearch} />
      ) : null}

      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}
        />
        <Menu
          top={insets.top + MENU_TOP}
          items={menu}
          onPick={item => {
            setMenuOpen(false);
            item.onPress();
          }}
        />
      </Modal>
    </View>
  );
};

const Menu: React.FC<{
  top: number;
  items: MenuItem[];
  onPick: (item: MenuItem) => void;
}> = ({top, items, onPick}) => {
  const {c, reduceMotion} = useRevampTheme();
  const t = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      accessibilityRole="menu"
      style={[
        styles.menu,
        shadows.card,
        {
          top,
          backgroundColor: c.card,
          borderColor: c.line,
          opacity: t,
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}>
      {items.map(item => (
        <React.Fragment key={item.label}>
          {item.separated ? (
            <View style={[styles.menuSep, {backgroundColor: c.line}]} />
          ) : null}
          <Pressable
            accessibilityRole="menuitem"
            onPress={() => onPick(item)}
            style={({pressed}) => [
              styles.menuItem,
              pressed && {backgroundColor: c.sand},
            ]}>
            {item.icon(c.ink)}
            <Text style={[styles.menuText, {color: c.ink}]}>{item.label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </Animated.View>
  );
};

const SearchPanel: React.FC<{search: SearchState; onCancel: () => void}> = ({
  search,
  onCancel,
}) => {
  const {c, reduceMotion} = useRevampTheme();
  const t = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.search,
        {
          opacity: t,
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [-8, 0],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.searchRow}>
        <View style={{flex: 1, minWidth: 0, justifyContent: 'center'}}>
          <View style={styles.searchIcon} pointerEvents="none">
            <SearchIcon color={c.inkMuted} size={18} strokeWidth={1.8} />
          </View>
          <TextInput
            autoFocus
            value={search.query}
            onChangeText={search.onQuery}
            placeholder="Search by name or issuer"
            placeholderTextColor={c.inkMuted}
            accessibilityLabel="Search credentials"
            returnKeyType="search"
            numberOfLines={1}
            multiline={false}
            style={[
              styles.input,
              {
                borderColor: c.lineStrong,
                backgroundColor: c.card,
                color: c.ink,
                paddingRight: search.query ? 44 : 16,
              },
            ]}
          />
          {search.query ? (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={() => search.onQuery('')}
              style={styles.clear}>
              <CloseIcon color={c.inkMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onCancel} style={styles.cancel}>
          <Text style={[styles.cancelText, {color: c.azureInk}]}>Cancel</Text>
        </Pressable>
      </View>
      {search.chips.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chips}
          style={{marginHorizontal: -24}}
          accessibilityLabel="Filter by issuer">
          {search.chips.map(chip => {
            const on = chip.key === search.chip;
            return (
              <Pressable
                key={chip.key}
                onPress={() => search.onChip(chip.key)}
                accessibilityState={{selected: on}}
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? c.primary : c.card,
                    borderColor: on ? c.sel : c.line,
                  },
                ]}>
                <Text
                  style={[styles.chipText, {color: on ? c.onPrimary : c.ink}]}>
                  {chip.label}
                </Text>
                <Text
                  style={[styles.chipCount, {color: on ? c.onPrimary : c.ink}]}>
                  {chip.count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 24,
  },
  left: {flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1},
  avatarRing: {
    width: 47,
    height: 47,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {width: 40, height: 40},
  h1: {
    fontFamily: fonts.medium,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
  },
  count: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 14.4},
  right: {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    height: 44,
    paddingHorizontal: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    right: 24,
    width: 236,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {fontFamily: fonts.regular, fontSize: 15},
  menuSep: {height: 1, marginVertical: 4, marginHorizontal: 8},
  search: {gap: 12, paddingTop: 8, paddingBottom: 6, paddingHorizontal: 24},
  searchRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  searchIcon: {position: 'absolute', left: 14, zIndex: 1},
  input: {
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingLeft: 40,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  clear: {
    position: 'absolute',
    right: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {height: 44, justifyContent: 'center', paddingHorizontal: 2},
  cancelText: {fontFamily: fonts.medium, fontSize: 16},
  chips: {gap: 8, paddingHorizontal: 24},
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {fontFamily: fonts.medium, fontSize: 14},
  chipCount: {fontFamily: fonts.regular, fontSize: 12, opacity: 0.75},
});
