<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
//import * as ort from 'onnxruntime-web'

// Data
const pinyinToIPA: Record<string, string> = { '<sil>': '<sil>', 'de': 't ɤ', 'yi': 'i', 'shi': 'ʂ ɻ̩', 'you': 'j ou̯', 'wo': 'w o', 'bu': 'p u', 'zhe': 'ʈʂ ɤ', 'ji': 'tɕ i', 'le': 'l ɤ', 'qi': 'tɕʰ i', 'wei': 'w ei̯', 'zai': 'ts ai̯', 'ni': 'n i', 'li': 'l i', 'shen': 'ʂ ə n', 'ge': 'k ɤ', 'jiu': 'tɕ j ou̯', 'zhi': 'ʈʂ ɻ̩', 'me': 'm ɤ', 'wu': 'u', 'xiang': 'ɕ j a ŋ', 'dao': 't au̯', 'men': 'm ə n', 'ye': 'j e', 'ta': 'tʰ a', 'guo': 'k w o', 'ba': 'p a', 'zhong': 'ʈʂ ʊ ŋ', 'xian': 'ɕ j ɛ n', 'da': 't a', 'yu': 'y', 'jian': 'tɕ j ɛ n', 'lai': 'l ai̯', 'ke': 'kʰ ɤ', 'yao': 'j au̯', 'ren': 'ʐ ə n', 'shang': 'ʂ a ŋ', 'si': 's z̩', 'dian': 't j ɛ n', 'jin': 'tɕ i n', 'jing': 'tɕ i ŋ', 'jie': 'tɕ j e', 'jia': 'tɕ j a', 'xing': 'ɕ i ŋ', 'mei': 'm ei̯', 'xi': 'ɕ i', 'yuan': 'ɥ ɛ n', 'shou': 'ʂ ou̯', 'zi': 'ts z̩', 'xin': 'ɕ i n', 'qu': 'tɕʰ y', 'chu': 'ʈʂʰ u', 'di': 't i', 'fang': 'f a ŋ', 'na': 'n a', 'gong': 'k ʊ ŋ', 'xiao': 'ɕ j au̯', 'qian': 'tɕʰ j ɛ n', 'cheng': 'ʈʂʰ ə ŋ', 'hui': 'x w ei̯', 'fu': 'f u', 'sheng': 'ʂ ə ŋ', 'fa': 'f a', 'bai': 'p ai̯', 'neng': 'n ə ŋ', 'bei': 'p ei̯', 'ma': 'm a', 'chang': 'ʈʂʰ a ŋ', 'san': 's a n', 'yan': 'j ɛ n', 'ju': 'tɕ y', 'dui': 't w ei̯', 'xia': 'ɕ j a', 'zheng': 'ʈʂ ə ŋ', 'zuo': 'ts w o', 'er': 'ɚ', 'hai': 'h ai̯', 'liu': 'l j ou̯', 'ying': 'i ŋ', 'wan': 'w a n', 'bao': 'p au̯', 'shuo': 'ʂ w o', 'ling': 'l i ŋ', 'dan': 't a n', 'qing': 'tɕʰ i ŋ', 'guan': 'k w a n', 'yang': 'j a ŋ', 'dong': 't ʊ ŋ', 'zhu': 'ʈʂ u', 'xie': 'ɕ j e', 'ming': 'm i ŋ', 'ti': 'tʰ i', 'shu': 'ʂ u', 'tong': 'tʰ ʊ ŋ', 'hua': 'x w a', 'kan': 'kʰ a n', 'yin': 'i n', 'wang': 'w a ŋ', 'he': 'x ɤ', 'dou': 't ou̯', 'jiang': 'tɕ j a ŋ', 'zhen': 'ʈʂ ə n', 'duo': 't w o', 'wen': 'w ə n', 'bi': 'p i', 'jiao': 'tɕ j au̯', 'xu': 'ɕ y', 'fen': 'f ə n', 'yue': 'ɥ e', 'yong': 'j ʊ ŋ', 'ting': 'tʰ i ŋ', 'liang': 'l j a ŋ', 'tian': 'tʰ j ɛ n', 'kai': 'kʰ ai̯', 'nian': 'n j ɛ n', 'hao': 'x au̯', 'cai': 'tsʰ ai̯', 'zhan': 'ʈʂ a n', 'bian': 'p j ɛ n', 'dai': 't ai̯', 'zhang': 'ʈʂ a ŋ', 'du': 't u', 'tai': 'tʰ ai̯', 'gao': 'k au̯', 'suo': 's w o', 'ding': 't i ŋ', 'quan': 'tɕʰ ɥ ɛ n', 'jue': 'tɕ ɥ e', 'huo': 'x w o', 'lu': 'l u', 'zhao': 'ʈʂ au̯', 'nan': 'n a n', 'gai': 'k ai̯', 'ban': 'p a n', 'mu': 'm u', 'lian': 'l j ɛ n', 'gu': 'k u', 'zui': 'ts w ei̯', 'gan': 'k a n', 'an': 'a n', 'fei': 'f ei̯', 'mian': 'm j ɛ n', 'a': 'a', 'tou': 'tʰ ou̯', 'hu': 'x u', 'ru': 'ɻ u', 'ya': 'j a', 'fan': 'f a n', 'ci': 'tsʰ z̩', 'la': 'l a', 'hou': 'x ou̯', 'ran': 'ʐ a n', 'ai': 'ai̯', 'dang': 't a ŋ', 'hen': 'h ə n', 'xue': 'ɕ ɥ e', 'deng': 't ə ŋ', 'che': 'ʈʂʰ ɤ', 'feng': 'f ə ŋ', 'sui': 's w ei̯', 'ben': 'p ə n', 'bing': 'p i ŋ', 'ping': 'pʰ i ŋ', 'luo': 'l w o', 'she': 'ʂ ɤ', 'zhou': 'ʈʂ ou̯', 'bo': 'p w o', 'mi': 'm i', 'gei': 'k ei̯', 'chan': 'ʈʂʰ a n', 'biao': 'p j au̯', 'han': 'h a n', 'tu': 'tʰ u', 'yun': 'y n', 'kong': 'kʰ ʊ ŋ', 'lao': 'l au̯', 'mo': 'm w o', 'zu': 'ts u', 'que': 'tɕʰ ɥ e', 'chi': 'ʈʂʰ ɻ̩', 'zao': 'ts au̯', 'cong': 'tsʰ ʊ ŋ', 'gui': 'k w ei̯', 'zen': 'ts ə n', 'su': 's u', 'ne': 'n ɤ', 'shui': 'ʂ w ei̯', 'gou': 'k ou̯', 'liao': 'l j au̯', 'qiu': 'tɕʰ j ou̯', 'pai': 'pʰ ai̯', 'zong': 'ts ʊ ŋ', 'pin': 'pʰ i n', 'lv': 'l y', 'cha': 'ʈʂʰ a', 'ze': 'ts ɤ', 'tiao': 'tʰ j au̯', 'bie': 'p j e', 'nv': 'n y', 'zou': 'ts ou̯', 'wai': 'w ai̯', 'shao': 'ʂ au̯', 'guang': 'k w a ŋ', 'huan': 'x w a n', 'duan': 't w a n', 'geng': 'k ə ŋ', 'chuan': 'ʈʂʰ w a n', 'jun': 'tɕ y n', 'kuai': 'kʰ w ai̯', 'lie': 'l j e', 'xun': 'ɕ y n', 'gang': 'k a ŋ', 'lin': 'l i n', 'shan': 'ʂ a n', 'gen': 'k ə n', 'meng': 'm ə ŋ', 'bang': 'p a ŋ', 'zhuan': 'ʈʂ w a n', 'zhuang': 'ʈʂ w a ŋ', 'lei': 'l ei̯', 'chong': 'ʈʂʰ ʊ ŋ', 'qiang': 'tɕʰ j a ŋ', 'sai': 's ai̯', 'xuan': 'ɕ ɥ ɛ n', 'mai': 'm ai̯', 'nei': 'n ei̯', 'e': 'ɤ', 'cun': 'tsʰ w ə n', 'min': 'm i n', 'te': 'tʰ ɤ', 'ri': 'ɻ ɻ̩', 'tan': 'tʰ a n', 'suan': 's w a n', 'qin': 'tɕʰ i n', 'pian': 'pʰ j ɛ n', 'qie': 'tɕʰ j e', 'tao': 'tʰ au̯', 'can': 'tsʰ a n', 'kou': 'kʰ ou̯', 'chao': 'ʈʂʰ au̯', 'chen': 'ʈʂʰ ə n', 'en': 'ə n', 'pi': 'pʰ i', 'tuo': 'tʰ w o', 'ce': 'tsʰ ɤ', 'sha': 'ʂ a', 'tui': 'tʰ w ei̯', 'pei': 'pʰ ei̯', 'man': 'm a n', 'pa': 'pʰ a', 'diao': 't j au̯', 'rang': 'ɻ a ŋ', 'long': 'l ʊ ŋ', 'lun': 'l w ə n', 'kuang': 'kʰ w a ŋ', 'ka': 'kʰ a', 'song': 's ʊ ŋ', 'hei': 'h ei̯', 'lan': 'l a n', 'ceng': 'tsʰ ə ŋ', 'mao': 'm au̯', 'kao': 'kʰ au̯', 'cuo': 'tsʰ w o', 'tang': 'tʰ a ŋ', 'po': 'pʰ w o', 'wa': 'w a', 'peng': 'pʰ ə ŋ', 'xiu': 'ɕ j ou̯', 'ha': 'h a', 'pu': 'pʰ u', 'lou': 'l ou̯', 'zhun': 'ʈʂ w ə n', 'pan': 'pʰ a n', 'qiao': 'tɕʰ j au̯', 'pao': 'pʰ au̯', 'rong': 'ʐ ʊ ŋ', 'guai': 'k w ai̯', 'chuang': 'ʈʂʰ w a ŋ', 'ku': 'kʰ u', 'zeng': 'ts ə ŋ', 'kang': 'kʰ a ŋ', 'hang': 'x a ŋ', 'sou': 's ou̯', 'tuan': 'tʰ w a n', 'zan': 'ts a n', 'o': 'ɔ', 'se': 's ɤ', 'mou': 'm ou̯', 'ao': 'au̯', 'hong': 'x ʊ ŋ', 'xiong': 'ɕ j ʊ ŋ', 'lang': 'l a ŋ', 'huang': 'x w a ŋ', 'nong': 'n ʊ ŋ', 'tie': 'tʰ j e', 'nuo': 'n w o', 'piao': 'pʰ j au̯', 'mang': 'm a ŋ', 'nao': 'n au̯', 'cang': 'tsʰ a ŋ', 'chun': 'ʈʂʰ w ə n', 'kuan': 'kʰ w a n', 'sen': 's ə n', 'chou': 'ʈʂʰ ou̯', 'zhai': 'ʈʂ ai̯', 're': 'ɻ ɤ', 'cao': 'tsʰ au̯', 'zhui': 'ʈʂ w ei̯', 'shei': 'ʂ ei̯', 'ou': 'ou̯', 'dei': 't ei̯', 'sun': 's w ə n', 'zhuo': 'ʈʂ w o', 'ken': 'kʰ ə n', 'miao': 'm j au̯', 'hun': 'x w ə n', 'ning': 'n i ŋ', 'shuang': 'ʂ w a ŋ', 'zha': 'ʈʂ a', 'kun': 'kʰ w ə n', 'shun': 'ʂ w ə n', 'kui': 'kʰ w ei̯', 'dianr': 't j ɐʵ', 'huai': 'x w ai̯', 'qun': 'tɕʰ y n', 'fou': 'f ou̯', 'nin': 'n i n', 'niu': 'n j ou̯', 'die': 't j e', 'heng': 'h ə ŋ', 'reng': 'ɻ ə ŋ', 'leng': 'l ə ŋ', 'gua': 'k w a', 'luan': 'l w a n', 'nai': 'n ai̯', 'dun': 't w ə n', 'nu': 'n u', 'za': 'ts a', 'bin': 'p i n', 'kuo': 'kʰ w o', 'zhua': 'ʈʂ w a', 'niang': 'n j a ŋ', 'juan': 'tɕ ɥ ɛ n', 'ruo': 'ɻ w o', 'sang': 's a ŋ', 'qiong': 'tɕʰ j ʊ ŋ', 'pang': 'pʰ a ŋ', 'cu': 'tsʰ u', 'lve': 'l ɥ e', 'rui': 'ʐ w ei̯', 'niao': 'n j au̯', 'sa': 's a', 'shuai': 'ʂ w ai̯', 'teng': 'tʰ ə ŋ', 'nar': 'n äʵ', 'cui': 'tsʰ w ei̯', 'zang': 'ts a ŋ', 'sao': 's au̯', 'zun': 'ts w ə n', 'zher': 'ʈʂ ɤʵ', 'chai': 'ʈʂʰ ai̯', 'mie': 'm j e', 'kua': 'kʰ w a', 'ruan': 'ʐ w a n', 'rao': 'ʐ au̯', 'rou': 'ʐ ou̯', 'chui': 'ʈʂʰ w ei̯', 'run': 'ʐ w ə n', 'gun': 'k w ə n', 'nuan': 'n w a n', 'lia': 'l j a', 'shua': 'ʂ w a', 'diu': 't j ou̯', 'qia': 'tɕʰ j a', 'shai': 'ʂ ai̯', 'tun': 'tʰ w ə n', 'zhei': 'ʈʂ ei̯', 'fo': 'f w o', 'zuan': 'ts w a n', 'ger': 'k ɤʵ', 'beng': 'p ə ŋ', 'huir': 'x w ɚ', 'nie': 'n j e', 'ca': 'tsʰ a', 'hair': 'h ɐʵ', 'xir': 'ɕ ɚ', 'pen': 'pʰ ə n', 'seng': 's ə ŋ', 'shir': 'ʂ ɚ', 'ang': 'a ŋ', 'kuair': 'kʰ w ɐʵ', 'ga': 'k a', 'nang': 'n a ŋ', 'lo': 'l w o', 'cuan': 'tsʰ w a n', 'wanr': 'w ɐʵ', 'keng': 'kʰ ə ŋ', 'weng': 'w ə ŋ', 'chuo': 'ʈʂʰ w o', 'nvr': 'n ɥ ɚ', 'zei': 'ts ei̯', 'cou': 'tsʰ ou̯', 'cen': 'tsʰ ə n', 'shuan': 'ʂ w a n', 'chuai': 'ʈʂʰ w ai̯', 'nen': 'n ə n', 'menr': 'm ɚ', 'jiong': 'tɕ j ʊ ŋ', 'yo': 'j ɔ', 'pie': 'pʰ j e', 'weir': 'w ɚ', 'miu': 'm j ou̯', 'guanr': 'k w ɐʵ', 'yingr': 'i j ɤ̃ʵ', 'huor': 'x w ɔʵ', 'yir': 'i ɚ', 'banr': 'p ɐʵ', 'haor': 'h ɑu̯˞', 'nve': 'n ɥ e', 'gur': 'k u˞', 'zhuai': 'ʈʂ w ai̯', 'niaor': 'n j ɑu̯˞', 'tour': 'tʰ ou̯˞', 'your': 'j ou̯˞', 'jinr': 'tɕ j ɚ', 'quanr': 'tɕʰ ɥ w ɐʵ', 'pou': 'pʰ ou̯', 'yuanr': 'ɥ w ɐʵ', 'pair': 'pʰ ɐʵ', 'den': 't ə n', 'jianr': 'tɕ j ɐʵ', 'mingr': 'm j ɤ̃ʵ', 'yanr': 'j ɐʵ', 'ter': 'tʰ ɤʵ', 'cair': 'tsʰ ɐʵ', 'fenr': 'f ɚ', 'yai': 'ai̯', 'der': 't ɤʵ', 'tiaor': 'tʰ j ɑu̯˞', 'huar': 'x w ɐʵ', 'lir': 'l ɚ', 'bianr': 'p j ɐʵ', 'pianr': 'pʰ j ɐʵ', 'ganr': 'k ɐʵ', 'ker': 'kʰ ɤʵ', 'yuer': 'ɥ ɤʵ', 'benr': 'p ɚ', 'hanr': 'h ɐʵ', 'fur': 'f u˞', 'jiar': 'tɕ j ɐʵ', 'fanr': 'f ɐʵ', 'suor': 's w ɔʵ', 'guor': 'k w ɔʵ', 'wur': 'u˞', 'war': 'w ɐʵ', 'mianr': 'm j ɐʵ', 'zur': 'ts u˞', 'duir': 't w ɚ', 'qir': 'tɕʰ ɚ', 'beir': 'p ɚ', 'zhaor': 'ʈʂ ɑu̯˞', 'lunr': 'l w ɚ', 'kour': 'kʰ ou̯˞', 'tanr': 'tʰ ɐʵ', 'gunr': 'k w ɚ', 'hour': 'x ou̯˞', 'xianr': 'ɕ j ɐʵ', 'kanr': 'kʰ ɐʵ', 'dunr': 't w ɚ', 'duanr': 't w ɐʵ', 'liaor': 'l j ɑu̯˞', 'yur': 'y u˞', 'juanr': 'tɕ ɥ w ɐʵ', 'paor': 'pʰ ɑu̯˞', 'geir': 'k ɚ', 'genr': 'k ɚ', 'zhengr': 'ʈʂ ɤ̃ʵ', 'daor': 't ɑu̯˞', 'pur': 'pʰ u˞', 'yangr': 'j ɑ̃ʵ', 'zhir': 'ʈʂ ɚ', 'shuor': 'ʂ w ɔʵ', 'ei': 'ei̯', 'xuer': 'ɕ ɥ ɤʵ', 'dir': 't ɚ', 'zhunr': 'ʈʂ w ɚ', 'mar': 'm ɐʵ', 'xiaor': 'ɕ j ɑu̯˞', 'dia': 't j a', 'dar': 't ɐʵ', 'feir': 'f ɚ', 'biaor': 'p j ɑu̯˞', 'cunr': 'tsʰ w ɚ', 'cir': 'tsʰ ɚ', 'zhur': 'ʈʂ u˞', 'xingr': 'ɕ j ɤ̃ʵ', 'shur': 'ʂ u˞', 'jingr': 'tɕ j ɤ̃ʵ', 'shour': 'ʂ ou̯˞', 'juer': 'tɕ ɥ ɤʵ', 'shengr': 'ʂ ɤ̃ʵ', 'naor': 'n ɑu̯˞', 'tianr': 'tʰ j ɐʵ', 'liur': 'l j ou̯ʵ', 'zhour': 'ʈʂ ou̯˞', 'qianr': 'tɕʰ j ɐʵ', 'xier': 'ɕ j ɛʵ', 'langr': 'l ɑ̃ʵ', 'yunr': 'y w ɚ', 'ler': 'l ɤʵ', 'lianr': 'l j ɐʵ', 'eng': 'ə ŋ', 'huanr': 'x w ɐʵ', 'niur': 'n j ou̯ʵ', 'shaor': 'ʂ ɑu̯˞', 'far': 'f ɐʵ', 'meir': 'm ɚ', 'bar': 'p ɐʵ', 'wangr': 'w ɑ̃ʵ', 'jir': 'tɕ ɚ', 'gaor': 'k ɑu̯˞', 'tuor': 'tʰ w ɔʵ', 'renr': 'ʐ ɚ', 'her': 'h ɤʵ', 'qiur': 'tɕʰ j ou̯ʵ', 'jiur': 'tɕ j ou̯ʵ', 'qur': 'tɕʰ u˞', 'jur': 'tɕ u˞', 'jiangr': 'tɕ j ɑ̃ʵ', 'char': 'ʈʂʰ ɐʵ', 'zaor': 'ts ɑu̯˞', 'chuanr': 'ʈʂʰ w ɐʵ', 'cher': 'ʈʂʰ ɤʵ', 'chenr': 'ʈʂʰ ɚ', 'dair': 't ɐʵ', 'lanr': 'l ɐʵ', 'lar': 'l ɐʵ', 'liar': 'l j ɐʵ', 'bor': 'p w ɔʵ', 'zhuor': 'ʈʂ w ɔʵ', 'bangr': 'p ɑ̃ʵ', 'mur': 'm u˞', 'mour': 'm ou̯˞', 'air': 'ai̯ ɚ', 'hur': 'x u˞', 'tunr': 'tʰ w ɚ', 'mor': 'm w ɔʵ', 'fangr': 'f ɑ̃ʵ', 'wor': 'w ɔʵ', 'shuir': 'ʂ w ɚ', 'wenr': 'w ɚ', 'duor': 't w ɔʵ', 'sher': 'ʂ ɤʵ', 'tir': 'tʰ ɚ', 'sunr': 's w ɚ', 'sanr': 's ɐʵ', 'tuir': 'tʰ w ɚ', 'gair': 'k ɐʵ', 'zir': 'ts ɚ', 'dur': 't u˞', 'guar': 'k w ɐʵ', 'taor': 'tʰ ɑu̯˞', 'caor': 'tsʰ ɑu̯˞', 'tur': 'tʰ u˞', 'longr': 'l w ɤ̃ʵ', 'nuanr': 'n w ɐʵ', 'tei': 'tʰ ei̯', 'bir': 'p ɚ', 'mair': 'm ɐʵ', 'nanr': 'n ɐʵ', 'nir': 'n ɚ', 'nianr': 'n j ɐʵ', 'zhuangr': 'ʈʂ w ɑ̃ʵ', 'niangr': 'n j ɑ̃ʵ', 'miaor': 'm j ɑu̯˞', 'maor': 'm ɑu̯˞', 'anr': 'spn', 'ng': 'ŋ', 'guair': 'k w ɐʵ', 'gour': 'k ou̯˞', 'fengr': 'f ɤ̃ʵ', 'tongr': 'tʰ w ɤ̃ʵ', 'manr': 'm ɐʵ', 'ruor': 'ʐ w ɔʵ', 'hangr': 'h ɑ̃ʵ', 'yer': 'j ɤʵ', 'danr': 't ɐʵ', 'yaor': 'j ɑu̯˞', 'sar': 's ɐʵ', 'yongr': 'j w ɤ̃ʵ', 'shanr': 'ʂ ɐʵ', 'rangr': 'ʐ ɑ̃ʵ', 'xunr': 'ɕ w ɚ', 'diaor': 't j ɑu̯˞', 'qunr': 'tɕʰ w ɚ', 'din': 't i n', 'dour': 't ou̯˞', 'chur': 'ʈʂʰ u˞', 'qinr': 'tɕʰ j ɚ', 'qingr': 'tɕʰ j ɤ̃ʵ', 'chunr': 'ʈʂʰ w ɚ', 'shuar': 'ʂ w ɐʵ', 'lair': 'l ɐʵ', 'por': 'pʰ w ɔʵ', 'hengr': 'x ɤ̃ʵ', 'chongr': 'ʈʂʰ w ɤ̃ʵ', 'pir': 'pʰ ɚ', 'xiar': 'ɕ j ɐʵ', 'songr': 's w ɤ̃ʵ', 'pingr': 'pʰ j ɤ̃ʵ' }
const ipaToToken: Record<string, number> = { '<sil>': 1, 'n': 8, 'a': 4, 'j': 18, 'ŋ': 5, 'i': 24, 'w': 3, 'ɤ': 29, 't': 10, 'ʂ': 14, 'ə': 15, 'tɕ': 23, 'u': 32, 'l': 17, 'ʈʂ': 6, 'ou̯': 7, 'ɕ': 11, 'au̯': 26, 'p': 36, 'ɛ': 19, 'o': 37, 'ei̯': 30, 'ai̯': 40, 'k': 2, 'm': 38, 'ʐ̩': 16, 'tɕʰ': 31, 'ts': 44, 'tʰ': 22, 'ʊ': 27, 'e': 13, 'h': 39, 'ʈʂʰ': 42, 'y': 9, 'f': 25, 's': 20, 'x': 35, 'kʰ': 28, 'ɻ̩': 48, 'ɥ': 12, 'ɹ̩': 21, 'ɻ': 33, 'tsʰ': 47, 'pʰ': 34, 'ʐ': 46, 'z̩': 56, 'aɚ̯': 41, 'ɚ': 43, 'ɐʵ': 45, 'ɔ': 51, 'ɤʵ': 52, 'ɑu̯˞': 53, 'u˞': 57, 'ɤ̃ʵ': 50, 'ɔʵ': 54, 'ou̯˞': 49, 'ɑ̃ʵ': 58, 'ou̯ʵ': 55, 'äʵ': 61, 'ɛʵ': 59, 'spn': 60 }
const excluded_syllables: string[] = ["lo", "din", "<sil>", "lia", "den", "ei", "yo", "o", "ng", "eng", "tei", "dia"]
// UI: 0, 1, 2, 3, network: 2, 3, 4, 5
// padding=0, silence=1, tone_1=2, tone_2=3, tone_3=4, tone_4=5
const toneToId: Record<number, number> = { 0: 2, 1: 3, 2: 4, 3: 5 }
const models: Record<string, Record<string, string>> = {
  "Low": { "fileName": "lightspeech_new_small_hifigan_lj_ft_t2_v2.onnx", "fileSize": "10.5MB", "tts": "LightSpeech (small)", "vocoder": "HiFi-GAN (lj_ft_v2)" },
  "Medium": { "fileName": "lightspeech_new_hifigan_lj_ft_t2_v2.onnx", "fileSize": "29.3MB", "tts": "LightSpeech", "vocoder": "HiFi-GAN (lj_ft_v2)" },
  "High": { "fileName": "lightspeech_new_hifigan_lj_ft_t2_v1.onnx", "fileSize": "81.3MB", "tts": "LightSpeech", "vocoder": "HiFi-GAN (lj_ft_v1)" },
};
const chosenModel = ref<string>("Medium");

// State
const audioContext = ref<AudioContext | null>(null)
const audioSource = ref<AudioBufferSourceNode | null>(null)
const ortSession = ref<ort.InferenceSession | null>(null)
const curAudio = ref<Float32Array | null>(null)
const nextAudio = ref<Float32Array | null>(null)
const wrongAudio = ref<Float32Array | null>(null)
const curGame = ref<any[]>([])

enum GameStages {
  NOT_STARTED = 0,
  STARTED = 1,
  FINISHED = 2,
}
const gameStage = ref<GameStages>(GameStages.NOT_STARTED)
const numExercises = ref(10)
const tones = ref<boolean[][]>([[true, true, true, true], [true, true, true, true]])
const syllables = ref<Array<{ predicted: number | null; totalCorrect: number }>>([
  { predicted: null, totalCorrect: 0 },
  { predicted: null, totalCorrect: 0 }
])
const correctWords = ref(0)
const debugInformation = ref(false)
const confusionMatrices = ref(Array(2).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(0))))
const curQuestion = ref(0)
const startTimeQuiz = ref(0)
const startTimeWord = ref(0)
const elapsedTimeWords = ref<number[]>([])
const elapsedTimeQuiz = ref(0)
const validSyllables = ref<string[]>([])
const tonePairs = ref<[number, number][]>([])
const loadingGame = ref<boolean>(false)
const modelLoadingText = ref<string>("Loading...")


// Computed
const progressPercentage = computed(() => Math.round(100 * (curQuestion.value + 1) / numExercises.value))

// Methods
const getValidSyllables = () => {
  return Object.keys(pinyinToIPA).filter(
    (k) => !(k.endsWith("r") && k !== "er") && !excluded_syllables.includes(k)
  )
}

const generateTonePairs = (tones1: number[], tones2: number[]): [number, number][] => {
  return tones1.flatMap((i) =>
    tones2.map((j) => [i, j] as [number, number])
  ).filter(([i, j]) => i !== 2 || j !== 2)
}

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const prepareWordForPrediction = (word0: string, word1: string, tone0: number, tone1: number) => {
  const ipa0 = pinyinToIPA[word0]
  const ipa1 = pinyinToIPA[word1]
  const toneId0 = toneToId[tone0]
  const toneId1 = toneToId[tone1]
  const sil = ipaToToken["<sil>"]

  const tokens = [sil,
    ...ipa0.split(' ').map(k => ipaToToken[k]),
    ...ipa1.split(' ').map(k => ipaToToken[k]),
    sil
  ]

  const tone_ids = [1,
    ...Array(ipa0.split(' ').length).fill(toneId0),
    ...Array(ipa1.split(' ').length).fill(toneId1),
    1
  ]

  return [tokens, tone_ids]
}

const copyToClipboard = () => {
  const exportElement = document.getElementById('exportText')
  if (!exportElement) return

  const textContent = exportElement.innerText.replace(/<br\s*\/?>/gi, '\n')
  navigator.clipboard.writeText(textContent)
    .then(() => alert('Copied to clipboard'))
    .catch(() => alert('Cannot copy'))
}

const playAudio = async (audioData: Float32Array | null) => {
  if (gameStage.value == GameStages.NOT_STARTED)
    return
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  if (!audioData) {
    console.error('No audio data to play.')
    return
  }

  try {
    const buffer = audioContext.value.createBuffer(1, audioData.length, 22050)
    buffer.getChannelData(0).set(audioData)

    if (audioSource.value) {
      audioSource.value.stop()
    }

    audioSource.value = audioContext.value.createBufferSource()
    audioSource.value.buffer = buffer
    audioSource.value.connect(audioContext.value.destination)
    audioSource.value.start()
  } catch (error) {
    console.error('Error playing audio:', error)
  }
}

const cleanupAudio = () => {
  if (audioSource.value) {
    audioSource.value.stop()
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
  audioContext.value = null
  audioSource.value = null
}

const resetQuiz = () => {
  gameStage.value = GameStages.NOT_STARTED
  cleanupAudio()
}

const setAnswer = (predictedTone: number, syllableNum: number) => {
  syllables.value[syllableNum].predicted = predictedTone
  generateWrongAnswer()
}

const generateQuestion = async () => {
  const word0 = getRandomElement(validSyllables.value)
  const word1 = getRandomElement(validSyllables.value)
  const [tone0, tone1] = getRandomElement(tonePairs.value)
  const [tokens, tone_ids] = prepareWordForPrediction(word0, word1, tone0, tone1)
  curGame.value.push({ word0, word1, tone0, tone1 });

  if (curGame.value.length === 1) {
    curAudio.value = await predictAudio(tokens, tone_ids);
  } else {
    nextAudio.value = null
    nextAudio.value = await predictAudio(tokens, tone_ids);
  }
}

const generateWrongAnswer = async () => {
  const predictedTone0 = syllables.value[0].predicted
  const predictedTone1 = syllables.value[1].predicted

  if (predictedTone0 === null || predictedTone1 === null) {
    return;
  }
  const groundTruthTone0 = curGame.value[curQuestion.value]["tone0"]
  const groundTruthTone1 = curGame.value[curQuestion.value]["tone1"]

  if ((groundTruthTone0 === predictedTone0) && (predictedTone1 === groundTruthTone1)) {
    return;
  }
  const word0 = curGame.value[curQuestion.value]["word0"]
  const word1 = curGame.value[curQuestion.value]["word1"]

  const [tokens, tone_ids] = prepareWordForPrediction(word0, word1, predictedTone0, predictedTone1)

  wrongAudio.value = await predictAudio(tokens, tone_ids);
  // prediction took too long
  if ((predictedTone0 !== syllables.value[0].predicted) || (predictedTone1 !== syllables.value[1].predicted))
    wrongAudio.value = null
}

const setNextQuestion = async () => {
  wrongAudio.value = null;

  let totalCorrect = true
  for (let i = 0; i < syllables.value.length; i++) {
    const groundTruthTone = curGame.value[curQuestion.value][`tone${i}`]
    const predictedTone = syllables.value[i].predicted
    if (predictedTone === null) continue

    const isCorrect = groundTruthTone === predictedTone
    totalCorrect = totalCorrect && isCorrect
    syllables.value[i].totalCorrect += Number(isCorrect)
    confusionMatrices.value[i][groundTruthTone][predictedTone]++

    syllables.value[i].predicted = null
  }
  correctWords.value += Number(totalCorrect)

  elapsedTimeWords.value.push((Date.now() - startTimeWord.value) / 1000)
  startTimeWord.value = Date.now()
  elapsedTimeQuiz.value = (Date.now() - startTimeQuiz.value) / 1000

  if (curQuestion.value === numExercises.value - 1) {
    gameStage.value = GameStages.FINISHED;
  } else {
    curQuestion.value++;

    // Use the preloaded audio
    if (nextAudio.value) {
      curAudio.value = nextAudio.value;
      playAudio(curAudio.value);
    }

    // Generate the next question (and preload its audio) if not at the end
    if (curQuestion.value < numExercises.value - 1) {
      await generateQuestion();
    }
  }
}

const initializeOrtSession = async () => {
  if (ortSession.value)
    return;
  try {
    const ort = await import('onnxruntime-web');
    ort.env.wasm.wasmPaths = `${window.location.origin}/assets/`;
    ort.env.wasm.proxy = true;
    const modelPath = `${window.location.origin}/assets/${models[chosenModel.value]['fileName']}`;
    ortSession.value = await ort.InferenceSession.create(modelPath);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const startQuiz = async () => {
  loadingGame.value = true

  try {
    await initializeOrtSession()
  } catch {
    modelLoadingText.value = "Failed to initialize ONNX session";
    return;
  }
  curAudio.value = null
  wrongAudio.value = null
  curQuestion.value = 0
  syllables.value.forEach(syllable => {
    syllable.totalCorrect = 0
    syllable.predicted = null
  })
  correctWords.value = 0
  confusionMatrices.value = Array(2).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(0)))
  elapsedTimeWords.value = []
  tonePairs.value = generateTonePairs(boolToIndex(tones.value[0]), boolToIndex(tones.value[1]))
  curGame.value = []
  await generateQuestion();

  loadingGame.value = false
  gameStage.value = GameStages.STARTED
  startTimeQuiz.value = Date.now();
  startTimeWord.value = Date.now();

  playAudio(curAudio.value);

  // Preload the second question
  await generateQuestion();
}

const boolToIndex = (booleanArray: boolean[]): number[] => {
  return booleanArray.map((value, index) => (value ? index : -1)).filter(index => index !== -1);
}

const predictAudio = async (tokens: number[], tones: number[]): Promise<Float32Array> => {
  if (!ortSession.value) {
    console.error('ONNX Runtime session not initialized')
    return new Float32Array()
  }

  try {
    const speaker_id = [218]

    const tokenTensor = new ort.Tensor('int64', BigInt64Array.from(tokens.map(BigInt)), [1, tokens.length])
    const toneTensor = new ort.Tensor('int64', BigInt64Array.from(tones.map(BigInt)), [1, tones.length])
    const speakerTensor = new ort.Tensor('int64', BigInt64Array.from(speaker_id.map(BigInt)), [1])

    const feeds = { 'speakers': speakerTensor, 'tokens': tokenTensor, 'tones': toneTensor }

    const results = await ortSession.value.run(feeds)
    return results['output'].data as Float32Array
  } catch (error) {
    console.error('Error running model:', error)
    throw error
  }
}

// Lifecycle hooks
onMounted(async () => {
  validSyllables.value = getValidSyllables()
})

onUnmounted(cleanupAudio)
</script>
<template>
  <div class="container py-5">
    <main class="form-signin m-auto">
      <h1 class="mb-4">Mandarin Tone Trainer</h1>
      <hr class="mb-4">

      <!-- Game Stage Header -->
      <h4 class="mb-4">
        <template v-if="gameStage === GameStages.STARTED">Select the correct tones</template>
        <template v-else-if="gameStage === GameStages.FINISHED">Evaluation</template>
        <template v-else>Settings</template>
      </h4>

      <!-- Progress Bar (for active game) -->
      <div v-if="gameStage === GameStages.STARTED" class="mb-4">
        <div class="d-flex justify-content-between mb-2">
          <div>Progress:</div>
          <div>Word: {{ curQuestion + 1 }} / {{ numExercises }}</div>
        </div>
        <div class="progress">
          <div class="progress-bar" role="progressbar" :style="{ 'width': progressPercentage + '%' }"
            :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>

      <!-- Settings -->
      <div v-if="gameStage == GameStages.NOT_STARTED">
        <div class="mb-4">
          <div class="row">
            <div class="col-md-6" v-for="(syllable, syllable_num) in syllables" :key="syllable_num">
              <label class="form-label">Syllable {{ syllable_num + 1 }}:</label>
              <div>
                <div class="form-check form-check-inline" v-for="n in tones[syllable_num].length" :key="n">
                  <input class="form-check-input" type="checkbox" :id="`checkbox_${syllable_num}_${n - 1}`"
                    v-model="tones[syllable_num][n - 1]">
                  <label class="form-check-label" :for="`checkbox_${syllable_num}_${n - 1}`">Tone {{ n }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="numExercises" class="form-label">Number of Exercises:</label>
              <select id="numExercises" class="form-select" v-model="numExercises">
                <option v-for="n in [10, 25, 50, 75, 100]" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label for="chosenModel" class="form-label">Audio Quality:</label>
              <select id="chosenModel" class="form-select" v-model="chosenModel">
                <option v-for="(file, quality) in models" :key="quality" :value="quality">{{ quality }}</option>
              </select>
            </div>
          </div>
        </div>


        <button class="btn btn-outline-light w-100 py-2" @click="startQuiz()">Start Quiz</button>

        <!-- Full-page Loading Overlay -->
        <div v-if="loadingGame" class="loading-overlay">
          <div class="text-center">

            <div class="spinner-border text-light" role="status">
            </div>
            <p class="mt-1 text-light">{{ modelLoadingText }}</p>
          </div>
        </div>
      </div>

      <!-- Active Game -->
      <div v-else-if="gameStage === GameStages.STARTED">

        <div class="d-flex justify-content-center gap-2 mb-4">
          <button type="button" class="btn btn-lg btn-success" @click="playAudio(curAudio)">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play"
              viewBox="0 0 16 16">
              <path
                d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z">
              </path>
            </svg>
          </button>
          <button type="button" :class="`btn btn-lg btn-danger ${wrongAudio === null ? 'disabled' : ''}`"
            @click="playAudio(wrongAudio)">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play"
              viewBox="0 0 16 16">
              <path
                d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z">
              </path>
            </svg>
          </button>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 mb-3" v-for="(syllable, syllable_num) in syllables" :key="syllable_num">
            <div class="d-flex flex-column align-items-center border rounded p-3">
              <h6 class="mb-3">Syllable {{ syllable_num + 1 }}</h6>
              <div class="d-flex flex-column align-items-center w-100">
                <button v-for="(tone, tone_num) in tones[syllable_num]" :key="tone_num"
                  :disabled="!tone || syllable.predicted !== null" :class="[
                    'btn mb-2 w-75',
                    {
                      'btn-success': syllable.predicted !== null && curGame[curQuestion][`tone${syllable_num}`] === tone_num,
                      'btn-danger': syllable.predicted === tone_num && curGame[curQuestion][`tone${syllable_num}`] !== tone_num,
                      'btn-outline-light': syllable.predicted === null || (syllable.predicted !== tone_num && curGame[curQuestion][`tone${syllable_num}`] !== tone_num)
                    }
                  ]" @click="setAnswer(tone_num, syllable_num)">
                  {{ curGame[curQuestion][`word${syllable_num}`] }}{{ tone_num + 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-outline-light" @click="resetQuiz()" style="width: 200px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-arrow-repeat" viewBox="0 0 16 16">
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
              <path fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
            </svg>
            Restart
          </button>
          <button
            :class="`btn btn-outline-light ${(syllables[0].predicted == null) || (syllables[1].predicted == null) || !nextAudio ? 'disabled' : ''}`"
            @click="setNextQuestion()" style="width: 200px;">
            {{ (curQuestion == numExercises - 1) ? 'Finish' : 'Next' }}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Evaluation -->
      <div v-else>
        <div class="row mb-3 mt-4">
          <h6>You finished this quiz in {{ (elapsedTimeQuiz / 60).toFixed(2) }} minutes ({{
            (elapsedTimeWords.reduce((a, b) =>
              (a + b)) / elapsedTimeWords.length).toFixed(2) }} sec/word).</h6>
        </div>

        <div class="row text-center mb-3">
          <div class="col">
            <h5>Word</h5>
            <svg width="100" viewBox="0 0 20 20" class="stat-circle">
              <circle cx="10" cy="10" r="8" class="bg"></circle>
              <circle cx="10" cy="10" r="8" class="progress"
                :style="{ 'stroke-dashoffset': Math.round(-51 - (51 * correctWords / numExercises)) + 'px' }"></circle>
              <text x="50%" y="55%">{{ Math.round(100 * correctWords / numExercises) }}%</text>
            </svg>
          </div>

          <div class="col" v-for="(syllable, syllable_num) in syllables">
            <h5>Syllable {{ syllable_num + 1 }}</h5>
            <svg width="100" viewBox="0 0 20 20" class="stat-circle">
              <circle cx="10" cy="10" r="8" class="bg"></circle>
              <circle cx="10" cy="10" r="8" class="progress"
                :style="{ 'stroke-dashoffset': Math.round(-51 - (51 * syllables[syllable_num]['totalCorrect'] / numExercises)) + 'px' }">
              </circle>
              <text x="50%" y="55%">{{ Math.round(100 * syllables[syllable_num]["totalCorrect"] /
                numExercises) }}%</text>
            </svg>
          </div>
        </div>

        <div class="row mb-3 mt-4">
          <h6><b>{{ correctWords }}</b> out of <b>{{ numExercises }}</b> words were correct.
            <template v-if="correctWords == numExercises">
              You made no mistakes. Congratulations!
            </template>
            <template v-else-if="syllables[0]['totalCorrect'] == syllables[1]['totalCorrect']">
              You made the same number of mistakes on both the first and the second syllable.
            </template>
            <template v-else>
              Most of your mistakes are with the <b>{{ syllables[0]['totalCorrect'] > syllables[1]['totalCorrect'] ?
                'second' : 'first' }}</b> syllable.
            </template>
          </h6>
        </div>

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">Export results</h1>
              </div>
              <div class="modal-body" id="exportText">
                General<br>
                --------<br>
                Number of words: {{ numExercises }}<br>
                Selected tones: {{ boolToIndex(tones[0]).toString() }} and {{ boolToIndex(tones[1]).toString() }}<br>
                Elapsed time: {{ (elapsedTimeQuiz / 60).toFixed(2) }} minutes ({{ (elapsedTimeWords.reduce((a, b) =>
                  (a + b)) /
                  elapsedTimeWords.length).toFixed(2) }} sec/word)<br>
                <br>
                Word/Syllables<br>
                ----------------<br>
                Word acc: {{ 100 * correctWords / numExercises }}%<br>
                <template v-for="(syllable, syllable_num) in syllables">
                  Syllable {{ syllable_num + 1 }} acc: {{ 100 * syllables[syllable_num]["totalCorrect"] / numExercises
                  }}%<br>
                </template>
                <template v-if="debugInformation">
                  <br>
                  Debug information<br>
                  --------------------<br>

                  Confusion matrices: {{ confusionMatrices }}
                  <br>
                  Words: {{ curGame.map(obj => `${obj.word0}${obj.tone0} ${obj.word1}${obj.tone1}`) }}
                  <br>
                  Elapsed time by word: {{ elapsedTimeWords }}
                </template>
              </div>
              <div class="modal-footer d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <input class="form-check-input" type="checkbox" id="moreDetailCheckbox" v-model="debugInformation">
                  <label class="form-check-label ms-2" for="moreDetailCheckbox">Debug information</label>
                </div>
                <div>
                  <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal"><svg
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                      viewBox="0 0 16 16">
                      <path
                        d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg> Close</button>
                  <button type="button" class="btn btn-outline-light" @click="copyToClipboard()"><svg
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy"
                      viewBox="0 0 16 16">
                      <path fill-rule="evenodd"
                        d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                    </svg> Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-outline-light" @click="resetQuiz()" style="width: 200px"><svg
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat"
              viewBox="0 0 16 16">
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
              <path fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
            </svg> Play Again</button>
          <button class="col-md-3 btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#exampleModal"
            style="width: 200px">Export
            results</button>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-5 pt-3 border-top text-muted">
        <div v-if="gameStage === GameStages.NOT_STARTED" class="d-flex justify-content-between">
          <div>
            Model: {{ models[chosenModel]["tts"] }} + {{ models[chosenModel]["vocoder"] }}
          </div>
          <div>
            file size: {{ models[chosenModel]["fileSize"] }}
          </div>
        </div>
        <div v-else-if="gameStage === GameStages.STARTED" class="d-flex justify-content-between">
          <div>
            Syllable accuracy: {{ curQuestion == 0 ? 100 : Math.round(100 * (syllables[0]["totalCorrect"] +
              syllables[1]["totalCorrect"]) / (2 * curQuestion)) }}%
          </div>
          <div>
            Word accuracy: {{ curQuestion == 0 ? 100 : Math.round(100 * correctWords / curQuestion) }}%
          </div>
        </div>
      </footer>

    </main>
  </div>
</template>