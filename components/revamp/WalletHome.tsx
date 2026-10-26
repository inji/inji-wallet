import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {ScaledText} from './ScaledText';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useCopilot} from 'react-native-copilot';
import {Copilot} from '../ui/Copilot';
import {COPILOT_FINAL_STEP} from '../../shared/constants';
import {VCMetadata} from '../../shared/VCMetadata';
import {VCShareFlowType} from '../../shared/Utils';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {GlobalContext} from '../../shared/GlobalContext';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {VCItemEvents} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {RemoveVcWarningOverlay} from '../../screens/Home/MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from '../../screens/Home/MyVcs/HistoryTab';
import {QrCodeOverlay} from '../QrCodeOverlay';
import {CardCarousel} from './CardCarousel';
import {frontCardFrame} from './carouselLayout';
import {CardLoader, LoadedCard} from './CardLoader';
import {CredentialCardFront, isInactive, ScaledCard} from './CredentialCard';
import {
  Action,
  CredentialInformation,
  StatusNotice,
  StatusPill,
  StatusRow,
} from './CredentialParts';
import {CardActions, CredentialDetails} from './CredentialDetails';
import {
  ActivityIcon,
  ArrowRightIcon,
  BellIcon,
  ChevronIcon,
  FlipIcon,
  PinIcon,
  QrIcon,
  ShareIcon,
  StackIcon,
  SparkIcon,
  TrashIcon,
} from './Icons';
import {Chip, WalletHeader} from './WalletHeader';
import {SAMPLE_CARDS, useShowSampleCards} from './sampleCards';
import {CARD_WIDTH, fonts, motion, radii, shadows} from './tokens';
import {useRevampTheme} from './useRevampTheme';
import {TAB_BAR_SPACE} from './RevampTabBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const RAIL_CARD_WIDTH = 212;
const ALL = 'all';

interface HomeEntry {
  key: string;
  /** Absent for a sample card. */
  vcMetadata?: VCMetadata;
  data?: LoadedCard['data'];
}

const pluralCredentials = (n: number) =>
  `${n} ${n === 1 ? 'credential' : 'credentials'}`;

/**
 * The revamped home: the wallet's credentials as a card carousel (or, once one is pinned, that card
 * on top with the rest in a rail), the active card's status, actions and information, search and
 * a details page per card.
 */
const CARD_TOUR_START_DELAY_MS = 500;

export const WalletHome: React.FC<{
  vcMetadatas: VCMetadata[];
  /** Lowercased searchable text of each credential's claims, by credential key. */
  searchIndex: Record<string, string>;
  onAdd: () => void;
  onStackView: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  /** The cards are a tour step: after the first download, or while the tour is replayed. */
  isCardTourStep?: boolean;
  /** Start the tour at the card step once the card shows: after the first download. */
  startCardTour?: boolean;
  /** A card to open the details page of once it has loaded, e.g. from a notification. */
  openVcKey?: string;
  onVcOpened?: () => void;
}> = ({
  vcMetadatas,
  searchIndex,
  onAdd,
  onStackView,
  refreshing,
  onRefresh,
  isCardTourStep = false,
  startCardTour = false,
  openVcKey,
  onVcOpened,
}) => {
  const {t} = useTranslation();
  const {start: startTour} = useCopilot();
  const insets = useSafeAreaInsets();
  const {c, reduceMotion} = useRevampTheme();
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();
  const {appService} = React.useContext(GlobalContext);
  const scanService = appService.children.get('scan')!;

  const [loaded, setLoaded] = useState<Record<string, LoadedCard>>({});
  const onLoaded = useCallback(
    (key: string, card: LoadedCard) =>
      setLoaded(prev => ({...prev, [key]: card})),
    [],
  );

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(ALL);
  const toggleSearch = () => {
    setSearching(s => !s);
    setQuery('');
    setChip(ALL);
  };

  const [showSamples, setShowSamples] = useShowSampleCards();
  const [samplePinned, setSamplePinned] = useState<string | null>(null);
  const samples = showSamples ? SAMPLE_CARDS : [];
  const cards = useMemo<Record<string, LoadedCard>>(
    () => ({
      ...loaded,
      ...Object.fromEntries(
        samples.map(s => [
          s.key,
          {data: s.data, service: null, controller: null},
        ]),
      ),
    }),
    [loaded, samples],
  );

  const all = useMemo<HomeEntry[]>(
    () => [
      ...vcMetadatas.map(m => ({
        key: m.getVcKey(),
        vcMetadata: m,
        data: loaded[m.getVcKey()]?.data,
      })),
      ...samples.map(s => ({key: s.key, data: s.data})),
    ],
    [vcMetadatas, loaded, samples],
  );
  const isPinned = (e: HomeEntry) =>
    e.vcMetadata ? !!e.vcMetadata.isPinned : e.key === samplePinned;

  const chips: Chip[] = useMemo(() => {
    const byIssuer = new Map<string, number>();
    all.forEach(e => {
      const issuer = e.data?.issuerName;
      if (issuer) byIssuer.set(issuer, (byIssuer.get(issuer) ?? 0) + 1);
    });
    return [
      {key: ALL, label: 'All', count: all.length},
      ...[...byIssuer].map(([issuer, count]) => ({
        key: issuer,
        label: issuer,
        count,
      })),
    ];
  }, [all]);

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter(e => {
      if (chip !== ALL && e.data?.issuerName !== chip) return false;
      if (!tokens.length) return true;
      const d = e.data;
      const text = [d?.title, d?.issuerName, searchIndex[e.key]]
        .join(' ')
        .toLowerCase();
      return tokens.every(t => text.includes(t));
    });
  }, [all, query, chip, searchIndex]);

  const pinnedEntry = all.find(isPinned);
  const rail = pinnedEntry
    ? visible.filter(e => e.key !== pinnedEntry.key)
    : [];

  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  let index = visible.findIndex(e => e.key === activeKey);
  if (index < 0) index = 0;
  const [flipped, setFlipped] = useState(false);
  const select = (k: number) => {
    setActiveKey(visible[k]?.key);
    setFlipped(false);
  };
  const activeEntry = visible[index];

  const [detailKey, setDetailKey] = useState<string | null>(null);
  const detailEntry = detailKey
    ? all.find(e => e.key === detailKey)
    : undefined;
  // One card back at a time: an mdoc back runs a Bluetooth session, and two would compete.
  const openDetails = (key: string) => {
    setFlipped(false);
    setDetailKey(key);
  };

  const isOpenVcLoaded = !!(openVcKey && loaded[openVcKey]);
  useEffect(() => {
    if (!openVcKey || !isOpenVcLoaded) return;
    setActiveKey(openVcKey);
    openDetails(openVcKey);
    onVcOpened?.();
  }, [openVcKey, isOpenVcLoaded]);

  // The card the actions act on: the open details page's, else the carousel's active one.
  const targetEntry =
    detailEntry ?? (pinnedEntry && !searching ? pinnedEntry : activeEntry);
  const target = targetEntry?.vcMetadata ? loaded[targetEntry.key] : undefined;

  useEffect(() => {
    navigation
      .getParent()
      ?.setOptions({tabBarStyle: {display: detailEntry ? 'none' : 'flex'}});
  }, [!!detailEntry]);

  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flash = (msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showPinned = !!pinnedEntry && !searching;

  // After the first download the tour opens on the card, once it has loaded and the
  // carousel has settled, so the highlight lands on it. A pinned card replaces the
  // carousel, and then it is the card the tour step points at.
  const hasStartedCardTour = useRef(false);
  const tourCardEntry = showPinned ? pinnedEntry : activeEntry;
  const isActiveCardLoaded = !!(tourCardEntry && cards[tourCardEntry.key]);
  useEffect(() => {
    if (!startCardTour || !isActiveCardLoaded || hasStartedCardTour.current) {
      return;
    }
    const timer = setTimeout(() => {
      hasStartedCardTour.current = true;
      startTour(t('copilot:cardTitle'));
    }, CARD_TOUR_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [startCardTour, isActiveCardLoaded]);

  const [qrFor, setQrFor] = useState<string | null>(null);
  const qrCard = qrFor ? loaded[qrFor] : undefined;
  const qrEntry = qrFor ? all.find(e => e.key === qrFor) : undefined;

  const actionsFor = (key: string): CardActions => {
    const card = cards[key];
    const entry = all.find(e => e.key === key);
    if (!entry?.vcMetadata) {
      const off = () => flash('Sample card: nothing to share or show');
      return {
        share: off,
        showQr: off,
        activity: off,
        remove: off,
        togglePin: () => {
          const pinning = samplePinned !== key;
          setSamplePinned(pinning ? key : null);
          flash(pinning ? `${card?.data.title} pinned to top` : 'Unpinned');
        },
      };
    }
    const vcMetadata = entry.vcMetadata;
    return {
      share: () => {
        if (!card) return;
        const {serviceRefs, ...vcData} = card.service.getSnapshot().context;
        scanService.send(
          ScanEvents.SELECT_VC(vcData, VCShareFlowType.MINI_VIEW_SHARE),
        );
        navigation.navigate(BOTTOM_TAB_ROUTES.share);
      },
      showQr: () => setQrFor(key),
      togglePin: () => {
        if (!card) return;
        const pinning = !vcMetadata.isPinned;
        card.service.send(VCItemEvents.PIN_CARD());
        flash(pinning ? `${card.data.title} pinned to top` : 'Unpinned');
      },
      // The item machine takes these only from its kebab-menu state, which the old card's menu opened.
      activity: () => {
        card?.service.send(VCItemEvents.KEBAB_POPUP());
        card?.service.send(VCItemEvents.SHOW_ACTIVITY());
      },
      remove: () => {
        card?.service.send(VCItemEvents.KEBAB_POPUP());
        card?.service.send(VCItemEvents.REMOVE(vcMetadata));
      },
    };
  };

  const countText =
    visible.length === all.length
      ? pluralCredentials(all.length)
      : `${visible.length} of ${all.length} shown`;

  return (
    <View style={{flex: 1, backgroundColor: c.canvas}}>
      {vcMetadatas.map(m => (
        <CardLoader key={m.getVcKey()} vcMetadata={m} onLoaded={onLoaded} />
      ))}

      <WalletHeader
        countText={countText}
        onAvatar={() => navigation.navigate(BOTTOM_TAB_ROUTES.settings)}
        onAdd={onAdd}
        searching={searching}
        onToggleSearch={toggleSearch}
        search={{query, onQuery: setQuery, chips, chip, onChip: setChip}}
        menu={[
          {
            label: 'Notifications',
            icon: col => <BellIcon color={col} />,
            onPress: () => navigation.navigate(BOTTOM_TAB_ROUTES.history),
          },
          {
            label: 'Stack view',
            icon: col => <StackIcon color={col} />,
            onPress: onStackView,
            separated: true,
          },
          ...(SAMPLE_CARDS.length
            ? [
                {
                  label: showSamples
                    ? 'Hide sample cards'
                    : 'Show sample cards',
                  icon: (col: string) => <SparkIcon color={col} />,
                  onPress: () => {
                    setShowSamples(!showSamples);
                    setSamplePinned(null);
                  },
                },
              ]
            : []),
        ]}
      />

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE + insets.bottom}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {visible.length === 0 && !showPinned ? (
          <NoResults
            onReset={() => {
              setQuery('');
              setChip(ALL);
            }}
          />
        ) : null}

        {showPinned && pinnedEntry ? (
          <>
            <PinnedCard
              entry={pinnedEntry}
              width={Math.min(CARD_WIDTH, width - 48)}
              actions={actionsFor(pinnedEntry.key)}
              onOpen={() => openDetails(pinnedEntry.key)}
              reduceMotion={reduceMotion}
              isCardTourStep={isCardTourStep}
            />
            <Rail entries={rail} onOpen={openDetails} />
          </>
        ) : visible.length > 0 ? (
          <>
            <View style={{marginTop: 18}}>
              <CardCarousel
                entries={visible}
                index={index}
                onIndexChange={select}
                flipped={flipped}
                onFlip={() => setFlipped(f => !f)}
                reduceMotion={reduceMotion}
              />
              {isCardTourStep ? (
                // An invisible box over the centre card, so the tour highlights the card
                // itself rather than the whole carousel strip.
                <Copilot
                  title={t('copilot:cardTitle')}
                  description={t('copilot:cardMessage')}
                  order={COPILOT_FINAL_STEP}
                  targetStyle={[styles.cardTourTarget, frontCardFrame(width)]}>
                  <View />
                </Copilot>
              ) : null}
            </View>
            <Pager count={visible.length} index={index} onSelect={select} />
            <View style={styles.hint}>
              <FlipIcon color={c.inkMuted} />
              <ScaledText style={[styles.hintText, {color: c.inkMuted}]}>
                {flipped
                  ? 'Tap the card to see the front'
                  : 'Tap the card to flip it'}
              </ScaledText>
            </View>
            {activeEntry && cards[activeEntry.key] ? (
              <ActiveDetails
                cardKey={activeEntry.key}
                card={cards[activeEntry.key]}
                pinned={isPinned(activeEntry)}
                actions={actionsFor(activeEntry.key)}
                reduceMotion={reduceMotion}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {toast ? <Toast message={toast} /> : null}

      {detailEntry && cards[detailEntry.key] ? (
        <CredentialDetails
          key={detailEntry.key}
          data={cards[detailEntry.key].data}
          pinned={isPinned(detailEntry)}
          actions={actionsFor(detailEntry.key)}
          onClosed={() => setDetailKey(null)}
        />
      ) : null}

      {target && targetEntry?.vcMetadata ? (
        <>
          <RemoveVcWarningOverlay
            testID="removeVcWarningOverlay"
            service={target.service as never}
            vcMetadata={targetEntry.vcMetadata}
          />
          <HistoryTab
            service={target.service}
            vcMetadata={targetEntry.vcMetadata}
          />
        </>
      ) : null}
      {qrCard && qrEntry?.vcMetadata ? (
        <QrCodeOverlay
          verifiableCredential={qrCard.controller.credential}
          meta={qrEntry.vcMetadata}
          credentialName={qrCard.data.title}
          issuerLogoUrl={qrCard.data.issuerLogoUrl}
          showInlineQr={false}
          forceVisible
          onClose={() => setQrFor(null)}
        />
      ) : null}
    </View>
  );
};

/** Title, status, actions and information for the carousel's active card; rises in on each change. */
const ActiveDetails: React.FC<{
  cardKey: string;
  card: LoadedCard;
  pinned: boolean;
  actions: CardActions;
  reduceMotion: boolean;
}> = ({cardKey, card, pinned, actions, reduceMotion}) => {
  const {c} = useRevampTheme();
  const rise = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    rise.setValue(0);
    Animated.timing(rise, {
      toValue: 1,
      ...motion.rise,
      useNativeDriver: true,
    }).start();
  }, [cardKey]);
  const {data} = card;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.details,
        {
          opacity: rise,
          transform: [
            {
              translateY: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}>
      {isInactive(data.status) ? (
        <>
          <StatusRow data={data} />
          <StatusNotice data={data} />
        </>
      ) : (
        <View style={styles.titleRow}>
          <View style={{flex: 1, minWidth: 0, gap: 4}}>
            <ScaledText style={[styles.title, {color: c.ink}]}>
              {data.title}
            </ScaledText>
            {data.issuerName ? (
              <ScaledText style={[styles.sub, {color: c.inkMuted}]}>
                {data.issuerName}
              </ScaledText>
            ) : null}
          </View>
          <StatusPill status={data.status} />
        </View>
      )}

      <View style={styles.actions}>
        <Action
          label="Share"
          primary
          disabled={isInactive(data.status)}
          onPress={actions.share}
          icon={col => <ShareIcon color={col} />}
        />
        <Action
          label="Show QR"
          disabled={isInactive(data.status)}
          onPress={actions.showQr}
          icon={col => <QrIcon color={col} />}
        />
        <Action
          label={pinned ? 'Unpin' : 'Pin'}
          onPress={actions.togglePin}
          icon={col => <PinIcon color={col} filled={pinned} />}
        />
        <Action
          label="Activity"
          onPress={actions.activity}
          icon={col => <ActivityIcon color={col} />}
        />
      </View>

      <CredentialInformation data={data} />

      <Pressable
        onPress={actions.remove}
        style={styles.remove}
        accessibilityRole="button">
        <TrashIcon color={c.fail} />
        <ScaledText style={[styles.removeText, {color: c.fail}]}>
          Remove from Wallet
        </ScaledText>
      </Pressable>
    </Animated.View>
  );
};

const PinnedCard: React.FC<{
  entry: {key: string; data?: LoadedCard['data']};
  width: number;
  actions: CardActions;
  onOpen: () => void;
  reduceMotion: boolean;
  /** Registers the card as the tour's card step; the carousel isn't shown to take it. */
  isCardTourStep: boolean;
}> = ({entry, width, actions, onOpen, reduceMotion, isCardTourStep}) => {
  const {c} = useRevampTheme();
  const {t} = useTranslation();
  const rise = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 450,
      easing: motion.settle.easing,
      useNativeDriver: true,
    }).start();
  }, []);
  if (!entry.data) return null;
  const card = (
    <Pressable
      onPress={onOpen}
      accessibilityLabel={`Open ${entry.data.title} details`}
      style={({pressed}) => [
        shadows.card,
        // Hugs the card: on wide screens the card stops at its design size, and a wrapper
        // stretched past it drew its shadow as a strip beside the card. Android also draws
        // elevation only behind a filled view.
        {
          width,
          alignSelf: 'center',
          borderRadius: radii.card,
          backgroundColor: c.card,
        },
        pressed && {transform: [{scale: 0.98}]},
      ]}>
      <ScaledCard width={width}>
        <CredentialCardFront data={entry.data} />
      </ScaledCard>
    </Pressable>
  );
  return (
    <Animated.View
      style={[
        styles.pinned,
        {
          opacity: rise,
          transform: [
            {
              translateY: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [28, 0],
              }),
            },
            {
              scale: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.pinnedHead}>
        <View style={styles.pinnedLabel}>
          <PinIcon color={c.azureInk} size={16} filled />
          <ScaledText style={[styles.pinnedText, {color: c.azureInk}]}>
            Pinned
          </ScaledText>
        </View>
        <Pressable
          onPress={actions.togglePin}
          style={[
            styles.unpin,
            {borderColor: c.line, backgroundColor: c.card},
          ]}>
          <ScaledText style={[styles.unpinText, {color: c.ink}]}>
            Unpin
          </ScaledText>
        </Pressable>
      </View>
      {isCardTourStep ? (
        <Copilot
          title={t('copilot:cardTitle')}
          description={t('copilot:cardMessage')}
          order={COPILOT_FINAL_STEP}>
          {card}
        </Copilot>
      ) : (
        card
      )}
      <View style={styles.pinnedButtons}>
        <Pressable
          onPress={actions.showQr}
          style={({pressed}) => [
            styles.bigBtn,
            shadows.raised,
            {backgroundColor: c.primary},
            pressed && styles.pressed,
          ]}>
          <QrIcon color={c.onPrimary} size={18} strokeWidth={1.6} />
          <ScaledText style={[styles.bigBtnText, {color: c.onPrimary}]}>
            Show QR
          </ScaledText>
        </Pressable>
        <Pressable
          onPress={actions.share}
          style={({pressed}) => [
            styles.bigBtn,
            {borderWidth: 1.5, borderColor: c.sel, backgroundColor: c.card},
            pressed && styles.pressed,
          ]}>
          <ShareIcon color={c.ink} size={18} strokeWidth={1.6} />
          <ScaledText style={[styles.bigBtnText, {color: c.ink}]}>
            Share
          </ScaledText>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const Rail: React.FC<{
  entries: {key: string; data?: LoadedCard['data']}[];
  onOpen: (key: string) => void;
}> = ({entries, onOpen}) => {
  const {c} = useRevampTheme();
  return (
    <View style={styles.rail}>
      <View style={styles.railHead}>
        <ScaledText style={[styles.railTitle, {color: c.ink}]}>
          Other Credentials
        </ScaledText>
        <ScaledText style={[styles.railCount, {color: c.inkMuted}]}>
          {pluralCredentials(entries.length)}
        </ScaledText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={RAIL_CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.railList}>
        {entries.map(e =>
          e.data ? (
            <Pressable
              key={e.key}
              onPress={() => onOpen(e.key)}
              accessibilityLabel={`Open ${e.data.title} details`}
              style={({pressed}) => [
                {width: RAIL_CARD_WIDTH, gap: 8},
                pressed && {transform: [{scale: 0.98}]},
              ]}>
              <View style={[shadows.raised, {borderRadius: 10}]}>
                <ScaledCard width={RAIL_CARD_WIDTH}>
                  <CredentialCardFront data={e.data} />
                </ScaledCard>
              </View>
              <View style={{gap: 2, paddingHorizontal: 2}}>
                <ScaledText
                  numberOfLines={1}
                  style={[styles.railCardTitle, {color: c.ink}]}>
                  {e.data.title}
                </ScaledText>
                <ScaledText
                  numberOfLines={1}
                  style={[styles.railCount, {color: c.inkMuted}]}>
                  {e.data.issuerName}
                </ScaledText>
              </View>
            </Pressable>
          ) : null,
        )}
        {entries.length === 0 ? (
          <ScaledText style={[styles.empty, {color: c.inkMuted}]}>
            No other credentials match your search.
          </ScaledText>
        ) : null}
      </ScrollView>
      {entries.length > 0 ? (
        <View style={styles.railHint}>
          <ArrowRightIcon color={c.inkMuted} />
          <ScaledText style={[styles.railCount, {color: c.inkMuted}]}>
            Swipe for more · tap a card for details
          </ScaledText>
        </View>
      ) : null}
    </View>
  );
};

const NoResults: React.FC<{onReset: () => void}> = ({onReset}) => {
  const {c} = useRevampTheme();
  return (
    <View
      style={[
        styles.noResults,
        {borderColor: c.lineStrong, backgroundColor: c.sand},
      ]}>
      <ScaledText style={[styles.noResultsTitle, {color: c.ink}]}>
        No Matching Credentials
      </ScaledText>
      <ScaledText style={[styles.noResultsText, {color: c.inkMuted}]}>
        Try another name or issuer, or clear the filters.
      </ScaledText>
      <Pressable
        onPress={onReset}
        style={[
          styles.clearFilters,
          {borderColor: c.sel, backgroundColor: c.card},
        ]}>
        <ScaledText style={[styles.unpinText, {fontSize: 14, color: c.ink}]}>
          Clear Filters
        </ScaledText>
      </Pressable>
    </View>
  );
};

const Toast: React.FC<{message: string}> = ({message}) => {
  const {c, reduceMotion} = useRevampTheme();
  const t = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      ...motion.rise,
      useNativeDriver: true,
    }).start();
  }, [message]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: c.primary,
          opacity: t,
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}>
      <PinIcon color={c.onPrimary} size={16} filled />
      <ScaledText style={[styles.toastText, {color: c.onPrimary}]}>
        {message}
      </ScaledText>
    </Animated.View>
  );
};

/** Dots, the active one stretched into a pill, between previous and next buttons. */
const Pager: React.FC<{
  count: number;
  index: number;
  onSelect: (i: number) => void;
}> = ({count, index, onSelect}) => {
  const {c} = useRevampTheme();
  return (
    <View style={styles.pager}>
      <Pressable
        accessibilityLabel="Previous credential"
        onPress={() => index > 0 && onSelect(index - 1)}
        style={[
          styles.pagerBtn,
          {
            borderColor: c.line,
            backgroundColor: c.card,
            opacity: index > 0 ? 1 : 0.35,
          },
        ]}>
        <ChevronIcon direction="left" color={c.ink} />
      </Pressable>
      <View
        style={styles.dots}
        accessibilityLabel={`Credential ${index + 1} of ${count}`}>
        {Array.from({length: count}).map((_, i) => (
          <Dot key={i} active={i === index} />
        ))}
      </View>
      <Pressable
        accessibilityLabel="Next credential"
        onPress={() => index < count - 1 && onSelect(index + 1)}
        style={[
          styles.pagerBtn,
          {
            borderColor: c.line,
            backgroundColor: c.card,
            opacity: index < count - 1 ? 1 : 0.35,
          },
        ]}>
        <ChevronIcon direction="right" color={c.ink} />
      </Pressable>
    </View>
  );
};

const Dot: React.FC<{active: boolean}> = ({active}) => {
  const {c, reduceMotion} = useRevampTheme();
  const w = useRef(new Animated.Value(active ? 22 : 6)).current;
  useEffect(() => {
    if (reduceMotion) w.setValue(active ? 22 : 6);
    else
      Animated.timing(w, {
        toValue: active ? 22 : 6,
        ...motion.pager,
        useNativeDriver: false,
      }).start();
  }, [active]);
  return (
    <Animated.View
      style={[styles.dot, {width: w, backgroundColor: active ? c.sel : c.line}]}
    />
  );
};

const styles = StyleSheet.create({
  cardTourTarget: {position: 'absolute', pointerEvents: 'none'},
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 4,
  },
  pagerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {flexDirection: 'row', alignItems: 'center', gap: 5},
  dot: {height: 6, borderRadius: radii.pill},
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  hintText: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 14.4},
  details: {marginTop: 16, marginHorizontal: 24, gap: 18},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  sub: {fontFamily: fonts.regular, fontSize: 14, lineHeight: 16.8},
  actions: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  remove: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeText: {fontFamily: fonts.medium, fontSize: 16},
  pinned: {marginTop: 14, marginHorizontal: 24, gap: 12},
  pinnedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinnedLabel: {flexDirection: 'row', alignItems: 'center', gap: 6},
  pinnedText: {fontFamily: fonts.medium, fontSize: 13, lineHeight: 16},
  unpin: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  unpinText: {fontFamily: fonts.medium, fontSize: 13},
  pinnedButtons: {flexDirection: 'row', gap: 10, marginTop: 4},
  bigBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bigBtnText: {fontFamily: fonts.medium, fontSize: 15},
  pressed: {transform: [{scale: 0.985}]},
  rail: {marginTop: 26, gap: 12},
  railHead: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  railTitle: {fontFamily: fonts.medium, fontSize: 18, lineHeight: 22},
  railCount: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 14.4},
  railList: {gap: 12, paddingTop: 4, paddingBottom: 10, paddingHorizontal: 24},
  railCardTitle: {fontFamily: fonts.medium, fontSize: 14, lineHeight: 17},
  railHint: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    paddingVertical: 24,
  },
  noResults: {
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 10,
  },
  noResultsTitle: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  noResultsText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  clearFilters: {
    marginTop: 4,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: TAB_BAR_SPACE,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.card,
  },
  toastText: {fontFamily: fonts.medium, fontSize: 14},
});
