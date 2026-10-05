// Metin2 in-game minimap atlas texture assets
import dolinaImg from '../assets/images/metin2_dolina_seungryong_map_1789738289510.jpg';
import pustyniaImg from '../assets/images/metin2_pustynia_yongbi_map_1789738302983.jpg';
import sohanImg from '../assets/images/metin2_gora_sohan_map_1789738315279.jpg';
import ognistaImg from '../assets/images/metin2_ognista_ziemia_map_1789738328039.jpg';
import swiatyniaImg from '../assets/images/metin2_swiatynia_hwang_map_1789738340173.jpg';
import czerwonyLasImg from '../assets/images/metin2_czerwony_las_map_1789738353318.jpg';
import lochPajakowImg from '../assets/images/metin2_loch_pajakow_map_1789738370393.jpg';
import grotaImg from '../assets/images/metin2_grota_wygnancow_map_1789738387394.jpg';

// M1 & M2 Kingdom Maps
import m1ShinsooImg from '../assets/images/m1_shinsoo_map_1789827490454.jpg';
import m1ChunjoImg from '../assets/images/m1_chunjo_map_1789827504072.jpg';
import m1JinnoImg from '../assets/images/m1_jinno_map_1789827517672.jpg';
import m2ShinsooImg from '../assets/images/m2_shinsoo_map_1789827531306.jpg';
import m2ChunjoImg from '../assets/images/m2_chunjo_map_1789827545352.jpg';
import m2JinnoImg from '../assets/images/m2_jinno_map_1789827559434.jpg';

export const METIN2_MAP_TEXTURES: Record<string, string> = {
  // Neutral & High-Level
  dolina_seungryong: dolinaImg,
  pustynia_yongbi: pustyniaImg,
  oaza: pustyniaImg,
  gora_sohan: sohanImg,
  swiatynia_hwang: swiatyniaImg,
  wieza_demonow: swiatyniaImg,
  czerwony_las: czerwonyLasImg,
  loch_pajakow_v1: lochPajakowImg,
  loch_pajakow_v2: lochPajakowImg,
  grota_wygnancow_v1: grotaImg,
  grota_wygnancow_v2: grotaImg,
  ognista_ziemia: ognistaImg,

  // Miasta Pierwsze (M1)
  m1_shinsoo: m1ShinsooImg,
  m1_chunjo: m1ChunjoImg,
  m1_jinno: m1JinnoImg,

  // Miasta Drugie (M2)
  m2_shinsoo: m2ShinsooImg,
  m2_jayang: m2ShinsooImg,
  m2_chunjo: m2ChunjoImg,
  m2_bokjung: m2ChunjoImg,
  m2_jinno: m2JinnoImg,
  m2_bakra: m2JinnoImg,
};

export function getMapImageUrl(mapId: string): string | null {
  return METIN2_MAP_TEXTURES[mapId] || null;
}
