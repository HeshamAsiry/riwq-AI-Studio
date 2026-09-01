import { TimeZoneOption } from '../types';

export const COMMON_TIMEZONES: TimeZoneOption[] = [
  // الشرق الأوسط والخليج العربي
  { id: 'Africa/Cairo', name: 'مصر (القاهرة)', country: 'مصر', flag: '🇪🇬', offset: 'UTC+2/3', city: 'القاهرة' },
  { id: 'Asia/Riyadh', name: 'السعودية (مكة المكرمة والرياض)', country: 'السعودية', flag: '🇸🇦', offset: 'UTC+3', city: 'الرياض' },
  { id: 'Asia/Dubai', name: 'الإمارات (دبي وأبوظبي)', country: 'الإمارات', flag: '🇦🇪', offset: 'UTC+4', city: 'دبي' },
  { id: 'Asia/Qatar', name: 'قطر (الدوحة)', country: 'قطر', flag: '🇶🇦', offset: 'UTC+3', city: 'الدوحة' },
  { id: 'Asia/Kuwait', name: 'الكويت', country: 'الكويت', flag: '🇰🇼', offset: 'UTC+3', city: 'الكويت' },
  { id: 'Asia/Bahrain', name: 'البحرين', country: 'البحرين', flag: '🇧🇭', offset: 'UTC+3', city: 'المنامة' },
  { id: 'Asia/Muscat', name: 'سلطنة عُمان', country: 'عُمان', flag: '🇴🇲', offset: 'UTC+4', city: 'مسقط' },
  { id: 'Asia/Amman', name: 'الأردن (عمّان)', country: 'الأردن', flag: '🇯🇴', offset: 'UTC+3', city: 'عمّان' },
  { id: 'Asia/Beirut', name: 'لبنان (بيروت)', country: 'لبنان', flag: '🇱🇧', offset: 'UTC+2/3', city: 'بيروت' },
  { id: 'Asia/Jerusalem', name: 'فلسطين (القدس الشريف)', country: 'فلسطين', flag: '🇵🇸', offset: 'UTC+2/3', city: 'القدس' },
  { id: 'Asia/Baghdad', name: 'العراق (بغداد)', country: 'العراق', flag: '🇮🇶', offset: 'UTC+3', city: 'بغداد' },

  // شمال إفريقيا والمغرب العربي
  { id: 'Africa/Tripoli', name: 'ليبيا (طرابلس)', country: 'ليبيا', flag: '🇱🇾', offset: 'UTC+2', city: 'طرابلس' },
  { id: 'Africa/Tunis', name: 'تونس', country: 'تونس', flag: '🇹🇳', offset: 'UTC+1', city: 'تونس' },
  { id: 'Africa/Algiers', name: 'الجزائر', country: 'الجزائر', flag: '🇩🇿', offset: 'UTC+1', city: 'الجزائر' },
  { id: 'Africa/Casablanca', name: 'المغرب (الرباط / كازابلانكا)', country: 'المغرب', flag: '🇲🇦', offset: 'UTC+1', city: 'الرباط' },
  { id: 'Africa/Khartoum', name: 'السودان (الخرطوم)', country: 'السودان', flag: '🇸🇩', offset: 'UTC+2', city: 'الخرطوم' },

  // أوروبا
  { id: 'Europe/London', name: 'المملكة المتحدة (لندن)', country: 'بريطانيا', flag: '🇬🇧', offset: 'UTC+0/1', city: 'لندن' },
  { id: 'Europe/Paris', name: 'فرنسا (باريس)', country: 'فرنسا', flag: '🇫🇷', offset: 'UTC+1/2', city: 'باريس' },
  { id: 'Europe/Berlin', name: 'ألمانيا (برلين)', country: 'ألمانيا', flag: '🇩🇪', offset: 'UTC+1/2', city: 'برلين' },
  { id: 'Europe/Rome', name: 'إيطاليا (روما)', country: 'إيطاليا', flag: '🇮🇹', offset: 'UTC+1/2', city: 'روما' },
  { id: 'Europe/Madrid', name: 'إسبانيا (مدريد)', country: 'إسبانيا', flag: '🇪🇸', offset: 'UTC+1/2', city: 'مدريد' },
  { id: 'Europe/Amsterdam', name: 'هولندا (أمستردام)', country: 'هولندا', flag: '🇳🇱', offset: 'UTC+1/2', city: 'أمستردام' },
  { id: 'Europe/Brussels', name: 'بلجيكا (بروكسل)', country: 'بلجيكا', flag: '🇧🇪', offset: 'UTC+1/2', city: 'بروكسل' },
  { id: 'Europe/Stockholm', name: 'السويد (ستوكهولم)', country: 'السويد', flag: '🇸🇪', offset: 'UTC+1/2', city: 'ستوكهولم' },
  { id: 'Europe/Oslo', name: 'النرويج (أوسلو)', country: 'النرويج', flag: '🇳🇴', offset: 'UTC+1/2', city: 'أوسلو' },
  { id: 'Europe/Vienna', name: 'النمسا (فيينا)', country: 'النمسا', flag: '🇦🇹', offset: 'UTC+1/2', city: 'فيينا' },
  { id: 'Europe/Istanbul', name: 'تركيا (إسطنبول)', country: 'تركيا', flag: '🇹🇷', offset: 'UTC+3', city: 'إسطنبول' },
  { id: 'Europe/Moscow', name: 'روسيا (موسكو)', country: 'روسيا', flag: '🇷🇺', offset: 'UTC+3', city: 'موسكو' },

  // أمريكا الشمالية
  { id: 'America/New_York', name: 'أمريكا - التوقيت الشرقي (نيويورك / واشنطن / فلوريدا)', country: 'الولايات المتحدة', flag: '🇺🇸', offset: 'UTC-5/-4', city: 'نيويورك' },
  { id: 'America/Chicago', name: 'أمريكا - التوقيت المركزي (شيكاغو / تكساس)', country: 'الولايات المتحدة', flag: '🇺🇸', offset: 'UTC-6/-5', city: 'شيكاغو' },
  { id: 'America/Denver', name: 'أمريكا - توقيت الجبال (دنفر / كولورادو)', country: 'الولايات المتحدة', flag: '🇺🇸', offset: 'UTC-7/-6', city: 'دنفر' },
  { id: 'America/Los_Angeles', name: 'أمريكا - التوقيت الباسيفيكي (كاليفورنيا / سياتل)', country: 'الولايات المتحدة', flag: '🇺🇸', offset: 'UTC-8/-7', city: 'لوس أنجلوس' },
  { id: 'America/Toronto', name: 'كندا - التوقيت الشرقي (تورونتو / مونتريال)', country: 'كندا', flag: '🇨🇦', offset: 'UTC-5/-4', city: 'تورونتو' },
  { id: 'America/Vancouver', name: 'كندا - التوقيت الغربي (فانكوفر)', country: 'كندا', flag: '🇨🇦', offset: 'UTC-8/-7', city: 'فانكوفر' },

  // آسيا وأستراليا
  { id: 'Asia/Kuala_Lumpur', name: 'ماليزيا (كوالالمبور)', country: 'ماليزيا', flag: '🇲🇾', offset: 'UTC+8', city: 'كوالالمبور' },
  { id: 'Asia/Jakarta', name: 'إندونيسيا (جاكرتا)', country: 'إندونيسيا', flag: '🇮🇩', offset: 'UTC+7', city: 'جاكرتا' },
  { id: 'Asia/Singapore', name: 'سنغافورة', country: 'سنغافورة', flag: '🇸🇬', offset: 'UTC+8', city: 'سنغافورة' },
  { id: 'Asia/Karachi', name: 'باكستان (إسلام آباد / كراتشي)', country: 'باكستان', flag: '🇵🇰', offset: 'UTC+5', city: 'كراتشي' },
  { id: 'Asia/Dhaka', name: 'بنغلاديش (دكا)', country: 'بنغلاديش', flag: '🇧🇩', offset: 'UTC+6', city: 'دكا' },
  { id: 'Australia/Sydney', name: 'أستراليا (سيدني / ملبورن)', country: 'أستراليا', flag: '🇦🇺', offset: 'UTC+10/11', city: 'سيدني' },
  { id: 'Australia/Perth', name: 'أستراليا الغربية (بيرث)', country: 'أستراليا', flag: '🇦🇺', offset: 'UTC+8', city: 'بيرث' },
  { id: 'Pacific/Auckland', name: 'نيوزيلندا (أوكلاند)', country: 'نيوزيلندا', flag: '🇳🇿', offset: 'UTC+12/13', city: 'أوكلاند' }
];

export const TIMEZONE_OPTIONS = COMMON_TIMEZONES;


export const DAYS_ARABIC = [
  { index: 0, name: 'الأحد', short: 'أحد' },
  { index: 1, name: 'الإثنين', short: 'إثنين' },
  { index: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { index: 3, name: 'الأربعاء', short: 'أربعاء' },
  { index: 4, name: 'الخميس', short: 'خميس' },
  { index: 5, name: 'الجمعة', short: 'جمعة' },
  { index: 6, name: 'السبت', short: 'سبت' },
];

export const SUBJECT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  quran_memorization: { label: 'حفظ القرآن الكريم', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  quran_recitation_tajweed: { label: 'تلاوة وتجويد وإتقان', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  arabic_language: { label: 'اللغة العربية وقواعدها', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  islamic_studies: { label: 'علوم شرعية', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  mixed: { label: 'قرآن + لغة عربية', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

export const STUDY_CATEGORY_LABELS: Record<string, string> = {
  tafsir: 'التفسير وعلوم القرآن',
  hadith: 'الحديث الشريف وعلومه',
  aqeedah: 'العقيدة والتوحيد',
  fiqh: 'الفقه الإسلامي وأصوله',
  nahw_sarf: 'النحو والصرف والبلاغة',
  tajweed_qiraat: 'التجويد والقراءات',
  usul: 'أصول الفقه والقواعد الفقهية',
  general: 'كتب عامة وتزكية',
};
