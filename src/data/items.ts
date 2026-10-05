import { MetinItem } from '../types';

export const METIN2_ITEMS_DATABASE: MetinItem[] = [
  // --- SZKATUŁKI BOSSÓW ---
  {
    id: 'szkat_wodza_orkow',
    name: 'Szkat. Wodza Orków',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka z Wodza Orków. Może zawierać bronie 65lvl (Miecz Nimfy, Miecz Bojowy), zbroje 61lvl i zwoje.',
    levelReq: 50,
    sourceBosses: ['wodz_orkow', 'odrodzony_wodz_orkow'],
    sourceMaps: ['dolina_seungryong'],
  },
  {
    id: 'szkat_zolwia',
    name: 'Szkat. Żółwia',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka Olbrzymiego Żółwia Pustynnego. Wypadają z niej tarcze 61lvl, bronie oraz dzwony.',
    levelReq: 67,
    sourceBosses: ['pustynny_zolw'],
    sourceMaps: ['pustynia_yongbi'],
  },
  {
    id: 'szkat_dziewieciu_ogonow',
    name: 'Szkat. Dziewięciu Ogonów',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka lodowego lisa z Góry Sohan. Zawiera rzadkie bronie i zbroje na wysoki poziom.',
    levelReq: 72,
    sourceBosses: ['dziewiec_ogonow'],
    sourceMaps: ['gora_sohan'],
  },
  {
    id: 'szkat_tygrysa',
    name: 'Szkat. Zjawy Żółtego Tygrysa',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka Zjawy Żółtego Tygrysa ze Świątyni Hwang. Zawiera bronie dwuręczne, sztylety i zwoje.',
    levelReq: 75,
    sourceBosses: ['zjawa_tygrysa'],
    sourceMaps: ['swiatynia_hwang'],
  },
  {
    id: 'szkat_krola_demonow',
    name: 'Szkat. Króla Demonów',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka Króla Demonów z Wieży Demonów DT. Cenne źródło ulepszaczy i ksiąg.',
    levelReq: 75,
    sourceBosses: ['krol_demonow', 'el_krol_demonow'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'szkat_rozpruwacza',
    name: 'Szkat. Umarłego Rozpruwacza',
    category: 'chest',
    rarity: 'legendary',
    description: 'Legendarne trofeum z 9. piętra DT. Może zawierać Zatruty Miecz, Skrzydła Demona Chakram, Miecz Żalu lub Stal.',
    levelReq: 78,
    sourceBosses: ['umarly_rozpruwacz'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'szkat_niebieskiej_smierci',
    name: 'Szkat. Niebieskiej Śmierci',
    category: 'chest',
    rarity: 'legendary',
    description: 'Najrzadsza szkatułka z Wieży Demonów. Gwarantuje najwyższej klasy drop na poziomie mistrzowskim.',
    levelReq: 97,
    sourceBosses: ['niebieska_smierc'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'szkat_krolowej_pajakow',
    name: 'Szkat. Królowej Pająków',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka Królowej Pająków z Lochu Pająków V1/V2. Dropi zbroje na 54/61lvl i zwoje powrotu statusu.',
    levelReq: 60,
    sourceBosses: ['krolowa_pajakow', 'elitarna_krolowa_pajakow'],
    sourceMaps: ['loch_pajakow_v1', 'loch_pajakow_v2'],
  },
  {
    id: 'szkat_barona_pajakow',
    name: 'Szkat. Barona Pająków',
    category: 'chest',
    rarity: 'legendary',
    description: 'Szkatułka z Komnaty Pająków (Baronowej). Źródło rzadkich ulepszaczy i kamieni.',
    levelReq: 75,
    sourceBosses: ['baronowa_pajakow'],
    sourceMaps: ['loch_pajakow_v3'],
  },
  {
    id: 'szkat_ognistego_krola',
    name: 'Szkat. Ognistego Króla',
    category: 'chest',
    rarity: 'epic',
    description: 'Szkatułka Ognistego Króla z Ognistej Ziemi (Doyyumhwan). Cenne bronie i zbroje.',
    levelReq: 73,
    sourceBosses: ['ognisty_krol'],
    sourceMaps: ['ognista_ziemia'],
  },
  {
    id: 'szkat_beran_setaou',
    name: 'Szkat. Smoka Beran-Setaou',
    category: 'chest',
    rarity: 'legendary',
    description: 'Szkatułka Wodnego Smoka z Groty Wygnańców V2. Zawiera Pazury Smoka, Łuski Smoka i buty na 75lvl.',
    levelReq: 89,
    sourceBosses: ['beran_setaou'],
    sourceMaps: ['grota_wygnancow_v2'],
  },
  {
    id: 'szkat_azraela',
    name: 'Szkat. Azraela',
    category: 'chest',
    rarity: 'legendary',
    description: 'Szkatułka Piekielnego Władcy z Piekielnych Katakumb. Dropi hełmy na 60 i 80lvl oraz tytanowe tarcze.',
    levelReq: 91,
    sourceBosses: ['azrael'],
    sourceMaps: ['katakumby'],
  },
  {
    id: 'szkat_razadora',
    name: 'Szkat. Razadora',
    category: 'chest',
    rarity: 'legendary',
    description: 'Szkatułka Władcy Ognia z Twierdzy Czerwonego Smoka. Najwyższej klasy łupy PvM i PvP.',
    levelReq: 105,
    sourceBosses: ['razador'],
    sourceMaps: ['twierdza_razadora'],
  },
  {
    id: 'szkat_nemere',
    name: 'Szkat. Nemere',
    category: 'chest',
    rarity: 'legendary',
    description: 'Szkatułka Władcy Lodu ze Strażnicy Nemere. Zawiera unikalne zwoje i lodowe relikty.',
    levelReq: 105,
    sourceBosses: ['nemere'],
    sourceMaps: ['straznica_nemere'],
  },
  {
    id: 'szkat_malp',
    name: 'Szkat. Małp',
    category: 'chest',
    rarity: 'rare',
    description: 'Skrzynia z Lochu Małp z medalami i eliksirami.',
    levelReq: 55,
    sourceBosses: ['lord_malp'],
    sourceMaps: ['pustynia_yongbi'],
  },

  // --- KAMIENIE DUSZY (KD +4) ---
  {
    id: 'kd_smierci_4',
    name: 'Kamień Duszy Śmierci +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +8% szansy na cios krytyczny do broni. Jeden z najważniejszych kamieni w grze.',
    sourceBosses: ['wodz_orkow', 'dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa', 'krol_demonow'],
    sourceMaps: ['dolina_seungryong', 'gora_sohan', 'ognista_ziemia', 'swiatynia_hwang', 'wieza_demonow'],
  },
  {
    id: 'kd_penetracji_4',
    name: 'Kamień Duszy Penetracji +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +8% szansy na cios przeszywający (ignoruje obronę przeciwnika).',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'ognisty_krol', 'dziewiec_ogonow'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'ognista_ziemia', 'gora_sohan'],
  },
  {
    id: 'kd_potwora_4',
    name: 'Kamień Duszy Potwora +4',
    category: 'stone',
    rarity: 'legendary',
    description: 'Daje +8% silny przeciwko potworom. Kluczowy kamień do broni PvM i expienia.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'beran_setaou'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'kd_wojownika_4',
    name: 'Kamień Duszy Wojownika +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +25% silny przeciwko Wojownikom do broni.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'kd_sury_4',
    name: 'Kamień Duszy Sury +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +25% silny przeciwko Surom do broni.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'kd_ninji_4',
    name: 'Kamień Duszy Ninji +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +25% silny przeciwko Ninjom do broni.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'kd_szamana_4',
    name: 'Kamień Duszy Szamana +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +25% silny przeciwko Szamanom do broni.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'kd_uchylenia_4',
    name: 'Kamień Duszy Uchylenia +4',
    category: 'stone',
    rarity: 'epic',
    description: 'Daje +8% szansy na blok ciosów do zbroi.',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'dziewiec_ogonow', 'ognisty_krol'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'gora_sohan', 'ognista_ziemia'],
  },
  {
    id: 'kd_uniku_4',
    name: 'Kamień Duszy Uniku +4',
    category: 'stone',
    rarity: 'rare',
    description: 'Daje +8% szansy na uniknięcie strzały do zbroi.',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'krol_demonow'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'wieza_demonow'],
  },
  {
    id: 'kd_przyspieszenia_4',
    name: 'Kamień Duszy Przyśpieszenia +4',
    category: 'stone',
    rarity: 'rare',
    description: 'Zwiększa Szybkość Ruchu postaci o +30%.',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'dziewiec_ogonow'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'gora_sohan'],
  },
  {
    id: 'kd_obrony_4',
    name: 'Kamień Duszy Obrony +4',
    category: 'stone',
    rarity: 'rare',
    description: 'Daje +15 obrony do zbroi.',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi'],
  },
  {
    id: 'kd_witalnosci_4',
    name: 'Kamień Duszy Witalności +4',
    category: 'stone',
    rarity: 'rare',
    description: 'Dodaje +1000 PŻ do zbroi.',
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'ognisty_krol'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'ognista_ziemia'],
  },

  // --- BRONIE (LEGENDARNE I NA 75LVL) ---
  {
    id: 'zatruty_miecz',
    name: 'Zatruty Miecz',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Legendarny miecz 1-ręczny na 75 poziom z wbudowanymi Średnimi Obrażeniami (ŚR) i Obrażeniami Umiejętności (UM).',
    levelReq: 75,
    sourceBosses: ['umarly_rozpruwacz', 'niebieska_smierc', 'beran_setaou'],
    sourceMaps: ['wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'skrzydla_demona_chakram',
    name: 'Skrzydła Demona Chakram',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Chakramy dla Ninjy na 75 poziom z wbudowanymi ŚR i UM.',
    levelReq: 75,
    sourceBosses: ['umarly_rozpruwacz', 'niebieska_smierc'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'miecz_zalu',
    name: 'Miecz Żalu',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Broń dwuręczna na 75 poziom z wbudowanymi ŚR i UM dla Wojownika.',
    levelReq: 75,
    sourceBosses: ['umarly_rozpruwacz', 'niebieska_smierc', 'beran_setaou'],
    sourceMaps: ['wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'lwi_miecz',
    name: 'Lwi Miecz',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Miecz na 75 poziom dla Sury z wbudowanymi ŚR i UM.',
    levelReq: 75,
    sourceBosses: ['umarly_rozpruwacz'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'bambusowy_dzwon',
    name: 'Bambusowy Dzwon',
    category: 'weapon',
    rarity: 'legendary',
    description: 'Dzwon na 75 poziom dla Szamana z wbudowanymi Średnimi Obrażeniami.',
    levelReq: 75,
    sourceBosses: ['umarly_rozpruwacz', 'niebieska_smierc'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'miecz_bojowy',
    name: 'Miecz Bojowy',
    category: 'weapon',
    rarity: 'epic',
    description: 'Jednoręczny miecz na 65 poziom. Baza do wytworzenia Miecza Syriusza (+9).',
    levelReq: 65,
    sourceBosses: ['wodz_orkow', 'dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'krol_demonow'],
    sourceMaps: ['dolina_seungryong', 'gora_sohan', 'ognista_ziemia', 'wieza_demonow'],
  },
  {
    id: 'partyzana',
    name: 'Partyzana',
    category: 'weapon',
    rarity: 'epic',
    description: 'Dwuręczna włócznia na 65 poziom dla Wojownika.',
    levelReq: 65,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'smoczy_noz',
    name: 'Smoczy Nóż',
    category: 'weapon',
    rarity: 'epic',
    description: 'Sztylety na 65 poziom. Baza do wytworzenia Noży Bezusznych (+9).',
    levelReq: 65,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia'],
  },
  {
    id: 'miecz_szponu_ducha',
    name: 'Miecz Szponu Ducha',
    category: 'weapon',
    rarity: 'epic',
    description: 'Miecz na 65 poziom z dużą wartością ataku magicznego dla Sury BM. Baza pod Święty Miecz.',
    levelReq: 65,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'miecz_nimfy',
    name: 'Miecz Nimfy',
    category: 'weapon',
    rarity: 'rare',
    description: 'Szybki miecz na 65 poziom z bonusem do szybkości ataku.',
    levelReq: 65,
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'lord_malp'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi'],
  },
  {
    id: 'fms',
    name: 'Miecz Pełni Księżyca (FMS)',
    category: 'weapon',
    rarity: 'rare',
    description: 'Kultowy miecz na 30 poziom ze średnimi obrażeniami. Uniwersalna broń.',
    levelReq: 30,
    sourceBosses: ['best_kapitan', 'best_lucznik', 'best_specjalista'],
    sourceMaps: ['m2_chunya', 'dolina_seungryong'],
  },
  {
    id: 'rib',
    name: 'Ostrze z Czerwonej Stali (RIB)',
    category: 'weapon',
    rarity: 'rare',
    description: 'Kultowa broń dwuręczna na 30 poziom z wysokimi średnimi obrażeniami pod konia.',
    levelReq: 30,
    sourceBosses: ['ezot_przyzywacz', 'wodz_orkow'],
    sourceMaps: ['dolina_seungryong'],
  },

  // --- ZBROJE & STALKI ---
  {
    id: 'czarna_stal',
    name: 'Zbroja z Czarnej Stali',
    category: 'armor',
    rarity: 'legendary',
    description: 'Zbroja na 66-70 poziom dla Wojownika. Odporność na magię i potężny pancerz.',
    levelReq: 66,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'niebieska_smierc', 'beran_setaou'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'ubranie_czarnego_wiatru',
    name: 'Ubranie Czarnego Wiatru',
    category: 'armor',
    rarity: 'legendary',
    description: 'Stalka na 66-70 poziom dla Ninjy. Baza pod Ubranie Niebieskiego Smoka.',
    levelReq: 66,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'beran_setaou'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'zbroja_plytowa_magii',
    name: 'Zbroja Płytowa Magii',
    category: 'armor',
    rarity: 'legendary',
    description: 'Stalka na 66-70 poziom dla Sury. Najlepsza zbroja przed zbroją niebiańską.',
    levelReq: 66,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'beran_setaou'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'czarna_szata',
    name: 'Czarna Szata',
    category: 'armor',
    rarity: 'legendary',
    description: 'Stalka na 66-70 poziom dla Szamana. Zapewnia wysoką obronę magiczną.',
    levelReq: 66,
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'umarly_rozpruwacz', 'beran_setaou'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow', 'grota_wygnancow_v2'],
  },
  {
    id: 'tarcza_sokola',
    name: 'Tarcza Sokoła',
    category: 'armor',
    rarity: 'epic',
    description: 'Tarcza na 61 poziom z wbudowaną odpornością na Wojowników (+20%).',
    levelReq: 61,
    sourceBosses: ['wodz_orkow', 'pustynny_zolw', 'krolowa_pajakow', 'dziewiec_ogonow'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'loch_pajakow_v1', 'gora_sohan'],
  },
  {
    id: 'tarcza_smoka',
    name: 'Tarcza Tygrysa / Smoka',
    category: 'armor',
    rarity: 'epic',
    description: 'Tarcze na 61 poziom z odpornością na Ninja lub Szamanów.',
    levelReq: 61,
    sourceBosses: ['pustynny_zolw', 'krolowa_pajakow', 'dziewiec_ogonow'],
    sourceMaps: ['pustynia_yongbi', 'loch_pajakow_v1', 'gora_sohan'],
  },
  {
    id: 'tarcza_lwiej_krawedzi',
    name: 'Tarcza Lwiej Krawędzi',
    category: 'armor',
    rarity: 'epic',
    description: 'Tarcza na 61 poziom z wbudowaną odpornością na Surę (+20%).',
    levelReq: 61,
    sourceBosses: ['pustynny_zolw', 'dziewiec_ogonow', 'ognisty_krol'],
    sourceMaps: ['pustynia_yongbi', 'gora_sohan', 'ognista_ziemia'],
  },
  {
    id: 'tarcza_tytanow',
    name: 'Tarcza Tytanów',
    category: 'armor',
    rarity: 'legendary',
    description: 'Tarcza na 81 poziom z wbudowaną odpornością na umiejętności i obrażenia.',
    levelReq: 81,
    sourceBosses: ['azrael', 'razador', 'nemere'],
    sourceMaps: ['katakumby', 'twierdza_razadora', 'straznica_nemere'],
  },

  // --- ULEPSZACZE & BIOLOG ---
  {
    id: 'kamien_duchowy',
    name: 'Kamień Duchowy',
    category: 'special',
    rarity: 'legendary',
    description: 'Niezbędny kamień do szkolenia umiejętności z poziomu G1 na poziom P. Wymaga rangi pozytywnej lub pochłania punkty rangi.',
    sourceBosses: [
      'wodz_orkow',
      'pustynny_zolw',
      'dziewiec_ogonow',
      'ognisty_krol',
      'zjawa_tygrysa',
      'krol_demonow',
      'umarly_rozpruwacz',
      'beran_setaou',
      'azrael',
      'razador',
      'nemere',
    ],
    sourceMaps: [
      'dolina_seungryong',
      'pustynia_yongbi',
      'gora_sohan',
      'ognista_ziemia',
      'swiatynia_hwang',
      'wieza_demonow',
      'grota_wygnancow_v2',
      'katakumby',
      'twierdza_razadora',
      'straznica_nemere',
    ],
  },
  {
    id: 'zwoj_blogoslawienstwa',
    name: 'Zwój Błogosławieństwa (Bodziak)',
    category: 'upgrade',
    rarity: 'epic',
    description: 'Chroni przedmiot przed zniszczeniem w przypadku nieudanego ulepszenia u kowala (obniża poziom o 1).',
    sourceBosses: ['wodz_orkow', 'dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa', 'krol_demonow', 'lord_malp'],
    sourceMaps: ['dolina_seungryong', 'gora_sohan', 'ognista_ziemia', 'swiatynia_hwang', 'wieza_demonow', 'pustynia_yongbi'],
  },
  {
    id: 'magiczny_metal',
    name: 'Magiczny Metal',
    category: 'upgrade',
    rarity: 'legendary',
    description: 'Najcenniejszy zwój ulepszania. W przypadku niepowodzenia przedmiot nie traci poziomu ulepszenia!',
    sourceBosses: ['beran_setaou', 'azrael', 'razador', 'nemere'],
    sourceMaps: ['grota_wygnancow_v2', 'katakumby', 'twierdza_razadora', 'straznica_nemere'],
  },
  {
    id: 'pazur_smoka',
    name: 'Pazur Smoka',
    category: 'upgrade',
    rarity: 'legendary',
    description: 'Elitarny ulepszacz z Berana-Setaou, niezbędny do wytwarzania zbroi i broni na 80-90+ lvl.',
    sourceBosses: ['beran_setaou'],
    sourceMaps: ['grota_wygnancow_v2'],
  },
  {
    id: 'luska_smoka',
    name: 'Łuska Smoka',
    category: 'upgrade',
    rarity: 'legendary',
    description: 'Rzadki ulepszacz ze Smoka Wodnego. Wymagany do zbroi z niebieskiej stali.',
    sourceBosses: ['beran_setaou'],
    sourceMaps: ['grota_wygnancow_v2'],
  },
  {
    id: 'zab_orka',
    name: 'Ząb Orka',
    category: 'upgrade',
    rarity: 'common',
    description: 'Przedmiot badania Biologa Chaegiraba na 30 poziom postaci.',
    sourceBosses: ['wodz_orkow', 'odrodzony_wodz_orkow'],
    sourceMaps: ['dolina_seungryong'],
  },
  {
    id: 'ksiega_klatw',
    name: 'Księga Klątw',
    category: 'upgrade',
    rarity: 'common',
    description: 'Przedmiot badania Biologa Chaegiraba na 40 poziom postaci.',
    sourceBosses: ['ezot_przyzywacz'],
    sourceMaps: ['dolina_seungryong'],
  },
  {
    id: 'pamiatka_po_demonie',
    name: 'Pamiątka po Demonie',
    category: 'upgrade',
    rarity: 'common',
    description: 'Przedmiot badania Biologa Chaegiraba na 50 poziom postaci (nagroda: +60 obrony).',
    sourceBosses: ['krol_demonow'],
    sourceMaps: ['wieza_demonow'],
  },
  {
    id: 'matowy_lod',
    name: 'Matowy Lód',
    category: 'upgrade',
    rarity: 'common',
    description: 'Przedmiot badania Biologa na 60 poziom postaci (nagroda: +50 wartości ataku).',
    sourceBosses: ['dziewiec_ogonow', 'krolowa_mrozu'],
    sourceMaps: ['gora_sohan'],
  },
  {
    id: 'konar_zelkova',
    name: 'Konar Zelkova',
    category: 'upgrade',
    rarity: 'rare',
    description: 'Przedmiot badania Biologa na 70 poziom postaci (nagroda: +10% odporności na obrażenia, +11% szybkości ruchu).',
    sourceBosses: ['zjawa_tygrysa', 'drzewo_duch'],
    sourceMaps: ['swiatynia_hwang', 'las_duchow'],
  },
  {
    id: 'certyfikat_tugyisa',
    name: 'Certyfikat Tugyisa',
    category: 'upgrade',
    rarity: 'rare',
    description: 'Przedmiot badania Biologa na 80 poziom postaci (nagroda: +10% wartości ataku, +6% szybkości ataku).',
    sourceBosses: ['ognisty_krol', 'gigant'],
    sourceMaps: ['ognista_ziemia', 'kraina_gigantow'],
  },
  {
    id: 'notatka_przywodcy',
    name: 'Notatka Przywódcy',
    category: 'upgrade',
    rarity: 'epic',
    description: 'Cenne notatki zdobywane wyłącznie z potężnych bossów do misji Biologa na 90 poziom (nagroda: +10% silny przeciwko potworom).',
    sourceBosses: [
      'wodz_orkow',
      'pustynny_zolw',
      'dziewiec_ogonow',
      'ognisty_krol',
      'zjawa_tygrysa',
      'krol_demonow',
      'umarly_rozpruwacz',
      'krolowa_pajakow',
    ],
    sourceMaps: [
      'dolina_seungryong',
      'pustynia_yongbi',
      'gora_sohan',
      'ognista_ziemia',
      'swiatynia_hwang',
      'wieza_demonow',
      'loch_pajakow_v1',
    ],
  },
  {
    id: 'bials_perla',
    name: 'Biała Perła',
    category: 'upgrade',
    rarity: 'epic',
    description: 'Cenny ulepszacz pozyskiwany z małży i elitarnych bossów do ulepszania broni i zbroi na +7/+8/+9.',
    sourceBosses: ['beran_setaou', 'niebieska_smierc', 'azrael'],
    sourceMaps: ['grota_wygnancow_v2', 'wieza_demonow', 'katakumby'],
  },
  {
    id: 'niebieska_perla',
    name: 'Niebieska Perła',
    category: 'upgrade',
    rarity: 'epic',
    description: 'Ulepszacz wymagany do ulepszania ekwipunku na wysokie poziomy.',
    sourceBosses: ['beran_setaou', 'azrael', 'razador'],
    sourceMaps: ['grota_wygnancow_v2', 'katakumby', 'twierdza_razadora'],
  },
  {
    id: 'krwawa_perla',
    name: 'Krwawa Perła',
    category: 'upgrade',
    rarity: 'epic',
    description: 'Ulepszacz wymagany przy ulepszaniu na +9.',
    sourceBosses: ['beran_setaou', 'razador', 'nemere'],
    sourceMaps: ['grota_wygnancow_v2', 'twierdza_razadora', 'straznica_nemere'],
  },

  // --- ZIOŁA, MARMURY & PRZEDMIOTY SPECJALNE ---
  {
    id: 'ziolo_trudny_loch',
    name: 'Zioło z Trudnego Lochu Małp',
    category: 'special',
    rarity: 'legendary',
    description: 'Lecznicze zioło strzeżone przez Lorda Małp. Niezbędne do wskrzeszenia Konia Militarnego (21 lvl konia).',
    sourceBosses: ['lord_malp'],
    sourceMaps: ['pustynia_yongbi'],
  },
  {
    id: 'ziolo_normalny_loch',
    name: 'Zioło z Normalnego Lochu Małp',
    category: 'special',
    rarity: 'rare',
    description: 'Zioło do wskrzeszenia Konia Bojowego (11 lvl konia).',
    sourceBosses: ['chodzaca_malpa'],
    sourceMaps: ['pustynia_yongbi'],
  },
  {
    id: 'ziolo_latwy_loch',
    name: 'Zioło z Łatwego Lochu Małp',
    category: 'special',
    rarity: 'common',
    description: 'Zioło do wskrzeszenia Konia Zwykłego (1-10 lvl konia).',
    sourceBosses: ['skalna_malpa'],
    sourceMaps: ['m2_chunya'],
  },
  {
    id: 'marmur_polimorfii',
    name: 'Marmur Polimorfii',
    category: 'special',
    rarity: 'rare',
    description: 'Zmienia postać w potwora (np. Dziki Pies, Ork, Pająk), drastycznie zwiększając siłę ataku i szybkość bicia bossów.',
    sourceBosses: ['wodz_orkow', 'odrodzony_wodz_orkow', 'ezot_przyzywacz', 'lord_malp', 'krolowa_pajakow'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'loch_pajakow_v1'],
  },
  {
    id: 'pierscien_doswiadczenia',
    name: 'Pierścień Doświadczenia (PD)',
    category: 'special',
    rarity: 'rare',
    description: 'Zwiększa ilość zdobywanego doświadczenia (EXP) o 50% przez określony czas.',
    sourceBosses: ['wodz_orkow', 'dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa', 'krol_demonow'],
    sourceMaps: ['dolina_seungryong', 'gora_sohan', 'ognista_ziemia', 'swiatynia_hwang', 'wieza_demonow'],
  },
  {
    id: 'rekawica_zlodzieja',
    name: 'Rękawica Złodzieja',
    category: 'special',
    rarity: 'epic',
    description: 'Podwaja szansę na zdobycie przedmiotów z potworów, metinów i bossów.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'krol_demonow'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'wieza_demonow'],
  },
  {
    id: 'ksiega_lidera',
    name: 'Księga Lidera',
    category: 'special',
    rarity: 'rare',
    description: 'Daje bonus +30% EXP dla wszystkich członków grupy, gdy jesteś jej liderem.',
    sourceBosses: ['dziewiec_ogonow', 'ognisty_krol', 'zjawa_tygrysa'],
    sourceMaps: ['gora_sohan', 'ognista_ziemia', 'swiatynia_hwang'],
  },
  {
    id: 'peleryna_mestwa',
    name: 'Peleryna Męstwa',
    category: 'misc',
    rarity: 'common',
    description: 'Przyciąga wszystkie potwory w pobliżu do Twojej postaci (lurowanie).',
    sourceBosses: ['wodz_orkow', 'lord_malp', 'best_kapitan'],
    sourceMaps: ['dolina_seungryong', 'pustynia_yongbi', 'm2_chunya'],
  },
  {
    id: 'kreceny_klucz',
    name: 'Kręcony Klucz',
    category: 'special',
    rarity: 'epic',
    description: 'Klucz wymagany do wejścia do Świątyni Smoka (Komnaty Berana-Setaou). Dropi z Generałów Setaou.',
    sourceBosses: ['general_yonghan', 'general_huashin'],
    sourceMaps: ['grota_wygnancow_v2'],
  },
  {
    id: 'krwisty_kamien',
    name: 'Krwisty Kamień',
    category: 'special',
    rarity: 'rare',
    description: 'Kamień będący przepustką do Groty Wygnańców (AV1).',
    sourceBosses: ['krol_demonow', 'zjawa_tygrysa'],
    sourceMaps: ['wieza_demonow', 'swiatynia_hwang'],
  },
  {
    id: 'zasuszona_glowa',
    name: 'Zasuszona Głowa',
    category: 'special',
    rarity: 'rare',
    description: 'Przepustka umożliwiająca wejście na niższe poziomy Piekielnych Katakumb do Azraela.',
    sourceBosses: ['umarly_rozpruwacz'],
    sourceMaps: ['wieza_demonow'],
  },
];

// Helper functions for search & area item autocompletion

/**
 * Returns all items associated with a specific map
 */
export function getItemsForMap(mapId: string): MetinItem[] {
  if (!mapId) return [];
  return METIN2_ITEMS_DATABASE.filter((item) => item.sourceMaps.includes(mapId));
}

/**
 * Returns autocomplete suggestions based on query and optional current map priority
 */
export function getItemSuggestions(query: string, currentMapId?: string, limit: number = 8): MetinItem[] {
  const trimmed = query.trim().toLowerCase();

  // If query is empty, return top items from current map or overall popular drops
  if (!trimmed) {
    if (currentMapId) {
      const mapItems = getItemsForMap(currentMapId);
      if (mapItems.length > 0) {
        return mapItems.slice(0, limit);
      }
    }
    return METIN2_ITEMS_DATABASE.filter((i) => i.rarity === 'legendary' || i.rarity === 'epic').slice(0, limit);
  }

  // Filter items matching query in name, category, or description
  const matching = METIN2_ITEMS_DATABASE.filter((item) => {
    const matchName = item.name.toLowerCase().includes(trimmed);
    const matchCategory = item.category.toLowerCase().includes(trimmed);
    const matchDesc = item.description.toLowerCase().includes(trimmed);
    return matchName || matchCategory || matchDesc;
  });

  // Sort prioritizing:
  // 1. Items from the current map
  // 2. Starts with query
  // 3. Legendary / Epic rarity
  matching.sort((a, b) => {
    const aCurrent = currentMapId && a.sourceMaps.includes(currentMapId) ? 1 : 0;
    const bCurrent = currentMapId && b.sourceMaps.includes(currentMapId) ? 1 : 0;
    if (aCurrent !== bCurrent) return bCurrent - aCurrent;

    const aStarts = a.name.toLowerCase().startsWith(trimmed) ? 1 : 0;
    const bStarts = b.name.toLowerCase().startsWith(trimmed) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    const rarityWeight: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0);
  });

  return matching.slice(0, limit);
}

/**
 * Check if a boss drops a specific item
 */
export function doesBossDropItem(bossId: string, bossName: string, bossDrops: string[], itemQuery: string): boolean {
  const q = itemQuery.trim().toLowerCase();
  if (!q) return true;

  // Direct drop string match
  if (bossDrops.some((d) => d.toLowerCase().includes(q))) return true;

  // Database item match
  const item = METIN2_ITEMS_DATABASE.find((it) => it.name.toLowerCase().includes(q) || it.id === q);
  if (item) {
    if (item.sourceBosses.includes(bossId)) return true;
    if (item.sourceBosses.some((b) => bossName.toLowerCase().includes(b.toLowerCase()))) return true;
  }

  return false;
}
