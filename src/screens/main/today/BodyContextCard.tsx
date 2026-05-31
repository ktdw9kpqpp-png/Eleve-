import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { CyclePhase, PhaseInfo } from '@/types/domain';

// Plain-language descriptions per cycle phase. Body sensations and "what works
// well" framing only — no medical terminology, no diagnoses. Spec §17 dictates
// no body-image / kilo-baskısı language; these stay purely about how things
// feel and what tends to land well.

type CopyEntry = {
  title: string;
  feel: string;
  works: string;
};

const COPY: Record<CyclePhase, CopyEntry> = {
  menstrual: {
    title: 'Bedenin yenileniyor',
    feel:
      'Bu hafta enerjin biraz daha düşük olabilir, dikkatin dağılabilir, sosyal istek azalabilir — bu doğal. Sıcak içecekler ve erken uyku iyi gelir.',
    works:
      'Yumuşak yoga, kısa yürüyüş, dinlenme. Karar vermek zorunda kaldığın işleri birkaç güne erteleyebilirsen, kendini daha az yorgun bulursun.',
  },
  follicular: {
    title: 'Bedenin enerji topluyor',
    feel:
      'Daha açık fikirli, sosyal ve maceracı hissedebilirsin. Yeni şeylere başlamak için içsel itici güç en yüksek seviyede.',
    works:
      'Yeni antrenmanları öğrenmek, zorlu hedeflere başlamak, cesur kararlar almak — bu hafta için. Yeni alışkanlık başlatmak istiyorsan, şimdi.',
  },
  ovulation: {
    title: 'Tepe haftandasın',
    feel:
      'Kendini güçlü, hızlı ve özgüvenli hissedebilirsin. İletişim ve hareket en akıcı. Sözcükler kolay bulunur, vücudun istediğini yapar.',
    works:
      'Önemli toplantılar, sunumlar, ağır antrenmanlar — bu hafta için planla. Sosyal etkinlikler de bu fazda kolay gelir.',
  },
  luteal: {
    title: 'Yavaşlama dönemi',
    feel:
      'Daha hassas, daha içe dönük ve detaylara odaklı hissedebilirsin. Tatlı krizleri olabilir — bu kimyasal, irade meselesi değil.',
    works:
      'Yaratıcı işler, bireysel görevler, detaylı çalışma. Antrenmanı orta yoğunlukta tut. Magnezyum (badem, bitter çikolata) krizleri yumuşatır.',
  },
};

type Props = {
  info: PhaseInfo;
};

export function BodyContextCard({ info }: Props) {
  const theme = useTheme();
  const copy = COPY[info.phase];
  const phaseColor = {
    menstrual: theme.colors.phaseMenstrual,
    follicular: theme.colors.phaseFollicular,
    ovulation: theme.colors.phaseOvulation,
    luteal: theme.colors.phaseLuteal,
  }[info.phase];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.xl },
      ]}
    >
      <Text variant="overline" color="textMuted">
        BEDENİNDE NE OLUYOR
      </Text>
      <View style={styles.titleRow}>
        <View style={[styles.dot, { backgroundColor: phaseColor }]} />
        <Text variant="h2">{copy.title}</Text>
      </View>
      <Text variant="body" color="textMuted" style={styles.paragraph}>
        {copy.feel}
      </Text>
      <Text variant="bodyStrong" style={styles.subhead}>
        Şu hafta iyi gider:
      </Text>
      <Text variant="body" color="textMuted" style={styles.paragraph}>
        {copy.works}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  paragraph: { lineHeight: 22, marginTop: 8 },
  subhead: { marginTop: 14 },
});
